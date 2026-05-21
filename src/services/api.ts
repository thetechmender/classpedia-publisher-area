// File: src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://class.thetechmenders.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check if token is expired
export const isTokenExpired = (): boolean => {
  const expirationTime = localStorage.getItem('token_expiration_time');
  if (!expirationTime) return true;
  return new Date(expirationTime) <= new Date();
};

// Helper to clear auth data and redirect to login
export const clearAuthAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('publisher_id');
  localStorage.removeItem('token_expiration_time');
  window.location.href = '/login';
};

// Request interceptor to attach Bearer token and check expiry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Check token expiry before making request (skip for login endpoint)
    if (token && !config.url?.includes('/auth/login')) {
      if (isTokenExpired()) {
        clearAuthAndRedirect();
        return Promise.reject(new Error('Token expired'));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

export default api;
