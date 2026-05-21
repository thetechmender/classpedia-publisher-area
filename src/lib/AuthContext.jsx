import React, { createContext, useState, useContext, useEffect } from 'react';
import { isTokenExpired, clearAuthAndRedirect } from '@/services/api';
import { CredentialService } from '@/services/credential.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
        return;
      }

      // Check if token is expired
      if (isTokenExpired()) {
        clearAuthAndRedirect();
        return;
      }

      // Token exists and is valid, set authenticated
      setIsAuthenticated(true);
      
      // Load user data from localStorage
      const publisherId = localStorage.getItem('publisher_id');
      const publisherFullName = localStorage.getItem('publisher_full_name');
      const publisherEmail = localStorage.getItem('publisher_email');
      const profileCompleted = localStorage.getItem('is_profile_completed') === 'true';
      
      setUser({
        publisherId: publisherId ? parseInt(publisherId) : null,
        publisherFullName,
        publisherEmail,
      });
      setIsProfileCompleted(profileCompleted);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await CredentialService.login({ usernameOrEmail, password });
      
      if (!response.isSuccess) {
        throw new Error(response.errorMessage || 'Login failed');
      }

      const { token, publisherId, tokenExpirationTime, publisherFullName, publisherEmail, isProfileCompleted: profileCompleted } = response.data;
      
      // Save to localStorage
      localStorage.setItem('access_token', token);
      localStorage.setItem('publisher_id', publisherId.toString());
      localStorage.setItem('token_expiration_time', tokenExpirationTime);
      localStorage.setItem('publisher_full_name', publisherFullName);
      localStorage.setItem('publisher_email', publisherEmail);
      localStorage.setItem('is_profile_completed', profileCompleted.toString());
      
      // Update state
      setUser({
        publisherId,
        publisherFullName,
        publisherEmail,
      });
      setIsAuthenticated(true);
      setIsProfileCompleted(profileCompleted);
      setAuthChecked(true);
      
      return { success: true, isProfileCompleted: profileCompleted };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.errorMessage || error.message || 'Login failed' 
      };
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setIsProfileCompleted(false);
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('publisher_id');
    localStorage.removeItem('token_expiration_time');
    localStorage.removeItem('publisher_full_name');
    localStorage.removeItem('publisher_email');
    localStorage.removeItem('is_profile_completed');
    
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const updateProfileCompleted = (completed) => {
    setIsProfileCompleted(completed);
    localStorage.setItem('is_profile_completed', completed.toString());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      authChecked,
      isProfileCompleted,
      login,
      logout,
      navigateToLogin,
      checkAppState,
      updateProfileCompleted
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
