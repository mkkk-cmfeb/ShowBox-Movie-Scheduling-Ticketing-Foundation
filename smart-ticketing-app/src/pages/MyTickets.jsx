import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from '../components/QRCode.jsx';

function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080/api";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const loggedInUser = userStr ? JSON.parse(userStr) : null;
    if (!loggedInUser || !loggedInUser.email) {
      navigate('/auth');
      return;
    }

    const fetchAll = async () => {
      try {
        const bRes = await fetch(`${API_BASE}/Bookings/user/${loggedInUser.email}`);
        const bData = bRes.ok ? await bRes.json() : [];
        setBookings(Array.isArray(bData) ? bData.sort((a, b) => b.id - a.id) : []);

        const sRes = await fetch(`${API_BASE}/ShowSchedules`);
        if (sRes.ok) setSchedules(await sRes.json());

        const mRes = await fetch(`${API_BASE}/Movies`);
        if (mRes.ok) setMovies(await mRes.json());

        const tRes = await fetch(`${API_BASE}/Theatres`);
        if (tRes.ok) setTheatres(await tRes.json());
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Loading your tickets...</h2>;

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#2c3e50', marginBottom: '30px', textAlign: 'center' }}>My Tickets</h1>

        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '50px', borderRadius: '10px' }}>
            <h3 style={{ color: '#7f8c8d' }}>You haven't booked any movies yet!</h3>
            <button onClick={() => navigate('/')} style={styles.browseBtn}>Browse Movies</button>
          </div>
        ) : (
          bookings.map((booking) => {
            // Join related data from the show schedule (Ticket stores showScheduleId)
            const schedule = schedules.find(s => s.id === booking.showScheduleId);
            const movie = schedule ? movies.find(m => m.id === schedule.movieId) : null;
            const theatre = schedule ? theatres.find(t => t.id === schedule.theatreId) : null;

            const movieTitle = movie ? movie.title : (booking.movieTitle || "Movie Details Unavailable");
            const theatreName = theatre ? theatre.name : (booking.theatreName || "N/A");
            const showDate = booking.showDate || (schedule ? new Date(schedule.showDate).toDateString() : "N/A");
            const showTime = booking.showTime || (schedule
              ? new Date(schedule.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "N/A");
            const seats = booking.seats || "N/A";

            // Data embedded inside the QR Code
            const qrData = JSON.stringify({
              TicketID: booking.id,
              Movie: movieTitle,
              Theatre: theatreName,
              Date: showDate,
              Time: showTime,
              Seats: seats,
              Amount: booking.totalAmount
            });

            return (
              <div key={booking.id} style={styles.ticketCard}>
                <div style={styles.ticketDetails}>
                  <h2 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{movieTitle}</h2>
                  <p style={{ margin: '0 0 5px 0', color: '#7f8c8d' }}>{theatreName}</p>

                  <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                    <div>
                      <span style={styles.label}>DATE</span>
                      <p style={styles.value}>{showDate}</p>
                    </div>
                    <div>
                      <span style={styles.label}>TIME</span>
                      <p style={styles.value}>{showTime}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <span style={styles.label}>SEATS ({seats.split(',').filter(Boolean).length})</span>
                    <p style={{ ...styles.value, fontSize: '1.2rem', color: '#e74c3c' }}>{seats}</p>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <span style={styles.label}>TOTAL AMOUNT</span>
                    <p style={styles.value}>₹ {booking.totalAmount}</p>
                  </div>
                </div>

                {/* The QR Code Section */}
                <div style={styles.qrSection}>
                  <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', display: 'inline-block' }}>
                    <QRCode
                      value={qrData}
                      size={130}
                      level="H"
                    />
                  </div>
                  <p style={{ margin: '15px 0 5px 0', color: '#95a5a6', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    ID: #{booking.id}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  ticketCard: { display: 'flex', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
  ticketDetails: { flex: '1', padding: '30px', minWidth: '300px' },
  qrSection: { width: '250px', backgroundColor: '#fafafa', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '2px dashed #ecf0f1' },
  label: { fontSize: '0.75rem', color: '#95a5a6', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' },
  value: { fontSize: '1.1rem', color: '#2c3e50', fontWeight: 'bold', margin: '5px 0 0 0' },
  browseBtn: { marginTop: '20px', padding: '10px 25px', backgroundColor: '#F84464', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
};

export default MyTickets;
