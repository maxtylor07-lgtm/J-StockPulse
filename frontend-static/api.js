// ──────────────────────────────────────────────────────────
// api.js — tiny fetch wrapper shared across all frontend pages
// ──────────────────────────────────────────────────────────

// Override this from the browser console if you host the backend elsewhere:
//   localStorage.setItem('sp_api_base', 'https://my-backend.example.com')
window.API_BASE =
  localStorage.getItem('sp_api_base') ||
  (location.port === '5000' || location.port === ''
    ? ''                          // same-origin (Express serves both)
    : 'http://localhost:5000');  // frontend on :3000 → backend on :5000

const TOKEN_KEY = 'sp_token';
const USER_KEY = 'sp_user';

window.Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch (_e) { return null; }
  },
  isLoggedIn() { return !!localStorage.getItem(TOKEN_KEY); },
  logout() { this.clear(); window.location.href = 'index.html'; },
};

/**
 * api(path, { method, body }) → Promise<data>
 * Automatically attaches Authorization header when a token is stored.
 * Throws with .message === server "error" string on non-2xx.
 */
window.api = async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = window.Auth.getToken();
  const res = await fetch(`${window.API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch (_e) { /* empty body */ }

  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};
