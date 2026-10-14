import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

// In production builds, VITE_API_URL must be set to your deployed backend URL.
// Without it, all /api/* requests go to the same origin — which will 404 on
// static hosting platforms (Netlify, Vercel, GitHub Pages) that don't run Node.js.
// Set VITE_API_URL in Netlify → Site settings → Environment variables.
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[TruthLens API] VITE_API_URL is not set. API calls will fail on static hosts. ' +
    'Set VITE_API_URL to your deployed backend URL (e.g. https://your-backend.railway.app) ' +
    'in your hosting platform environment variables and redeploy.'
  );
}

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If request returns 401 due to an expired/stale auth token, clean it up
    if (error.response?.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

