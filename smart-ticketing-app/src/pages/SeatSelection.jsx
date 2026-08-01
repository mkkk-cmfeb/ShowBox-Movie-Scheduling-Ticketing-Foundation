import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  
  const [schedule, setSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]); // 👈 NAYA: Pehle se book hui seats ka state

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Show ki Details laana
      const scheduleRes = await fetch("http://localhost:8080/api");
      if (scheduleRes.ok) {
        const schedules = await scheduleRes.json();
        setSchedule(schedules.find(s => s.id === parseInt(showId)));
      }

      // 2. NAYA: Is show ki purani bookings laana
      const bookingsRes = await fetch(`https://localhost:7004/api/Bookings/show/${showId}`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        
        // Saari bookings ki seats ko combine karke ek array banana
        let allBooked = [];
        bookingsData.forEach(b => {
          if (b.seatNumbers) {
            const seats = b.seatNumbers.split(',').map(s => s.trim());
            allBooked = [...allBooked, ...seats];
          }
        });
        setBookedSeats(allBooked);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getSeatPrice = (row) => {
    if (!schedule) return 0;
    if (['A', 'B'].includes(row)) return schedule.normalPrice;
    if (['C', 'D'].includes(row)) return schedule.premiumPrice;
    if (['E'].includes(row)) return schedule.executivePrice;
    return 0;
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => total + getSeatPrice(seatId.charAt(0)), 0);
  };

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleSeat = (seatId) => {
    // Agar seat pehle se booked hai, toh click kaam nahi karega
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(seat => seat !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");
    if (!user) {
      alert("Booking karne ke liye please pehle Sign In karein!");
      navigate('/auth');
      return;
    }

    const bookingData = {
      showId: parseInt(showId),
      userEmail: user.email,
      seatNumbers: selectedSeats.join(', '),
      totalAmount: calculateTotal()
    };

    try {
      const response = await fetch("https://localhost:7004/api/Bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        alert(`🎉 Booking Confirmed Successfully!\nSeats: ${bookingData.seatNumbers}\nTotal Paid: ₹${bookingData.totalAmount}`);
        navigate('/my-tickets'); 
      } else {
        alert("❌ Booking fail ho gayi. Kripya dobara try karein.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
    }
  };

  if (!schedule) return <h3 style={{textAlign: 'center', marginTop: '50px'}}>Loading Seat Map...</h3>;

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>Select Your Seats</h2>
      
      <div style={styles.priceGuide}>
        <span style={styles.legend}>🟩 Normal (A, B) - ₹{schedule.normalPrice}</span>
        <span style={styles.legend}>🟨 Premium (C, D) - ₹{schedule.premiumPrice}</span>
        <span style={styles.legend}>🟪 Executive (E) - ₹{schedule.executivePrice}</span>
        <span style={styles.legend} style={{...styles.legend, backgroundColor: '#bdc3c7', color: 'white'}}>⬛ Booked</span>
      </div>

      <div style={styles.screenContainer}>
        <div style={styles.screenCurve}></div>
        <p style={{ textAlign: 'center', color: '#bdc3c7', fontSize: '0.9rem', letterSpacing: '3px' }}>All eyes this way</p>
      </div>

      <div style={styles.seatGrid}>
        {rows.map((row) => (
          <div key={row} style={styles.row}>
            <span style={styles.rowLabel}>{row}</span>
            <div style={styles.seatRow}>
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const isSelected = selectedSeats.includes(seatId);
                const isBooked = bookedSeats.includes(seatId); // 👈 NAYA: Check if booked
                const isAisle = col === 4; 
                
                let baseColor = 'white';
                let borderColor = '#bdc3c7';
                if (['A', 'B'].includes(row)) borderColor = '#2ecc71'; 
                if (['C', 'D'].includes(row)) borderColor = '#f1c40f'; 
                if (['E'].includes(row)) borderColor = '#9b59b6';      

                return (
                  <div key={seatId} style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      onClick={() => toggleSeat(seatId)}
                      disabled={isBooked} // 👈 NAYA: Button ko disable karna
                      style={{
                        ...styles.seat,
                        backgroundColor: isBooked ? '#bdc3c7' : (isSelected ? '#2c3e50' : baseColor),
                        color: (isSelected || isBooked) ? 'white' : '#2c3e50',
                        border: isBooked ? '2px solid #95a5a6' : `2px solid ${borderColor}`,
                        cursor: isBooked ? 'not-allowed' : 'pointer', // 👈 NAYA: Mouse pointer change
                        transform: (isSelected && !isBooked) ? 'scale(1.1)' : 'scale(1)',
                        opacity: isBooked ? 0.6 : 1
                      }}
                    >
                      {col}
                    </button>
                    {isAisle && <div style={{ width: '20px' }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSeats.length > 0 && (
        <div style={styles.paymentBar}>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>Selected Seats</p>
            <h3 style={{ margin: 0, color: '#2c3e50' }}>{selectedSeats.join(', ')}</h3>
          </div>
          <button style={styles.payButton} onClick={handlePayment}>
            Pay ₹{calculateTotal()}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Segoe UI', Tahoma, sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '100px' },
  priceGuide: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  legend: { backgroundColor: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#34495e' },
  screenContainer: { marginBottom: '50px' },
  screenCurve: { height: '60px', borderTop: '5px solid #bdc3c7', borderRadius: '50% 50% 0 0 / 100% 100% 0 0', boxShadow: '0 -15px 20px rgba(0,0,0,0.02)' },
  seatGrid: { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
  row: { display: 'flex', alignItems: 'center', gap: '20px' },
  rowLabel: { width: '20px', fontWeight: 'bold', color: '#7f8c8d', fontSize: '1.1rem' },
  seatRow: { display: 'flex', gap: '10px' },
  seat: { width: '35px', height: '35px', borderRadius: '5px 5px 10px 10px', fontWeight: '600', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  paymentBar: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: '20px 10%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -10px 20px rgba(0,0,0,0.1)' },
  payButton: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', transition: '0.3s' }
};

export default SeatSelection;