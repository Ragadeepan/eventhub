import axios from 'axios';
import { auth } from './firebase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token on every request
api.interceptors.request.use(async (config) => {
  try {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const stored = localStorage.getItem('eventhub_token');
      if (stored) config.headers.Authorization = `Bearer ${stored}`;
    }
  } catch { /* no token */ }
  return config;
});

// Unified error handling — unwrap the { success, data, message } envelope
api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('eventhub_token');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
