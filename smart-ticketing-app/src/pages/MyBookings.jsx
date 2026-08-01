import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Safe JSON Parsing taaki crash na ho
  const userString = localStorage.getItem("user");
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch(e) {
    user = null;
  }

const API_BASE = "http://localhost:8080/api";
  useEffect(() => {
    // Agar user email nahi hai toh auth par bhej do
    if (!user || !user.email) {
      navigate('/auth'); 
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Bookings laana (Crash Proof Logic ke sath)
      const bRes = await fetch(`${API_BASE}/Bookings/user/${user.email}`);
      if (bRes.ok) {
        const data = await bRes.json();
        // 🚨 CRASH SAVER: Agar data array hai tabhi set karo, warna empty array rakho
        setBookings(Array.isArray(data) ? data : []); 
      } else {
        setBookings([]);
      }

      // 2. Baaki Data laana (Bina Promise.all ke, taaki ek fail ho toh sab fail na hon)
      const sRes = await fetch(`${API_BASE}/ShowSchedules`);
      if (sRes.ok) setSchedules(await sRes.json());

      const mRes = await fetch(`${API_BASE}/Movies`);
      if (mRes.ok) setMovies(await mRes.json());

      const tRes = await fetch(`${API_BASE}/Theatres`);
      if (tRes.ok) setTheatres(await tRes.json());

      const cRes = await fetch(`${API_BASE}/Cities`);
      if (cRes.ok) setCities(await cRes.json());

    } catch (error) {
      console.error("Error fetching data:", error);
      setBookings([]); // Error aaye toh khali list dikhao, crash mat karo
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <h3 style={{ textAlign: 'center', marginTop: '50px', color: '#2c3e50' }}>Loading your tickets... 🎟️</h3>;

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #e74c3c', paddingBottom: '10px', display: 'inline-block' }}>
        🎟️ My Tickets
      </h2>

      {bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No bookings found!</h3>
          <p>Looks like you haven't booked any movies yet.</p>
          <button style={styles.btn} onClick={() => navigate('/')}>Book a Movie Now</button>
        </div>
      ) : (
        <div style={styles.ticketGrid}>
          {bookings.map((booking) => {
            // Relational Data Jodna (Safe tarike se)
            const schedule = schedules.find(s => s.id === booking.showId);
            const movie = schedule ? movies.find(m => m.id === schedule.movieId) : null;
            const theatre = schedule ? theatres.find(t => t.id === schedule.theatreId) : null;
            const city = theatre ? cities.find(c => c.id === theatre.cityId) : null;
            
            return (
              <div key={booking.id} style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <h3 style={{ margin: 0, color: 'white' }}>{movie ? movie.title : "Movie Details Unavailable"}</h3>
                </div>
                
                <div style={styles.ticketBody}>
                  <p><strong>📍 Location:</strong> {theatre ? theatre.name : "N/A"}, {city ? city.name : "N/A"}</p>
                  <p><strong>📅 Date:</strong> {schedule ? new Date(schedule.showDate).toDateString() : "N/A"}</p>
                  <p><strong>⏰ Time:</strong> {schedule ? new Date(schedule.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                  <p><strong>💺 Seats:</strong> <span style={styles.highlight}>{booking.seatNumbers}</span></p>
                  
                  <hr style={{ border: '1px dashed #bdc3c7', margin: '15px 0' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, color: '#7f8c8d' }}>Total Paid:</p>
                    <h2 style={{ margin: 0, color: '#27ae60' }}>₹{booking.totalAmount}</h2>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px 5%', backgroundColor: '#f4f4f5', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, sans-serif" },
  emptyState: { textAlign: 'center', marginTop: '50px', color: '#7f8c8d' },
  btn: { backgroundColor: '#e74c3c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  ticketGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px', marginTop: '30px' },
  ticketCard: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
  ticketHeader: { backgroundColor: '#2c3e50', padding: '15px 20px', borderBottom: '4px solid #e74c3c' },
  ticketBody: { padding: '20px', color: '#34495e', lineHeight: '1.6' },
  highlight: { backgroundColor: '#f1c40f', color: '#2c3e50', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }
};

export default MyBookings;