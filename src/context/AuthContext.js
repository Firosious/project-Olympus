import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('userData');
    const loginTime = sessionStorage.getItem('loginTime');
    const sessionTimeout = 15 * 60 * 1000; // 15 minutes in milliseconds

    if (savedUser && loginTime) {
      const currentTime = new Date().getTime();
      const sessionEndTime = parseInt(loginTime, 10) + sessionTimeout;

      if (currentTime > sessionEndTime) {
        logout();
      } else {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false); // Set loading to false after initialization
  }, []);

  const login = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    sessionStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('loginTime', new Date().getTime().toString());
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('loginTime');
    localStorage.removeItem('googleAccessToken');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
