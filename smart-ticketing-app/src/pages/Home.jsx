import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


//this is the 1st git changes

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const API_BASE = "http://localhost:8080/api/Movies";
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setMovies(data.filter(m => m.isActive))
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* PREMIUM HERO BANNER */}
      <div style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <span style={styles.premierTag}>PREMIERE</span>
          <h1 style={{ fontSize: '3.5rem', margin: '10px 0', letterSpacing: '2px' }}>Kalki 2898 AD</h1>
          <p style={{ fontSize: '1.2rem', color: '#bdc3c7', maxWidth: '600px' }}>
            Experience the epic sci-fi saga in IMAX 3D.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <span style={styles.tag}>Sci-Fi</span>
            <span style={styles.tag}>Action</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h2 style={styles.sectionTitle}>Recommended Movies</h2>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '50px' }}>Loading blockbuster movies... 🍿</p>
        ) : movies.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No movies available right now.</p>
        ) : (
          <div style={styles.movieGrid}>
            {movies.map((movie) => (
              <div key={movie.id} style={styles.movieCard}>
                
                {/* DUMMY POSTER LOGIC (Aapki choice ke hisaab se) */}
                <div style={{...styles.poster, backgroundImage: `url('https://placehold.co/300x450/2c3e50/ffffff?text=${movie.title.replace(/ /g, '+')}')`}}>
                  <div style={styles.ratingBadge}>⭐ 8.5/10</div>
                </div>

                <div style={styles.cardDetails}>
                  <h3 style={styles.movieTitle}>{movie.title}</h3>
                  <p style={styles.movieGenre}>{movie.genre}</p>
                  
                  {/* 🚨 Yahan se Theatre aur Address poori tarah hata diya gaya hai 🚨 */}

                  <button 
                    style={styles.bookButton} 
                    // Ab hum Title ki jagah ID pass kar rahe hain, jo relational database ke liye best hai
                    onClick={() => navigate(`/book/${movie.id}`)}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f39c12'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f1c40f'}
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  heroBanner: { backgroundColor: '#1a1a2e', backgroundImage: 'linear-gradient(to right, #1a1a2e 40%, transparent), url("https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white', padding: '80px 5%', borderBottom: '4px solid #f1c40f' },
  heroContent: { maxWidth: '1200px', margin: '0 auto' },
  premierTag: { backgroundColor: '#f1c40f', color: '#2c3e50', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' },
  sectionTitle: { color: '#333', fontSize: '1.8rem', marginTop: '40px', marginBottom: '20px', fontWeight: '700' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' },
  movieCard: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, boxShadow 0.3s ease', display: 'flex', flexDirection: 'column' },
  poster: { height: '350px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  ratingBadge: { position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  cardDetails: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  movieTitle: { margin: '0 0 5px 0', fontSize: '1.2rem', color: '#2c3e50', fontWeight: 'bold' },
  movieGenre: { margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '0.9rem' },
  bookButton: { backgroundColor: '#f1c40f', color: '#2c3e50', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: 'background-color 0.3s', marginTop: 'auto' }
};

export default Home;