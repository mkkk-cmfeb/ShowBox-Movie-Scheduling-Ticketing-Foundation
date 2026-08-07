import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider.jsx';
import MoviePoster from '../components/MoviePoster.jsx';

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080/api/Movies";

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(API_BASE);
        if (response.ok) {
          const data = await response.json();
          setMovies(data.filter((m) => m.isActive));
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', paddingBottom: '50px' }}>

      <HeroSlider movies={movies} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h2 style={styles.sectionTitle}>Recommended Movies</h2>

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', marginTop: '50px' }}>
            Loading movies...
          </p>
        ) : movies.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No movies available right now.</p>
        ) : (
          <div style={styles.movieGrid}>
            {movies.map((movie) => (
              <div key={movie.id} style={styles.movieCard}>
                <MoviePoster
                  title={movie.title}
                  style={styles.poster}
                />
                <div style={styles.cardDetails}>
                  <h3 style={styles.movieTitle}>{movie.title}</h3>
                  <p style={styles.movieGenre}>{movie.genre}</p>
                  <button
                    style={styles.bookButton}
                    onClick={() => navigate(`/book/${movie.id}`)}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#f39c12')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#f1c40f')}
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
  sectionTitle: { color: '#333', fontSize: '1.8rem', marginTop: '40px', marginBottom: '20px', fontWeight: '700' },
  movieGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' },
  movieCard: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, boxShadow 0.3s ease', display: 'flex', flexDirection: 'column' },
  poster: { aspectRatio: '2/3', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' },
  cardDetails: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  movieTitle: { margin: '0 0 5px 0', fontSize: '1.15rem', color: '#2c3e50', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  movieGenre: { margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '0.9rem' },
  bookButton: { backgroundColor: '#f1c40f', color: '#2c3e50', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: 'background-color 0.3s', marginTop: 'auto' }
};

export default Home;
