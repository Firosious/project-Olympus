import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "../Modal/SettingsModal";
import { fetchStepData } from "../../services/GoogleFitService";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [totalSteps, setTotalSteps] = useState(0);
  const [pace, setPace] = useState("");

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("googleAccessToken");
    if (accessToken) {
      fetchStepData(accessToken).then((fetchedSteps) => {
        console.log("Fetched Steps from Google Fit:", fetchedSteps);
        setTotalSteps(fetchedSteps);
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDataReport = () => {
    navigate("/analysis");
  };

  const handleSyncData = () => {
    const accessToken = localStorage.getItem("googleAccessToken");
    if (accessToken && user) {
      // Set endDate to the current date
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      // Set startDate to January 1st of the current year
      let startDate = new Date(new Date().getFullYear(), 0, 1);

      fetch("http://localhost:5000/api/fitnessData/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          accessToken,
          startDate: startDate.toISOString(), // Convert to ISO string
          endDate: endDate.toISOString(),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to sync data");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data.message);
          // Update the UI or notify the user that the data has been synced successfully.
        })
        .catch((error) => {
          console.error("Error syncing data:", error);
          // Update the UI to notify the user of the failure.
        });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Pace: ", pace, "Total Steps: ", totalSteps);
    // Add submit logic here
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
          <button onClick={handleSyncData}>Sync Data</button>
          <button onClick={toggleSettingsModal}>Settings</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="Dashboard-content">
        <h2>Welcome {user?.firstName || "User"}!</h2>
        <h3>Daily Steps Total: {totalSteps}</h3>
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
          <button type="submit">Submit</button>
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
