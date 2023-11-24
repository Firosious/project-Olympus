// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Go two levels up
import './Dashboard.css'; // Make sure you define the styles in Dashboard.css

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // You would replace these with actual user data
  const user = location.state?.user || { firstName: 'User' };
  const [steps, setSteps] = useState('');
  const [pace, setPace] = useState('');

  const handleLogout = () => {
    // Here you would clear the session/storage and navigate to login or home
    logout();
    navigate('/');
  };

  const handleDataReport = () => {
    // Here you would navigate to the data report page
    navigate('/analysis');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit the steps and pace to the backend
    console.log(steps, pace);
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
                onChange={(e) => setSteps(e.target.value)} 
              />
            </label>
          </div>
          <div>
            <label>
              Pace:
              <input 
                type="number" 
                value={pace} 
                onChange={(e) => setPace(e.target.value)} 
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
