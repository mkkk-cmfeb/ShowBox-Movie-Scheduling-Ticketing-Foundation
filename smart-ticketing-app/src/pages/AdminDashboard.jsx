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
  
  // Dropdown States
  const [citiesList, setCitiesList] = useState([]);

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
        alert("Access Denied! Administrator privileges are required to view this page.");
        window.location.href = "/";
      }
    } catch (error) {
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  }, []);

  // Fetch Cities for the Dropdown when the Theatres tab is clicked
  useEffect(() => {
    if (activeTab === 'theatres') {
      fetchCities();
    }
  }, [activeTab]);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/Cities`);
      if (response.ok) {
        const data = await response.json();
        setCitiesList(data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
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
      } else {
        alert("Failed to add the movie. Please check your inputs.");
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed. Is Spring Boot running?");
    }
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
      } else {
        const errorText = await response.text();
        alert(`Failed to add city: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Server connection failed. Is Spring Boot running?");
    }
  };

  const handleAddTheatre = async (e) => {
    e.preventDefault();
    if (!theatreData.cityId) {
      alert("Please select a city first.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/Theatres`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theatreData)
      });
      if (response.ok) {
        alert("Theatre added successfully!");
        setTheatreData({ name: '', address: '', cityId: '' });
      } else {
        alert("Failed to add the theatre.");
      }
    } catch (error) {
      console.error(error);
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
          <button onClick={() => setActiveTab('movies')} style={activeTab === 'movies' ? styles.activeTab : styles.inactiveTab}>
            Manage Movies
          </button>
          <button onClick={() => setActiveTab('cities')} style={activeTab === 'cities' ? styles.activeTab : styles.inactiveTab}>
            Manage Cities
          </button>
          <button onClick={() => setActiveTab('theatres')} style={activeTab === 'theatres' ? styles.activeTab : styles.inactiveTab}>
            Manage Theatres
          </button>
        </div>

        {/* Movies Section */}
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

        {/* Cities Section */}
        {activeTab === 'cities' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Add New City</h2>
            <form onSubmit={handleAddCity} style={styles.form}>
              <input type="text" placeholder="City Name (e.g., Mumbai)" value={cityData.name} onChange={(e) => setCityData({...cityData, name: e.target.value})} required style={styles.input} />
              <button type="submit" style={styles.submitBtn}>Save City</button>
            </form>
          </div>
        )}

        {/* Theatres Section */}
        {activeTab === 'theatres' && (
          <div style={styles.card}>
            <h2 style={{ color: '#34495e' }}>Add New Theatre</h2>
            <form onSubmit={handleAddTheatre} style={styles.form}>
              <input type="text" placeholder="Theatre Name (e.g., IMAX Nexus)" value={theatreData.name} onChange={(e) => setTheatreData({...theatreData, name: e.target.value})} required style={styles.input} />
              <input type="text" placeholder="Address (e.g., 3rd Floor, Seawoods Mall)" value={theatreData.address} onChange={(e) => setTheatreData({...theatreData, address: e.target.value})} required style={styles.input} />
              
              {/* Dynamic Dropdown for Cities */}
              <select 
                value={theatreData.cityId} 
                onChange={(e) => setTheatreData({...theatreData, cityId: e.target.value})} 
                required 
                style={styles.input}
              >
                <option value="">-- Select a City --</option>
                {citiesList.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>

              <button type="submit" style={styles.submitBtn}>Save Theatre</button>
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
  submitBtn: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminDashboard;