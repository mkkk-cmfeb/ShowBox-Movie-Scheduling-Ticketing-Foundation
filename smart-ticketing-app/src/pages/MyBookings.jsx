import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const API_BASE = "http://localhost:8080/api";

  useEffect(() => {
    // 1. Verify Authentication
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate('/auth');
      return;
    }
    
    const loggedInUser = JSON.parse(userStr);
    setUser(loggedInUser);

    // 2. Fetch User's Tickets from Spring Boot
    const fetchMyTickets = async () => {
      try {
        // NOTE: You will need to create this endpoint in your Java backend later
        // e.g., @GetMapping("/Bookings/user/{email}")
        const response = await fetch(`${API_BASE}/Bookings/user/${loggedInUser.email}`);
        
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        } else {
          // If backend isn't ready, we default to an empty array
          setBookings([]);
        }
      } catch (error) {
        console.error("Could not fetch bookings:", error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, [navigate]);

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Loading your tickets... 🎟️</h2>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Updated Header with Flexbox to prevent overlap */}
        <div style={{ marginBottom: '30px', borderBottom: '2px solid #bdc3c7', paddingBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h1 style={{ margin: 0, color: '#2c3e50', lineHeight: '1.2' }}>My Tickets</h1>
          <p style={{ margin: 0, color: '#7f8c8d' }}>Manage your upcoming movie plans, {user?.name}</p>
        </div>

        {bookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bookings.map((ticket, index) => (
              <div key={index} style={styles.ticketCard}>
                <div style={styles.ticketLeft}>
                  <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{ticket.movieTitle}</h2>
                  <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '0.9rem' }}>{ticket.theatreName}</p>
                  
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <div>
                      <span style={styles.label}>DATE</span>
                      <p style={styles.value}>{ticket.showDate}</p>
                    </div>
                    <div>
                      <span style={styles.label}>TIME</span>
                      <p style={styles.value}>{ticket.showTime}</p>
                    </div>
                  </div>

                  <div>
                    <span style={styles.label}>SEATS ({ticket.seats.split(',').length})</span>
                    <p style={styles.value}>{ticket.seats}</p>
                  </div>
                </div>
                
                <div style={styles.ticketRight}>
                  {/* Placeholder for the Proof-of-Watch QR Code */}
                  <div style={styles.qrPlaceholder}>
                     QR<br/>CODE
                  </div>
                  <span style={styles.bookingId}>ID: #{ticket.id || 'Pending'}</span>
                  <span style={styles.statusBadge}>{ticket.status || 'CONFIRMED'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '4rem' }}>🍿</span>
            <h2 style={{ color: '#2c3e50', marginTop: '15px' }}>No tickets found</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>You haven't booked any movies yet. Time to grab some popcorn!</p>
            <button onClick={() => navigate('/')} style={styles.browseBtn}>Browse Movies</button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  ticketCard: { display: 'flex', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', overflow: 'hidden', position: 'relative' },
  ticketLeft: { flex: 1, padding: '25px', borderRight: '2px dashed #ecf0f1' },
  ticketRight: { width: '180px', backgroundColor: '#fafafa', padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' },
  
  label: { display: 'block', fontSize: '0.75rem', color: '#95a5a6', fontWeight: 'bold', letterSpacing: '1px' },
  value: { margin: '2px 0 0 0', color: '#2c3e50', fontSize: '1.1rem', fontWeight: 'bold' },
  
  qrPlaceholder: { width: '100px', height: '100px', backgroundColor: '#ecf0f1', border: '2px solid #bdc3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#95a5a6', fontWeight: 'bold', textAlign: 'center', fontSize: '0.9rem' },
  bookingId: { fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' },
  statusBadge: { backgroundColor: '#2ecc71', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' },
  
  emptyState: { backgroundColor: 'white', padding: '50px 20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  browseBtn: { padding: '12px 30px', backgroundColor: '#F84464', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }
};

export default MyBookings;