import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MoviePoster from '../components/MoviePoster.jsx';

function BookTicket() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // Data States
  const [movie, setMovie] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);

  // Filter States
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = "http://localhost:8080/api";

  // Helper to generate 7 days with formatted text for the UI
  const generateNext7Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      // YYYY-MM-DD for backend filtering
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const fullDate = `${yyyy}-${mm}-${dd}`;

      // UI Text Formatting
      const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = nextDate.toLocaleDateString('en-US', { day: '2-digit' });
      const monthName = nextDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

      dates.push({ fullDate, dayName, dayNum, monthName });
    }
    return dates;
  };

  const next7Days = generateNext7Days();

  // 1. Fetch Movies, Cities, and Schedules on component load
  useEffect(() => {
    setSelectedDate(next7Days[0].fullDate);

    const fetchBookingData = async () => {
      try {
        const [moviesRes, schedulesRes, citiesRes] = await Promise.all([
          fetch(`${API_BASE}/Movies`),
          fetch(`${API_BASE}/ShowSchedules`),
          fetch(`${API_BASE}/Cities`)
        ]);

        if (moviesRes.ok && schedulesRes.ok && citiesRes.ok) {
          const allMovies = await moviesRes.json();
          const allSchedules = await schedulesRes.json();
          const allCities = await citiesRes.json();

          const currentMovie = allMovies.find(m => m.id.toString() === id.toString());
          setMovie(currentMovie || null);
          setCities(allCities);

          if (currentMovie) {
            setSchedules(allSchedules.filter(s => s.movieId.toString() === id.toString()));
          }
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 2. Fetch Theatres dynamically ONLY when a City is selected
  useEffect(() => {
    if (!selectedCity) {
      setTheatres([]); // Clear theatres if no city is selected
      return;
    }

    const fetchTheatresByCity = async () => {
      try {
        const response = await fetch(`${API_BASE}/Theatres/city/${selectedCity}`);
        if (response.ok) {
          setTheatres(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch theatres", error);
      }
    };
    fetchTheatresByCity();
  }, [selectedCity]);

  // Dropdown Handlers
  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
    setSelectedTheatre(''); // Reset the theatre if the user changes the city
  };

  const handleTimeClick = (scheduleId) => {
    navigate(`/seats/${scheduleId}`);
  };

  // Theatres are now inherently filtered by the backend
  const availableTheatresInCity = theatres;
  
  const finalSchedules = schedules.filter(s => 
    s.showDate === selectedDate && 
    s.theatreId.toString() === selectedTheatre
  );

  const selectedTheatreDetails = theatres.find(t => t.id.toString() === selectedTheatre);

  if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</h2>;
  if (!movie) return <h2 style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>Movie not found!</h2>;

  return (
    <div style={{ padding: '30px 20px', backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      
      {/* Invisible style block to hide the scrollbar for the date container */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Movie Header */}
        <div style={styles.headerCard}>
          <MoviePoster title={movie.title} style={styles.headerPoster} />
          <div>
            <h1 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{movie.title}</h1>
            <p style={{ margin: '0', color: '#7f8c8d', fontSize: '1rem' }}>{movie.genre}</p>
          </div>
        </div>

        {/* BMS Style Date Calendar */}
        <div style={styles.dateCalendarWrapper}>
          <div className="hide-scrollbar" style={styles.dateContainer}>
            {next7Days.map((dateObj) => {
              const isActive = selectedDate === dateObj.fullDate;
              return (
                <button 
                  key={dateObj.fullDate} 
                  onClick={() => setSelectedDate(dateObj.fullDate)}
                  style={isActive ? styles.activeDateBtn : styles.inactiveDateBtn}
                >
                  <span style={isActive ? styles.activeTextSmall : styles.inactiveTextSmall}>
                    {dateObj.dayName}
                  </span>
                  <span style={isActive ? styles.activeTextLarge : styles.inactiveTextLarge}>
                    {dateObj.dayNum}
                  </span>
                  <span style={isActive ? styles.activeTextSmall : styles.inactiveTextSmall}>
                    {dateObj.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div style={styles.filterSection}>
          <select 
            value={selectedCity} 
            onChange={handleCityChange} 
            style={styles.selectInput}
          >
            <option value="" disabled>-- Select a City --</option>
            {cities.map(city => <option key={city.id} value={city.id.toString()}>{city.name}</option>)}
          </select>

          <select
            value={selectedTheatre}
            onChange={(e) => setSelectedTheatre(e.target.value)}
            style={{ ...styles.selectInput, backgroundColor: selectedCity ? 'white' : '#ecf0f1' }}
            disabled={!selectedCity}
          >
            <option value="" disabled>-- Select a Theatre --</option>
            {availableTheatresInCity.map(theatre => (
              <option key={theatre.id} value={theatre.id.toString()}>{theatre.name}</option>
            ))}
          </select>
        </div>

        {/* Showtimes Result */}
        {selectedTheatre && (
          <div style={styles.theatreCard}>
            <h3 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{selectedTheatreDetails?.name}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#95a5a6', fontSize: '0.9rem' }}>{selectedTheatreDetails?.address}</p>
            
            {finalSchedules.length > 0 ? (
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {finalSchedules.map(show => {
                  
                  // Safely extracts the time regardless of if it's formatted as a Date-Time or just Time
                  const timeString = show.showTime.includes('T') 
                    ? show.showTime.split('T')[1].substring(0, 5) 
                    : show.showTime.substring(0, 5);
                    
                  return (
                    <button key={show.id} onClick={() => handleTimeClick(show.id)} style={styles.timeButton}>
                      {timeString}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={styles.noShowsText}>
                No shows are scheduled at this theatre for the selected date.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  headerCard: { backgroundColor: 'white', padding: '24px 30px', borderRadius: '12px 12px 0 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '25px' },
  headerPoster: { width: '90px', height: '135px', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '8px', boxShadow: '0 6px 14px rgba(0,0,0,0.2)', flexShrink: 0 },
  
  // Date Calendar Styles
  dateCalendarWrapper: { backgroundColor: 'white', padding: '15px 20px', borderRadius: '0 0 12px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '25px' },
  dateContainer: { display: 'flex', gap: '15px', overflowX: 'auto', padding: '5px 0' },
  
  activeDateBtn: { backgroundColor: '#F84464', border: 'none', borderRadius: '8px', padding: '10px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '65px', boxShadow: '0 4px 8px rgba(248,68,100,0.3)' },
  inactiveDateBtn: { backgroundColor: 'transparent', border: 'none', borderRadius: '8px', padding: '10px 15px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '65px', transition: 'background-color 0.2s' },
  
  activeTextSmall: { color: 'white', fontSize: '0.75rem', fontWeight: '500' },
  inactiveTextSmall: { color: '#7f8c8d', fontSize: '0.75rem', fontWeight: '500' },
  activeTextLarge: { color: 'white', fontSize: '1.4rem', fontWeight: 'bold', margin: '2px 0' },
  inactiveTextLarge: { color: '#2c3e50', fontSize: '1.4rem', fontWeight: 'bold', margin: '2px 0' },
  
  // Dropdowns
  filterSection: { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' },
  selectInput: { padding: '14px', borderRadius: '8px', border: '1px solid #dcdde1', fontSize: '1rem', flex: 1, minWidth: '250px', backgroundColor: 'white', outline: 'none', color: '#2c3e50', cursor: 'pointer' },
  
  // Theatre & Shows
  theatreCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  timeButton: { padding: '10px 25px', backgroundColor: '#fff', color: '#27ae60', border: '2px solid #27ae60', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.2s' },
  noShowsText: { color: '#e74c3c', backgroundColor: '#fdf3f2', padding: '15px', borderRadius: '6px', display: 'inline-block', fontSize: '0.95rem' }
};

export default BookTicket;