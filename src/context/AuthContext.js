// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true'); // Store login state in localStorage
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn'); // Clear login state from localStorage
  };

  const checkAuthState = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(isLoggedIn);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkAuthState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
