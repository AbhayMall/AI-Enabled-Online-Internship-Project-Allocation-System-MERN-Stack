import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      if (token) {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          setRole(data.user.role);
          localStorage.setItem('role', data.user.role);
        }
      }
    } catch (error) {
      console.error('Failed to authenticate session:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      setToken(data.token);
      setUser(data.user);
      setRole(data.user.role);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!token,
      }}
    >
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

export default AuthContext;
