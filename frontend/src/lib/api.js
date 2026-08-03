import axios from "axios";

// 1. Mengarahkan URL utama Axios langsung ke REST API Supabase Anda
export const API_BASE = "https://hwajykehhncjnpowrbox.supabase.co/rest/v1";

const api = axios.create({ baseURL: API_BASE });

// 2. Interceptor otomatis untuk menyisipkan Anon Key Supabase di setiap request
api.interceptors.request.use((config) => {
  // Masukkan Legacy Anon Key (yang diawali 'eyJ...') milik Anda di sini
  const anonKey = "eyJhbG...REDACTED_ROTATE_KEY";
  
  config.headers["apikey"] = anonKey;
  config.headers["Authorization"] = `Bearer ${anonKey}`;
  
  return config;
});

// Interceptor tanggapan untuk menyelaraskan format data Supabase agar klop dengan komponen lama
api.interceptors.response.use(
  (response) => {
    // Komponen lama Anda mengharapkan objek tunggal untuk rute /info atau /auth/me
    if (response.config.url.includes("/info") || response.config.url.includes("/auth/me")) {
      if (Array.isArray(response.data)) {
        response.data = response.data[0] || null;
      }
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function formatApiError(err) {
  return err?.message || "Terjadi kesalahan";
}

export default api;