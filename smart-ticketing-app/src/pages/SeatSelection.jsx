import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [movie, setMovie] = useState(null);
  const [theatre, setTheatre] = useState(null);
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: 5-Minute Timer State (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  const API_BASE = "http://localhost:8080/api";
  const MAX_SEATS = 6;

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const [schedulesRes, moviesRes, theatresRes, ticketsRes] = await Promise.all([
          fetch(`${API_BASE}/ShowSchedules`),
          fetch(`${API_BASE}/Movies`),
          fetch(`${API_BASE}/Theatres`),
          fetch(`${API_BASE}/Bookings/show/${showId}`) 
        ]);

        if (schedulesRes.ok && moviesRes.ok && theatresRes.ok) {
          const schedules = await schedulesRes.json();
          const movies = await moviesRes.json();
          const theatres = await theatresRes.json();
          
          let bookedSeatArray = [];
          if (ticketsRes.ok) {
              const tickets = await ticketsRes.json();
              tickets.forEach(ticket => {
                  if(ticket.seats) {
                      const seats = ticket.seats.split(',').map(s => s.trim());
                      bookedSeatArray = [...bookedSeatArray, ...seats];
                  }
              });
          }
          setBookedSeats(bookedSeatArray);

          const currentSchedule = schedules.find(s => s.id.toString() === showId.toString());
          
          if (currentSchedule) {
            setSchedule(currentSchedule);
            setMovie(movies.find(m => m.id === currentSchedule.movieId));
            setTheatre(theatres.find(t => t.id === currentSchedule.theatreId));
          }
        }
      } catch (error) {
        console.error("Failed to load seat map data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  // NEW: Timer Effect - Starts counting down when seats are selected
  useEffect(() => {
    let timer;
    if (selectedSeats.length > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            alert("Your 5-minute reservation window has expired. Seats have been released.");
            setSelectedSeats([]); // Clear seats
            return 300; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(300); // Reset timer if user deselects all seats
    }

    return () => clearInterval(timer);
  }, [selectedSeats.length]);

  const seatLayout = [
    { tier: 'Premium', priceKey: 'premiumPrice', rows: ['A', 'B'] },
    { tier: 'Executive', priceKey: 'executivePrice', rows: ['C', 'D', 'E', 'F'] },
    { tier: 'Normal', priceKey: 'normalPrice', rows: ['G', 'H', 'I', 'J'] }
  ];
  const seatsPerRow = 12;

  const toggleSeat = (seatId, price) => {
    if (bookedSeats.includes(seatId)) return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seatId);
      
      // If the seat is already selected, allow them to deselect it
      if (isSelected) {
        return prev.filter(s => s.id !== seatId); 
      } else {
        // NEW: Strict Max 6 Seats Validation
        if (prev.length >= MAX_SEATS) {
          alert(`You can only select a maximum of ${MAX_SEATS} seats per transaction to prevent bulk blocking.`);
          return prev;
        }
        return [...prev, { id: seatId, price }]; 
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seat) => total + seat.price, 0);
  };

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to proceed.");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("Session expired. Please log in to book tickets.");
      navigate('/auth');
      return;
    }
    const loggedInUser = JSON.parse(userStr);

    const ticketPayload = {
      userEmail: loggedInUser.email,
      showScheduleId: parseInt(showId),
      movieTitle: movie.title,
      theatreName: theatre.name,
      showDate: schedule.showDate,
      showTime: schedule.showTime.split('T')[1].substring(0, 5),
      seats: selectedSeats.map(s => s.id).join(', '), 
      totalAmount: calculateTotal(),
      status: "CONFIRMED" 
    };

    try {
      const response = await fetch(`${API_BASE}/Bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketPayload)
      });

      if (response.ok) {
        alert(`Payment of ₹${calculateTotal()} successful! Generating your digital tickets...`);
        navigate('/my-tickets');
      } else {
        const errorMsg = await response.text();
        alert(`Booking failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Server connection failed. Is Spring Boot running?");
    }
  };

  // Helper to format MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Mapping Seats... 🎬</h2>;
  if (!schedule) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>Show not found!</h2>;

  const displayTime = schedule.showTime.split('T')[1].substring(0, 5);

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', paddingBottom: '100px' }}>
      
      <div style={styles.headerBar}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{movie?.title}</h2>
            <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
              {theatre?.name} | {schedule.showDate} | {displayTime}
            </p>
          </div>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>Change Time</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        <div style={styles.screenContainer}>
          <div style={styles.screen}></div>
          <p style={styles.screenText}>All eyes this way</p>
        </div>

        <div style={styles.seatGrid}>
          {seatLayout.map((category) => (
            <div key={category.tier} style={{ marginBottom: '30px', width: '100%' }}>
              <div style={styles.categoryHeader}>
                <span>{category.tier}</span>
                <span>₹ {schedule[category.priceKey]}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #ddd', marginBottom: '20px' }} />
              
              {category.rows.map(rowLabel => (
                <div key={rowLabel} style={styles.row}>
                  <span style={styles.rowLabel}>{rowLabel}</span>
                  <div style={styles.seats}>
                    {[...Array(seatsPerRow)].map((_, index) => {
                      const seatNum = index + 1;
                      const seatId = `${rowLabel}${seatNum}`;
                      
                      const isSelected = selectedSeats.some(s => s.id === seatId);
                      const isBooked = bookedSeats.includes(seatId); 
                      
                      let currentStyle = styles.seatAvailable;
                      if (isBooked) currentStyle = styles.seatBooked;
                      else if (isSelected) currentStyle = styles.seatSelected;

                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeat(seatId, schedule[category.priceKey])}
                          style={currentStyle}
                          disabled={isBooked} 
                          title={isBooked ? 'Already Booked' : `${seatId} - ₹${schedule[category.priceKey]}`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div style={styles.bottomBar}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '1.2rem' }}>
                {selectedSeats.length} Ticket(s) Selected
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <p style={{ margin: 0, color: '#bdc3c7', fontSize: '0.9rem' }}>
                  {selectedSeats.map(s => s.id).join(', ')}
                </p>
                {/* NEW: Timer UI Element */}
                <span style={styles.timerBadge}>
                  ⏳ {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <h2 style={{ margin: 0, color: '#fff' }}>Total: ₹{calculateTotal()}</h2>
              <button onClick={handleProceedToPayment} style={styles.payBtn}>
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  headerBar: { backgroundColor: 'white', padding: '15px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 },
  backBtn: { padding: '8px 15px', border: '1px solid #e74c3c', color: '#e74c3c', backgroundColor: 'transparent', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  screenContainer: { textAlign: 'center', marginBottom: '50px', marginTop: '20px' },
  screen: { height: '5px', backgroundColor: '#bdc3c7', borderRadius: '50%', boxShadow: '0 15px 20px rgba(0,0,0,0.1)', transform: 'rotateX(-45deg)' },
  screenText: { color: '#95a5a6', fontSize: '0.8rem', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' },
  seatGrid: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflowX: 'auto' },
  categoryHeader: { display: 'flex', justifyContent: 'space-between', color: '#7f8c8d', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', gap: '15px', minWidth: 'max-content' },
  rowLabel: { width: '20px', color: '#95a5a6', fontWeight: 'bold', textAlign: 'center' },
  seats: { display: 'flex', gap: '8px' },
  
  seatAvailable: { width: '30px', height: '30px', backgroundColor: 'white', border: '1px solid #2ecc71', borderRadius: '5px 5px 10px 10px', cursor: 'pointer', color: '#2ecc71', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' },
  seatSelected: { width: '30px', height: '30px', backgroundColor: '#2ecc71', border: '1px solid #2ecc71', borderRadius: '5px 5px 10px 10px', cursor: 'pointer', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', transform: 'scale(1.1)', transition: '0.2s' },
  seatBooked: { width: '30px', height: '30px', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '5px 5px 10px 10px', cursor: 'not-allowed', color: '#bdc3c7', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  bottomBar: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#2c3e50', padding: '15px 20px', boxShadow: '0 -4px 10px rgba(0,0,0,0.1)', zIndex: 20 },
  payBtn: { padding: '12px 30px', backgroundColor: '#F84464', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(248, 68, 100, 0.3)' },
  
  // NEW: Timer Badge Styling
  timerBadge: { backgroundColor: '#e74c3c', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }
};

export default SeatSelection;