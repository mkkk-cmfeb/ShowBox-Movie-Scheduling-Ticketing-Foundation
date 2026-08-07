// Movie poster API utility using the OMDb API (open source, key-based).
// Docs: https://www.omdbapi.com/

const OMDb_URL = "https://www.omdbapi.com/";
const API_KEY = "8cdc8ae4";
const CACHE_KEY = "showbox_poster_cache_v3";
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
const REQUEST_TIMEOUT = 8000;

// Deduplicates in-flight lookups so multiple components requesting the
// same title do not hammer the API with duplicate requests.
const inFlight = {};

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch (error) {
    return {};
  }
};

const writeCache = (key, value) => {
  const cache = readCache();
  cache[key] = { ...value, ts: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // Storage full or unavailable; ignore.
  }
};

const cleanTitle = (title) =>
  title
    .replace(/\b\d{4}\b/g, "")
    .replace(/[()\-_.:/&,']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
};

// Query OMDb by exact title. Returns the poster URL or null.
const lookupByTitle = async (title) => {
  const params = new URLSearchParams({
    apikey: API_KEY,
    t: title,
    type: "movie"
  });
  const data = await fetchWithTimeout(`${OMDb_URL}?${params.toString()}`);
  if (data.Response === "True") {
    return {
      poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
      description: data.Plot && data.Plot !== "N/A" ? data.Plot : null
    };
  }
  return null;
};

// Resolves both the poster URL and plot description for a title.
export async function fetchMovieDetailsByTitle(title) {
  if (!title) return null;

  const cacheKey = cleanTitle(title).toLowerCase();

  // Serve from cache first.
  const cache = readCache();
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { poster: cached.poster, description: cached.description };
  }

  // Reuse an in-flight request for the same title.
  if (inFlight[cacheKey]) {
    return inFlight[cacheKey];
  }

  inFlight[cacheKey] = (async () => {
    try {
      // Try the raw title first, then a cleaned version as a fallback.
      const results = [await lookupByTitle(title), await lookupByTitle(cleanTitle(title))];
      const details = results.find((item) => item);
      if (details) {
        writeCache(cacheKey, details);
        return details;
      }
    } catch (error) {
      console.warn(`Movie lookup failed for "${title}":`, error);
    }

    writeCache(cacheKey, { poster: null, description: null });
    return { poster: null, description: null };
  })();

  try {
    return await inFlight[cacheKey];
  } finally {
    delete inFlight[cacheKey];
  }
}

// Backwards-compatible helper that only returns the poster URL.
export async function fetchPosterByTitle(title) {
  const details = await fetchMovieDetailsByTitle(title);
  return details ? details.poster : null;
}

export const POSTER_FALLBACK =
  "https://placehold.co/300x450/2c3e50/ffffff?text=No+Poster+Available";
