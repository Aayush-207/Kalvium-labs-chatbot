'use client';

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create context
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('idToken');
    if (token) {
      setIdToken(token);
      verifyUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyUser = async (token) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data.user);
    } catch (error) {
      console.error('Verification error:', error);
      localStorage.removeItem('idToken');
      setIdToken(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIdToken(null);
    localStorage.removeItem('idToken');
  };

  return (
    <AuthContext.Provider value={{ user, idToken, loading, logout, setIdToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
