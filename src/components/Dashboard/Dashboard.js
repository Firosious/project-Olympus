import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SettingsModal from '../Modal/SettingsModal';
import { fetchStepData } from '../../services/GoogleFitService';
import { Co2SavedComponent } from '../../DataAnalysis/CalculateCo2';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [totalSteps, setTotalSteps] = useState(0);
  const [pace, setPace] = useState('');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('googleAccessToken');
    if (accessToken) {
      fetchStepData(accessToken).then(fetchedSteps => {
        console.log('Fetched Steps from Google Fit:', fetchedSteps); // Debugging log
        setTotalSteps(fetchedSteps);
      });
    } else {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDataReport = () => {
    navigate("/analysis");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Pace: ', pace, 'Total Steps: ', totalSteps); // Log the pace value and total steps
    props.onSubmit(Co2SavedComponent);
  };

  const handlePaceChange = (e) => {
    const value = Math.min(Math.max(0, e.target.value), 30); // Prevent negative values and limit to 30
    setPace(value);
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <div className="Dashboard">
      <div className="Dashboard-header">
        <h1>Project Olympus</h1>
        <div>
          <button onClick={handleDataReport}>Data Report</button>
          <button onClick={toggleSettingsModal}>Settings</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="Dashboard-content">
        <h2>Welcome {user?.firstName || 'User'}!</h2>
        <h3>Daily Steps Total: {totalSteps}</h3> {/* Display the total daily steps */}
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Pace:
              <input 
                type="number" 
                value={pace} 
                onChange={handlePaceChange} 
                max={30}
              />
            </label>
          </div>
          <button type="submit">Calculate my Co2 emissions saved by walking</button>
        </form>
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={toggleSettingsModal} 
      />
    </div>
  );
}

export default Dashboard;
