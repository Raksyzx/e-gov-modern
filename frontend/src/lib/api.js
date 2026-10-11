import axios from "axios";

// Supabase REST API config from env (CRA prefix: REACT_APP_)
const API_BASE = process.env.REACT_APP_SUPABASE_URL + '/rest/v1'
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!API_BASE || !ANON_KEY) {
  throw new Error(
    'Missing Supabase credentials. Set REACT_APP_SUPABASE_URL and ' +
    'REACT_APP_SUPABASE_ANON_KEY in .env.local'
  )
}

const api = axios.create({ baseURL: API_BASE });

// Auto-attach Supabase headers to every request
api.interceptors.request.use((config) => {
  config.headers["apikey"] = ANON_KEY;
  config.headers["Authorization"] = `Bearer ${ANON_KEY}`;
  return config;
});

// Normalize Supabase response format for legacy components
api.interceptors.response.use(
  (response) => {
    if (response.config.url.includes("/info") || response.config.url.includes("/auth/me")) {
      if (Array.isArray(response.data)) {
        response.data = response.data[0] || null;
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export function formatApiError(err) {
  return err?.message || "Terjadi kesalahan";
}

export default api;