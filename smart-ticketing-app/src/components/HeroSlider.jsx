import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieDetails } from '../utils/usePoster.js';

function HeroSlide({ movie, onBook }) {
  const { poster, description } = useMovieDetails(movie?.title);
  const [failed, setFailed] = useState(false);

  return (
    <div style={styles.slide}>
      {poster && !failed && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          onError={() => setFailed(true)}
          style={styles.blurBg}
        />
      )}
      {poster && !failed && (
        <img
          src={poster}
          alt={movie?.title || 'Movie poster'}
          onError={() => setFailed(true)}
          style={styles.slideImg}
          className="hero-poster"
        />
      )}
      <div style={styles.slideOverlay} />
      <div style={styles.heroContent} className="hero-content">
        <span style={styles.premierTag}>PREMIERE</span>
        <h1 style={styles.title}>{movie?.title}</h1>
        {movie?.genre && (
          <div style={styles.tagRow}>
            {movie.genre.split(',').map((g) => (
              <span key={g.trim()} style={styles.tag}>{g.trim()}</span>
            ))}
          </div>
        )}
        {description && (
          <p style={styles.description}>{description}</p>
        )}
        <button
          style={styles.bookButton}
          onClick={() => movie && onBook(movie.id)}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#f39c12')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#f1c40f')}
        >
          Book Tickets
        </button>
      </div>
    </div>
  );
}

function HeroSlider({ movies }) {
  const navigate = useNavigate();
  const slides = movies && movies.length > 0 ? movies.slice(0, 6) : [];
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (slides.length === 0) return;
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  const goPrev = () => goTo(index - 1);
  const goNext = () => goTo(index + 1);

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, slides.length]);

  if (slides.length === 0) {
    return (
      <div style={{ ...styles.heroBanner, ...styles.slide }}>
        <div style={styles.heroContent}>
          <span style={styles.premierTag}>SHOWBOX</span>
          <h1 style={styles.title}>Experience Movies</h1>
          <p style={styles.subtitle}>No showings right now. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={styles.heroBanner}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={styles.viewport}>
        <div style={{ ...styles.track, transform: `translateX(-${index * 100}%)` }}>
          {slides.map((movie) => (
            <div key={movie.id} style={styles.slideWrap}>
              <HeroSlide movie={movie} onBook={(id) => navigate(`/book/${id}`)} />
            </div>
          ))}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button style={{ ...styles.arrow, left: '20px' }} onClick={goPrev} aria-label="Previous movie">
            &#10094;
          </button>
          <button style={{ ...styles.arrow, right: '20px' }} onClick={goNext} aria-label="Next movie">
            &#10095;
          </button>

          <div style={styles.dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{ ...styles.dot, backgroundColor: i === index ? '#f1c40f' : 'rgba(255,255,255,0.4)' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  heroBanner: {
    position: 'relative',
    height: '480px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    overflow: 'hidden',
    borderBottom: '4px solid #f1c40f'
  },
  viewport: { width: '100%', height: '100%', overflow: 'hidden' },
  track: {
    display: 'flex',
    height: '100%',
    transition: 'transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)',
    willChange: 'transform'
  },
  slideWrap: { flexShrink: 0, width: '100%', height: '100%' },
  slide: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#1a1a2e'
  },
  blurBg: { position: 'absolute', inset: '-30px', width: 'calc(100% + 60px)', height: 'calc(100% + 60px)', objectFit: 'cover', filter: 'blur(24px) brightness(0.6)', transform: 'scale(1.1)' },
  slideImg: { position: 'absolute', right: '6%', top: '50%', transform: 'translateY(-50%)', height: '78%', aspectRatio: '2 / 3', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 18px 40px rgba(0,0,0,0.6)', zIndex: 2 },
  slideOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, #1a1a2e 25%, rgba(26,26,46,0.85) 45%, rgba(26,26,46,0.25) 75%, rgba(26,26,46,0.6) 100%)' },
  heroContent: { maxWidth: '52%', minWidth: '320px', margin: '0 auto 0 0', padding: '0 6%', width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 3 },
  premierTag: { backgroundColor: '#f1c40f', color: '#2c3e50', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' },
  title: { fontSize: '3.5rem', margin: '12px 0 10px', letterSpacing: '2px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: '1.1' },
  subtitle: { fontSize: '1.2rem', color: '#bdc3c7', maxWidth: '600px', margin: 0 },
  tagRow: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', color: 'white' },
  description: { margin: '16px 0 0', color: '#d5dbe0', fontSize: '1.05rem', lineHeight: '1.6', maxHeight: '84px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' },
  bookButton: { backgroundColor: '#f1c40f', color: '#2c3e50', border: 'none', padding: '13px 34px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', transition: 'background-color 0.3s' },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10, width: '42px', height: '42px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.45)', color: '#f1c40f', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' },
  dots: { position: 'absolute', bottom: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 10 },
  dot: { width: '11px', height: '11px', borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', transition: 'background-color 0.3s' }
};

export default HeroSlider;
