import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from '../Navbar/Navbar.js'; // Ensure this path is correct for your project
import SettingsModal from "../Modal/SettingsModal"; // Update this path as needed
import { fetchStepData } from "../../services/GoogleFitService";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const [totalSteps, setTotalSteps] = useState(0);
  const [pace, setPace] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("googleAccessToken");
    if (accessToken) {
      fetchStepData(accessToken).then((fetchedSteps) => {
        setTotalSteps(fetchedSteps);
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Pace: ", pace, "Total Steps: ", totalSteps);
  };

  const handlePaceChange = (e) => {
    setPace(Math.min(Math.max(0, e.target.value), 30));
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <div className="Dashboard">
      <Navbar onDashboard={true} />
      <div className="Dashboard-content">
        <h2>Welcome {user?.firstName || "User"}!</h2>
        <h3>Daily Steps Total: {totalSteps}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Pace:
              <input type="number" value={pace} onChange={handlePaceChange} max={30} />
            </label>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={toggleSettingsModal} />
    </div>
  );
}

export default Dashboard;
