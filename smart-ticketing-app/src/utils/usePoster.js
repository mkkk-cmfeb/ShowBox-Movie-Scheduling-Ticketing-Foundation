import { useEffect, useState } from 'react';
import { fetchPosterByTitle, fetchMovieDetailsByTitle, POSTER_FALLBACK } from './posterApi.js';

// React hook that resolves a poster URL for a movie title.
export function usePoster(title) {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPoster(null);

    if (!title) {
      setPoster(POSTER_FALLBACK);
      return;
    }

    fetchPosterByTitle(title).then((url) => {
      if (!cancelled) setPoster(url || POSTER_FALLBACK);
    });

    return () => {
      cancelled = true;
    };
  }, [title]);

  return poster;
}

// React hook that resolves both the poster URL and the plot description
// for a movie title in a single API lookup.
export function useMovieDetails(title) {
  const [details, setDetails] = useState({ poster: null, description: null });

  useEffect(() => {
    let cancelled = false;
    setDetails({ poster: null, description: null });

    if (!title) return;

    fetchMovieDetailsByTitle(title).then((result) => {
      if (!cancelled) {
        setDetails({
          poster: (result && result.poster) || POSTER_FALLBACK,
          description: result ? result.description : null
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [title]);

  return details;
}
