// Base client for the ArenaFlow Spring Boot API.
// Backend runs on port 1545 (see application.properties); frontend dev server on 1546 (CORS allowed in WebConfig).
const BASE_URL = 'http://localhost:1545/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error(
      'Could not reach the ArenaFlow server. Is the backend running on http://localhost:1545?'
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const text = await res.text();
      if (text) message = text;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // A handful of backend endpoints (e.g. recalculate-standings, update-standings) return
    // a plain confirmation string like "Standings updated for match ..." on success rather
    // than JSON. None of those callers use the resolved value, so returning the raw text
    // instead of throwing keeps those calls working without special-casing each route.
    return text;
  }
}

export const get = (path) => request(path);
export const post = (path, body) =>
  request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
export const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const del = (path) => request(path, { method: 'DELETE' });

// Small helper: the backend assigns some entities their own UUID server-side (Tournament,
// Season, Match) but expects Team/Player/Venue to already carry an id, since they're saved
// directly via the repository. crypto.randomUUID() is available in all modern browsers.
export const newId = () => crypto.randomUUID();
