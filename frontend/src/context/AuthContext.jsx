import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // sessionStorage is tab-isolated: each browser tab has its own independent session.
  // This prevents one user's login from overwriting another user's token in the same browser.
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Validate token and load user profile if token exists on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to load user profile, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profilePicture: res.data.profilePicture
      });
      setToken(res.data.token);
      sessionStorage.setItem('token', res.data.token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profilePicture: res.data.profilePicture
      });
      setToken(res.data.token);
      sessionStorage.setItem('token', res.data.token);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('token');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', profileData);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        profilePicture: res.data.profilePicture
      });
      // If server returns a new token (usually email update triggers it)
      if (res.data.token) {
        setToken(res.data.token);
        sessionStorage.setItem('token', res.data.token);
      }
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
