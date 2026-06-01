// File: src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://class.thetechmenders.com/api';
// const API_BASE_URL = 'https://localhost:7224/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session configuration
const SESSION_CONFIG = {
  WARNING_BEFORE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes before expiry
  ACTIVITY_THROTTLE_MS: 30 * 1000, // Update activity every 30 seconds
};

let sessionWarningShown = false;
let lastActivityUpdate = 0;

// Helper to check if token is expired
export const isTokenExpired = (): boolean => {
  const expirationTime = localStorage.getItem('token_expiration_time');
  if (!expirationTime) return true;
  return new Date(expirationTime) <= new Date();
};

// Helper to check if token will expire soon
export const isTokenExpiringSoon = (): boolean => {
  const expirationTime = localStorage.getItem('token_expiration_time');
  if (!expirationTime) return false;
  const timeUntilExpiry = new Date(expirationTime).getTime() - new Date().getTime();
  return timeUntilExpiry > 0 && timeUntilExpiry <= SESSION_CONFIG.WARNING_BEFORE_EXPIRY_MS;
};

// Get time remaining until token expiry (in milliseconds)
export const getTimeUntilExpiry = (): number => {
  const expirationTime = localStorage.getItem('token_expiration_time');
  if (!expirationTime) return 0;
  return Math.max(0, new Date(expirationTime).getTime() - new Date().getTime());
};

// Format time remaining for display
export const formatTimeRemaining = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

// Helper to clear auth data and redirect to login
export const clearAuthAndRedirect = (reason?: string) => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('publisher_id');
  localStorage.removeItem('token_expiration_time');
  localStorage.removeItem('publisher_full_name');
  localStorage.removeItem('publisher_email');
  localStorage.removeItem('is_profile_completed');
  
  // Store logout reason for display on login page
  if (reason) {
    sessionStorage.setItem('logout_reason', reason);
  }
  
  window.location.href = '/login';
};

// Update last activity timestamp
export const updateLastActivity = () => {
  const now = Date.now();
  if (now - lastActivityUpdate > SESSION_CONFIG.ACTIVITY_THROTTLE_MS) {
    localStorage.setItem('last_activity', new Date().toISOString());
    lastActivityUpdate = now;
  }
};

// Get session info
export const getSessionInfo = () => {
  const token = localStorage.getItem('access_token');
  const expirationTime = localStorage.getItem('token_expiration_time');
  const publisherId = localStorage.getItem('publisher_id');
  const publisherName = localStorage.getItem('publisher_full_name');
  const lastActivity = localStorage.getItem('last_activity');
  
  return {
    isActive: !!token && !isTokenExpired(),
    token,
    expirationTime,
    publisherId,
    publisherName,
    lastActivity,
    timeRemaining: getTimeUntilExpiry(),
    isExpiringSoon: isTokenExpiringSoon(),
  };
};

// Request interceptor to attach Bearer token and check expiry
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Check token expiry before making request (skip for login endpoint)
    if (token && !config.url?.includes('/auth/login')) {
      if (isTokenExpired()) {
        clearAuthAndRedirect('Your session has expired. Please log in again.');
        return Promise.reject(new Error('Token expired'));
      }
      
      // Update last activity on each API call
      updateLastActivity();
      
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
      clearAuthAndRedirect('Your session has expired or is invalid. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
