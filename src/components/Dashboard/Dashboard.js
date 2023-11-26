// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const user = location.state?.user || { firstName: 'User' };
  const [steps, setSteps] = useState('');
  const [pace, setPace] = useState('');

  const maxSteps = 100000;
  const maxPace = 100;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDataReport = () => {
    navigate("/analysis");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(steps, pace);
    // Submit the steps and pace to the backend
  };

  const handleStepsChange = (e) => {
    const value = Math.min(Math.max(0, e.target.value), maxSteps); // This will prevent negative values
    setSteps(value);
  };

  const handlePaceChange = (e) => {
    const value = Math.min(Math.max(0, e.target.value), maxPace); // This will prevent negative values
    setPace(value);
  };

  return (
    <div className="Dashboard">
      <div className="Dashboard-header">
        <h1>Project Olympus</h1>
        <div>
          <button onClick={handleDataReport}>Data Report</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="Dashboard-content">
        <h2>Welcome {user.firstName}!</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Steps:
              <input 
                type="number" 
                value={steps} 
                onChange={handleStepsChange} 
              />
            </label>
          </div>
          <div>
            <label>
              Pace:
              <input 
                type="number" 
                value={pace} 
                onChange={handlePaceChange} 
              />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
