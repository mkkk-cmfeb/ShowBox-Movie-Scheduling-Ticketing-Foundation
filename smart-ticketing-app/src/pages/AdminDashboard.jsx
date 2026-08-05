import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('movies');
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Data States
  const [movieData, setMovieData] = useState({ title: '', genre: '', isActive: true });
  const [cityData, setCityData] = useState({ name: '' });
  const [theatreData, setTheatreData] = useState({ name: '', address: '', cityId: '' });
  
  // Advanced Schedule State (Matching Java ShowSchedule.java exactly)
  const [scheduleCityId, setScheduleCityId] = useState(''); 
  const [scheduleData, setScheduleData] = useState({ 
    movieId: '', 
    theatreId: '', 
    showDate: '', 
    showNumber: '',
    startTime: '', 
    endTime: '', 
    premiumPrice: '', 
    executivePrice: '',
    normalPrice: ''
  });
  
  // Dropdown Lists
  const [citiesList, setCitiesList] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);

  const API_BASE = "http://localhost:8080/api";

  // Security Check
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Authentication required. Please sign in to continue.");
      window.location.href = "/auth";
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const userRole = user.role ? user.role.toUpperCase() : "";
      if (userRole === "ADMIN") {
        setIsAuthorized(true);
      } else {
        alert("Access Denied! Administrator privileges are required.");
        window.location.href = "/";
      }
    } catch (error) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }, []);

  // Fetch Dropdown Data
  useEffect(() => {
    if (activeTab === 'theatres') {
      fetchCities();
    } else if (activeTab === 'schedules') {
      fetchMovies();
      fetchCities();
      fetchTheatres();
    }
  }, [activeTab]);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/Cities`);
      if (response.ok) setCitiesList(await response.json());
    } catch (error) { console.error("Failed to fetch cities"); }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE}/Movies`);
      if (response.ok) setMoviesList(await response.json());
    } catch (error) { console.error("Failed to fetch movies"); }
  };

  const fetchTheatres = async () => {
    try {
      const response = await fetch(`${API_BASE}/Theatres`);
      if (response.ok) setTheatresList(await response.json());
    } catch (error) { console.error("Failed to fetch theatres"); }
  };

  // Submission Handlers
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/Movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieData)
      });
      if (response.ok) {
        alert("Movie added successfully!");
        setMovieData({ title: '', genre: '', isActive: true });
      } else alert("Failed to add the movie.");
    } catch (error) { alert("Server connection failed."); }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/Cities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cityData)
      });
      if (response.ok) {
        alert("City added successfully!");
        setCityData({ name: '' });
      } else alert("Failed to add city.");
    } catch (error) { alert("Server connection failed."); }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/Theatres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theatreData)
      });
      if (response.ok) {
        alert("Theatre added successfully!");
        setTheatreData({ name: '', address: '', cityId: '' });
      } else alert("Failed to add the theatre.");
    } catch (error) { alert("Server connection failed."); }
  };

  // The Upgraded Schedule Submission
 // The Upgraded Schedule Submission
  const handleAddSchedule = async (e) => {
    e.preventDefault();
    
    // Safely extract just the HH:mm portion of the time to prevent browser inconsistencies
    const safeStartTime = scheduleData.startTime.substring(0, 5);
    const safeEndTime = scheduleData.endTime.substring(0, 5);
    
    const payload = {
      movieId: scheduleData.movieId,
      theatreId: scheduleData.theatreId,
      showDate: scheduleData.showDate,
      showNumber: parseInt(scheduleData.showNumber),
      showTime: `${scheduleData.showDate}T${safeStartTime}:00`, 
      endTime: `${scheduleData.showDate}T${safeEndTime}:00`,   
      premiumPrice: parseFloat(scheduleData.premiumPrice),
      executivePrice: parseFloat(scheduleData.executivePrice),
      normalPrice: parseFloat(scheduleData.normalPrice)
    };

    try {
      const response = await fetch(`${API_BASE}/ShowSchedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert("Show Schedule added successfully!");
        setScheduleData({ movieId: '', theatreId: '', showDate: '', showNumber: '', startTime: '', endTime: '', premiumPrice: '', executivePrice: '', normalPrice: '' });
        setScheduleCityId('');
      } else {
        // This will now capture and display the exact error from Spring Boot
        const errorText = await response.text();
        alert(`Server Error: ${errorText || "Data format rejected by backend."}`);
      }
    } catch (error) { 
      alert("Server connection failed. Is Spring Boot running?"); 
    }
  };

  if (!isAuthorized) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Verifying security credentials... 🔐</h2>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', borderBottom: '3px solid #f1c40f', paddingBottom: '10px' }}>
          Admin Control Center
        </h1>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('movies')} style={activeTab === 'movies' ? styles.activeTab : styles.inactiveTab}>Manage Movies</button>
          <button onClick={() => setActiveTab('cities')} style={activeTab === 'cities' ? styles.activeTab : styles.inactiveTab}>Manage Cities</button>
          <button onClick={() => setActiveTab('theatres')} style={activeTab === 'theatres' ? styles.activeTab : styles.inactiveTab}>Manage Theatres</button>
          <button onClick={() => setActiveTab('schedules')} style={activeTab === 'schedules' ? styles.activeTab : styles.inactiveTab}>Manage Schedules</button>
        </div>

        {/* ... (Movies, Cities, and Theatres tabs remain identical) ... */}
        {activeTab === 'movies' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Add New Movie</h2>
            <form onSubmit={handleAddMovie} style={styles.form}>
              <input type="text" placeholder="Movie Title (e.g., Inception)" value={movieData.title} onChange={(e) => setMovieData({...movieData, title: e.target.value})} required style={styles.input} />
              <input type="text" placeholder="Genre (e.g., Sci-Fi, Action)" value={movieData.genre} onChange={(e) => setMovieData({...movieData, genre: e.target.value})} required style={styles.input} />
              <button type="submit" style={styles.submitBtn}>Save Movie</button>
            </form>
          </div>
        )}

        {activeTab === 'cities' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Add New City</h2>
            <form onSubmit={handleAddCity} style={styles.form}>
              <input type="text" placeholder="City Name (e.g., Mumbai)" value={cityData.name} onChange={(e) => setCityData({...cityData, name: e.target.value})} required style={styles.input} />
              <button type="submit" style={styles.submitBtn}>Save City</button>
            </form>
          </div>
        )}

        {activeTab === 'theatres' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Add New Theatre</h2>
            <form onSubmit={handleAddTheatre} style={styles.form}>
              <input type="text" placeholder="Theatre Name (e.g., IMAX Nexus)" value={theatreData.name} onChange={(e) => setTheatreData({...theatreData, name: e.target.value})} required style={styles.input} />
              <input type="text" placeholder="Address (e.g., 3rd Floor, Mall)" value={theatreData.address} onChange={(e) => setTheatreData({...theatreData, address: e.target.value})} required style={styles.input} />
              <select value={theatreData.cityId} onChange={(e) => setTheatreData({...theatreData, cityId: e.target.value})} required style={styles.input}>
                <option value="">-- Select a City --</option>
                {citiesList.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
              <button type="submit" style={styles.submitBtn}>Save Theatre</button>
            </form>
          </div>
        )}

        {/* Upgraded Schedules Section */}
        {activeTab === 'schedules' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Schedule a Show</h2>
            <form onSubmit={handleAddSchedule} style={styles.form}>
              
              <select value={scheduleData.movieId} onChange={(e) => setScheduleData({...scheduleData, movieId: e.target.value})} required style={styles.input}>
                <option value="">-- Select a Movie --</option>
                {moviesList.map(movie => <option key={movie.id} value={movie.id}>{movie.title}</option>)}
              </select>

              <select value={scheduleCityId} onChange={(e) => {
                  setScheduleCityId(e.target.value);
                  setScheduleData({...scheduleData, theatreId: ''}); 
                }} required style={styles.input}>
                <option value="">-- Filter by City --</option>
                {citiesList.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>

              <select value={scheduleData.theatreId} onChange={(e) => setScheduleData({...scheduleData, theatreId: e.target.value})} required disabled={!scheduleCityId} style={styles.input}>
                <option value="">-- Select a Theatre --</option>
                {theatresList
                  .filter(theatre => theatre.cityId.toString() === scheduleCityId.toString())
                  .map(theatre => <option key={theatre.id} value={theatre.id}>{theatre.name}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <input type="date" title="Show Date" value={scheduleData.showDate} onChange={(e) => setScheduleData({...scheduleData, showDate: e.target.value})} required style={{...styles.input, flex: 1}} />
                <input type="number" placeholder="Show Number (e.g., 1)" value={scheduleData.showNumber} onChange={(e) => setScheduleData({...scheduleData, showNumber: e.target.value})} required min="1" style={{...styles.input, flex: 1}} />
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Start Time</label>
                  <input type="time" value={scheduleData.startTime} onChange={(e) => setScheduleData({...scheduleData, startTime: e.target.value})} required style={{...styles.input, width: '100%', boxSizing: 'border-box'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>End Time</label>
                  <input type="time" value={scheduleData.endTime} onChange={(e) => setScheduleData({...scheduleData, endTime: e.target.value})} required style={{...styles.input, width: '100%', boxSizing: 'border-box'}} />
                </div>
              </div>

              {/* Tiered Pricing Section */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#7f8c8d' }}>Seat Pricing Setup (₹)</h4>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <input type="number" placeholder="Premium" value={scheduleData.premiumPrice} onChange={(e) => setScheduleData({...scheduleData, premiumPrice: e.target.value})} required min="1" style={{...styles.input, flex: 1}} />
                  <input type="number" placeholder="Executive" value={scheduleData.executivePrice} onChange={(e) => setScheduleData({...scheduleData, executivePrice: e.target.value})} required min="1" style={{...styles.input, flex: 1}} />
                  <input type="number" placeholder="Normal" value={scheduleData.normalPrice} onChange={(e) => setScheduleData({...scheduleData, normalPrice: e.target.value})} required min="1" style={{...styles.input, flex: 1}} />
                </div>
              </div>

              <button type="submit" style={{...styles.submitBtn, marginTop: '10px'}}>Save Schedule</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  activeTab: { padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  inactiveTab: { padding: '10px 20px', backgroundColor: '#bdc3c7', color: '#2c3e50', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' },
  input: { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' },
  label: { fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px', display: 'block' },
  submitBtn: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminDashboard;