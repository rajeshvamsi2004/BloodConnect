import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // <-- STEP 1: Import axios
import { toast } from 'react-toastify';

// The API URL must be defined here to fetch the profile
const API_BASE_URL = 'https://bloodconnect-sev0.onrender.com';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  
  // --- NEW: State to hold the full user/donor object ---
  // This object will contain the user's _id, Name, Email, etc.
  const [user, setUser] = useState(null); 
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        try {
          // --- NEW: If email exists, fetch the full profile ---
          const response = await axios.get(`${API_BASE_URL}/profile/${storedEmail}`);
          setUser(response.data); // Store the full object
          setUserEmail(storedEmail);
          setIsAuthenticated(true);
        } catch (error) {
          // If the profile fetch fails (e.g., user deleted), log out
          console.error("Failed to fetch profile for stored email:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // --- MODIFIED: The login function is now async ---
  const login = async (email) => {
    try {
      setIsLoading(true);
      // --- NEW: After login, immediately fetch the user's profile ---
      const response = await axios.get(`${API_BASE_URL}/profile/${email}`);
      
      setUser(response.data); // Store the full user object
      setUserEmail(email);
      setIsAuthenticated(true);
      localStorage.setItem('userEmail', email);
      
      toast.success('Login successful!');
    } catch (error) {
      toast.error("Login failed. Could not fetch user profile.");
      logout(); // Clear any partial login state
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODIFIED: Logout now also clears the user object ---
  const logout = () => {
    setUser(null); // Clear the user object
    setUserEmail(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userEmail');
    toast.info('Logged out successfully!');
  };

  // --- MODIFIED: The context now provides the 'user' object ---
  const value = { 
    isAuthenticated, 
    user, // <-- Provide the full user object
    userEmail, 
    login, 
    logout, 
    isLoading 
  };

  return (
    <AuthContext.Provider value={value}>
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
