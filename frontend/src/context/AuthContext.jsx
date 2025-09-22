// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Check localStorage for token/user info on initial load
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Finished checking auth status
  }, []);

  const login = (email) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    localStorage.setItem('userEmail', email);
    toast.success('Login successful!');
  };

  const logout = () => {
    setUserEmail(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userEmail');
    toast.info('Logged out successfully!');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout, isLoading }}>
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