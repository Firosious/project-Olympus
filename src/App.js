// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/Home/HomePage';
import LoginPage from './components/Login/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import Analysis from './components/DataAnalysis/Analysis'; // Import the Analysis component

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute>
              <Analysis /> {/* Protected Route for Analysis */}
            </ProtectedRoute>
          } />
          {/* ... other routes */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
