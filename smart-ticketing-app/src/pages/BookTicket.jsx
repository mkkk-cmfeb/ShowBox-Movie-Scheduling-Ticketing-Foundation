import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function BookTicket() {
  const { id } = useParams(); // URL se Movie ID aayegi
  const navigate = useNavigate();
  
  // Data States
  const [movie, setMovie] = useState(null);
  const [cities, setCities] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  // Selection States
  const [selectedCityId, setSelectedCityId] = useState('');
  const [dates, setDates] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedShow, setSelectedShow] = useState(null); // Click kiye gaye show ki details

  const API_BASE = "https://localhost:7004/api";

  useEffect(() => {
    // 1. Aaj se aage ke 7 din generate karna
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      next7Days.push(d);
    }
    setDates(next7Days);
    setSelectedDateStr(next7Days[0].toDateString()); // Default: Aaj ki date

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 2. Ek sath saari 4 tables se data mangwana
      const [mRes, cRes, tRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/Movies`),
        fetch(`${API_BASE}/Cities`),
        fetch(`${API_BASE}/Theatres`),
        fetch(`${API_BASE}/ShowSchedules`)
      ]);

      const moviesData = await mRes.json();
      const citiesData = await cRes.json();
      const theatresData = await tRes.json();
      const schedulesData = await sRes.json();

      setMovie(moviesData.find(m => m.id === parseInt(id)));
      setCities(citiesData);
      setTheatres(theatresData);
      setSchedules(schedulesData);

      // 3. Default City 'Mumbai' Set Karna
      const mumbai = citiesData.find(c => c.name.toLowerCase() === 'mumbai');
      if (mumbai) {
        setSelectedCityId(mumbai.id.toString());
      } else if (citiesData.length > 0) {
        setSelectedCityId(citiesData[0].id.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 4. Data Filter aur Grouping Logic
  const getFilteredSchedules = () => {
    if (!selectedCityId || !selectedDateStr) return {};

    // Uss city ke saare theatres nikalo
    const cityTheatres = theatres.filter(t => t.cityId.toString() === selectedCityId);
    const cityTheatreIds = cityTheatres.map(t => t.id);

    // Sirf is movie, is city aur is date ke shows nikalo
    const filteredShows = schedules.filter(s => {
      const showDate = new Date(s.showDate).toDateString();
      return s.movieId === parseInt(id) && cityTheatreIds.includes(s.theatreId) && showDate === selectedDateStr;
    });

    // Theatres ke hisaab se group banao
    const theatreMap = {};
    filteredShows.forEach(show => {
      if (!theatreMap[show.theatreId]) {
        theatreMap[show.theatreId] = {
          theatreName: cityTheatres.find(t => t.id === show.theatreId)?.name,
          shows: []
        };
      }
      theatreMap[show.theatreId].shows.push(show);
    });

    return theatreMap;
  };

  const groupedSchedules = getFilteredSchedules();

  const getOrdinal = (n) => {
    if (n === 1) return "1st";
    if (n === 2) return "2nd";
    if (n === 3) return "3rd";
    return `${n}th`;
  };

  if (!movie) return <h2 style={{textAlign: 'center', marginTop: '50px'}}>Loading Movie Details...</h2>;

  return (
    <div style={styles.container}>
      
      {/* HEADER: Movie Title & City Dropdown */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>{movie.title}</h1>
          <span style={styles.badge}>{movie.genre}</span>
        </div>
        <div>
          <select 
            value={selectedCityId} 
            onChange={(e) => { setSelectedCityId(e.target.value); setSelectedShow(null); }}
            style={styles.citySelect}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      <hr style={{ border: '1px solid #ecf0f1', marginBottom: '20px' }} />

      {/* DATES: 7 Days Slider */}
      <div style={styles.datesContainer}>
        {dates.map((dateObj, idx) => {
          const isSelected = selectedDateStr === dateObj.toDateString();
          return (
            <div 
              key={idx} 
              onClick={() => { setSelectedDateStr(dateObj.toDateString()); setSelectedShow(null); }}
              style={{...styles.dateBox, backgroundColor: isSelected ? '#e74c3c' : 'transparent', color: isSelected ? 'white' : '#2c3e50', border: isSelected ? 'none' : '1px solid #bdc3c7'}}
            >
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dateObj.getDate()}</div>
              <div style={{ fontSize: '0.8rem' }}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
            </div>
          );
        })}
      </div>

      {/* THEATRES & SHOWS */}
      <div style={styles.theatreList}>
        {Object.keys(groupedSchedules).length === 0 ? (
          <div style={styles.noShows}>
            <h3>No shows available for this date and city.</h3>
          </div>
        ) : (
          Object.keys(groupedSchedules).map((tId) => {
            const theatreData = groupedSchedules[tId];
            return (
              <div key={tId} style={styles.theatreCard}>
                <div style={styles.theatreNameBox}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>❤ {theatreData.theatreName}</h3>
                </div>
                
                <div style={styles.timingsBox}>
                  {/* Shows ke buttons (1st Show, 2nd Show) */}
                  {theatreData.shows.sort((a,b) => a.showNumber - b.showNumber).map((show) => (
                    <button 
                      key={show.id} 
                      onClick={() => setSelectedShow(selectedShow?.id === show.id ? null : show)}
                      style={{...styles.timeButton, backgroundColor: selectedShow?.id === show.id ? '#2ecc71' : 'white', color: selectedShow?.id === show.id ? 'white' : '#2ecc71'}}
                    >
                      {getOrdinal(show.showNumber)} Show
                    </button>
                  ))}
                </div>

                {/* PRICING DETAILS (Jab user button par click karega) */}
                {selectedShow && theatreData.shows.find(s => s.id === selectedShow.id) && (
                  <div style={styles.pricingBox}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2c3e50' }}>
                      🕒 Exact Time: {new Date(selectedShow.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div style={styles.priceGrid}>
                      <div style={styles.priceItem}>Normal<br/><strong>₹{selectedShow.normalPrice}</strong></div>
                      <div style={styles.priceItem}>Premium<br/><strong>₹{selectedShow.premiumPrice}</strong></div>
                      <div style={styles.priceItem}>Executive<br/><strong>₹{selectedShow.executivePrice}</strong></div>
                    </div>
                    <button 
                      onClick={() => navigate(`/seats/${selectedShow.id}`)}
                      style={styles.proceedBtn}
                    >
                      Select Seats
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Styling
const styles = {
  container: { backgroundColor: '#f4f4f5', minHeight: '100vh', padding: '20px 5%', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' },
  badge: { display: 'inline-block', border: '1px solid #7f8c8d', padding: '3px 10px', borderRadius: '15px', fontSize: '0.8rem', color: '#7f8c8d', marginTop: '10px' },
  citySelect: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #bdc3c7', fontSize: '1rem', outline: 'none', cursor: 'pointer' },
  datesContainer: { display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' },
  dateBox: { padding: '10px 20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', minWidth: '60px', transition: 'all 0.3s' },
  theatreList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  theatreCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  theatreNameBox: { marginBottom: '15px' },
  timingsBox: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  timeButton: { padding: '10px 20px', border: '1px solid #2ecc71', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  pricingBox: { marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' },
  priceGrid: { display: 'flex', gap: '20px', marginBottom: '15px' },
  priceItem: { backgroundColor: 'white', padding: '10px 15px', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d', border: '1px solid #ecf0f1', flex: 1 },
  proceedBtn: { backgroundColor: '#e74c3c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  noShows: { textAlign: 'center', padding: '40px', color: '#7f8c8d', backgroundColor: 'white', borderRadius: '12px' }
};

export default BookTicket;