import { useState, useEffect } from "react";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Movies");

  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [movies, setMovies] = useState([]);

  const [movieForm, setMovieForm] = useState({ title: "", genre: "" });
  const [cityForm, setCityForm] = useState({ name: "" });
  const [theatreForm, setTheatreForm] = useState({ name: "", cityId: "" });
  const [scheduleForm, setScheduleForm] = useState({
    movieId: "", cityId: "", theatreId: "", showDate: "", showNumber: "1", showTime: "", endTime: "", normalPrice: "", premiumPrice: "", executivePrice: ""
  });

const API_BASE = "http://localhost:8080/api";
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, tRes, mRes] = await Promise.all([
        fetch(`${API_BASE}/Cities`), fetch(`${API_BASE}/Theatres`), fetch(`${API_BASE}/Movies`)
      ]);
      setCities(await cRes.json());
      setTheatres(await tRes.json());
      setMovies(await mRes.json());
    } catch (error) {
      console.error("Data error:", error);
    }
  };

  const handleAddMovie = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/Movies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(movieForm) });
    setMovieForm({ title: "", genre: "" });
    fetchData();
  };

  // Naya Toggle Logic
  const toggleMovie = async (id) => {
    await fetch(`${API_BASE}/Movies/toggle/${id}`, { method: "PUT" });
    fetchData();
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/Cities`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cityForm) });
    if (!res.ok) { alert(await res.text()); return; } // Duplicate City error dikhayega
    setCityForm({ name: "" });
    fetchData(); 
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/Theatres`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: theatreForm.name, cityId: parseInt(theatreForm.cityId) }) });
    setTheatreForm({ name: "", cityId: "" });
    fetchData();
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    // Convert time strings to full DateTime for backend comparison
    const datePrefix = scheduleForm.showDate + "T";
    const payload = {
      ...scheduleForm,
      movieId: parseInt(scheduleForm.movieId),
      theatreId: parseInt(scheduleForm.theatreId),
      showNumber: parseInt(scheduleForm.showNumber),
      showTime: datePrefix + scheduleForm.showTime + ":00", // Start Time
      endTime: datePrefix + scheduleForm.endTime + ":00",   // End Time
      normalPrice: parseInt(scheduleForm.normalPrice),
      premiumPrice: parseInt(scheduleForm.premiumPrice),
      executivePrice: parseInt(scheduleForm.executivePrice)
    };

    const res = await fetch(`${API_BASE}/ShowSchedules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      alert(await res.text()); // Clash error dikhayega
    } else {
      alert("📅 Show Scheduled Successfully!");
      fetchData();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>⚙️ Super Admin Dashboard</h2>

      <div style={styles.tabContainer}>
        {["Movies", "Cities", "Theatres", "Schedules"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tabButton, backgroundColor: activeTab === tab ? "#3498db" : "#ecf0f1", color: activeTab === tab ? "white" : "#2c3e50" }}>{tab}</button>
        ))}
      </div>

      <div style={styles.card}>
        {/* TAB 1: MOVIES WITH LIST */}
        {activeTab === "Movies" && (
          <>
            <form onSubmit={handleAddMovie} style={styles.formGrid}>
              <h3 style={styles.fullWidth}>🎬 Add New Movie</h3>
              <input placeholder="Movie Title" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} style={styles.input} required />
              <input placeholder="Genre" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Save Movie</button>
            </form>
            
            <h3 style={{marginTop: '30px', color: '#2c3e50'}}>🎥 Movie Database</h3>
            <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Title</th><th style={styles.th}>Genre</th><th style={styles.th}>Home Page Status</th></tr></thead>
              <tbody>
                {movies.map(m => (
                  <tr key={m.id}>
                    <td style={styles.td}>{m.id}</td><td style={styles.td}>{m.title}</td><td style={styles.td}>{m.genre}</td>
                    <td style={styles.td}>
                      <button onClick={() => toggleMovie(m.id)} style={{...styles.toggleBtn, backgroundColor: m.isActive ? '#2ecc71' : '#e74c3c'}}>
                        {m.isActive ? 'Active (Hide)' : 'Hidden (Show)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* TAB 2: CITIES WITH LIST */}
        {activeTab === "Cities" && (
          <>
            <form onSubmit={handleAddCity} style={styles.formGrid}>
              <h3 style={styles.fullWidth}>🌆 Add New City</h3>
              <input placeholder="City Name" value={cityForm.name} onChange={(e) => setCityForm({ name: e.target.value })} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Save City</button>
            </form>

            <h3 style={{marginTop: '30px', color: '#2c3e50'}}>🏙️ Registered Cities</h3>
            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              {cities.map(c => <span key={c.id} style={styles.badge}>{c.name}</span>)}
            </div>
          </>
        )}

        {/* TAB 3: THEATRES */}
        {activeTab === "Theatres" && (
          <form onSubmit={handleAddTheatre} style={styles.formGrid}>
            <h3 style={styles.fullWidth}>🏢 Add Theatre to a City</h3>
            <select value={theatreForm.cityId} onChange={(e) => setTheatreForm({ ...theatreForm, cityId: e.target.value })} style={styles.input} required>
              <option value="">Select City...</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Theatre Name" value={theatreForm.name} onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.submitBtn}>Save Theatre</button>
          </form>
        )}

        {/* TAB 4: SCHEDULES (WITH START AND END TIME) */}
        {activeTab === "Schedules" && (
          <form onSubmit={handleAddSchedule} style={styles.formGrid}>
            <h3 style={styles.fullWidth}>📅 Schedule a Movie</h3>
            <select value={scheduleForm.movieId} onChange={(e) => setScheduleForm({ ...scheduleForm, movieId: e.target.value })} style={styles.input} required>
              <option value="">1. Select Movie...</option>
              {movies.filter(m => m.isActive).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>

            <select value={scheduleForm.cityId} onChange={(e) => setScheduleForm({ ...scheduleForm, cityId: e.target.value, theatreId: "" })} style={styles.input} required>
              <option value="">2. Filter by City...</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={scheduleForm.theatreId} onChange={(e) => setScheduleForm({ ...scheduleForm, theatreId: e.target.value })} style={{...styles.input, gridColumn: "1 / -1"}} required disabled={!scheduleForm.cityId}>
              <option value="">3. Select Theatre...</option>
              {theatres.filter(t => t.cityId.toString() === scheduleForm.cityId).map((t) => (
                <option key={t.id} value={t.id}>{t.name} (ID: {t.uniqueId})</option>
              ))}
            </select>

            <input type="date" value={scheduleForm.showDate} onChange={(e) => setScheduleForm({ ...scheduleForm, showDate: e.target.value })} style={styles.input} required />
            <select value={scheduleForm.showNumber} onChange={(e) => setScheduleForm({ ...scheduleForm, showNumber: e.target.value })} style={styles.input} required>
              <option value="1">1st Show</option><option value="2">2nd Show</option><option value="3">3rd Show</option><option value="4">4th Show</option>
            </select>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Time</label>
              <input type="time" value={scheduleForm.showTime} onChange={(e) => setScheduleForm({ ...scheduleForm, showTime: e.target.value })} style={styles.input} required />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>End Time</label>
              <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} style={styles.input} required />
            </div>

            <h4 style={{ ...styles.fullWidth, margin: "10px 0 0 0", color: "#7f8c8d" }}>Tiered Pricing (₹)</h4>
            <input type="number" placeholder="Normal" value={scheduleForm.normalPrice} onChange={(e) => setScheduleForm({ ...scheduleForm, normalPrice: e.target.value })} style={styles.input} required />
            <input type="number" placeholder="Premium" value={scheduleForm.premiumPrice} onChange={(e) => setScheduleForm({ ...scheduleForm, premiumPrice: e.target.value })} style={styles.input} required />
            <input type="number" placeholder="Executive" value={scheduleForm.executivePrice} onChange={(e) => setScheduleForm({ ...scheduleForm, executivePrice: e.target.value })} style={styles.input} required />

            <button type="submit" style={styles.submitBtn}>Verify & Schedule</button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "30px", maxWidth: "1000px", margin: "0 auto", backgroundColor: "#f4f4f5", minHeight: "100vh", fontFamily: "sans-serif" },
  tabContainer: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  tabButton: { flex: 1, padding: "15px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.3s", minWidth: "120px" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 16px rgba(0,0,0,0.05)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  fullWidth: { gridColumn: "1 / -1", margin: "0 0 10px 0", color: "#34495e" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ced4da", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.85rem", color: "#7f8c8d", fontWeight: "bold" },
  submitBtn: { gridColumn: "1 / -1", padding: "15px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: { backgroundColor: "#2c3e50", color: "white", padding: "12px", textAlign: "left" },
  td: { padding: "12px", borderBottom: "1px solid #ecf0f1", color: "#34495e" },
  toggleBtn: { color: "white", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" },
  badge: { backgroundColor: "#3498db", color: "white", padding: "8px 15px", borderRadius: "20px", fontSize: "0.9rem" }
};

export default AdminDashboard;