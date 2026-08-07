import { useState } from 'react';
import { usePoster } from '../utils/usePoster.js';
import { POSTER_FALLBACK } from '../utils/posterApi.js';

function MoviePoster({ title, style }) {
  const poster = usePoster(title);
  const [failed, setFailed] = useState(false);

  const src = failed ? POSTER_FALLBACK : (poster || null);

  return (
    <div
      style={{
        ...style,
        backgroundColor: '#2c3e50',
        overflow: 'hidden'
      }}
    >
      {src && (
        <img
          src={src}
          alt={title || 'Movie poster'}
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </div>
  );
}

export default MoviePoster;
