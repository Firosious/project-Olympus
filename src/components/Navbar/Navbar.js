import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "../Modal/SettingsModal";
import "./Navbar.css";
import dashboardIcon from "../../img/navbar/dashboard.png";
import analysisIcon from "../../img/navbar/analysis.png";
import leaderboardIcon from "../../img/navbar/leaderboard.png";
import settingsIcon from "../../img/navbar/settings.png";
import logoutIcon from "../../img/navbar/logout.png";
import carbonCompareLogo from "../../img/navbar/carbonCompareLogo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navigateToDashboard = () => {
    navigate("/dashboard");
  };

  const navigateToDataReport = () => {
    navigate("/analysis");
  };

  const navigateToLeaderboard = () => {
    navigate("/leaderboard");
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <div className="navbar-container">
      <img className="navbar-logo" src={carbonCompareLogo} alt="Carbon Compare Logo"/>
      <div className="navbar-buttons">
        <button className="navbar-button" onClick={navigateToDashboard}>
          <img src={dashboardIcon} alt="" /> Dashboard
        </button>
        <button className="navbar-button" onClick={navigateToDataReport}>
          <img src={analysisIcon} alt="" /> Data Report
        </button>
        <button className="navbar-button" onClick={navigateToLeaderboard}>
          <img src={leaderboardIcon} alt="" /> Leaderboard
        </button>
        <button className="navbar-button" onClick={toggleSettingsModal}>
          <img src={settingsIcon} alt="" /> Settings
        </button>
        <button className="navbar-button" onClick={handleLogout}>
          <img src={logoutIcon} alt="" /> Logout
        </button>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={toggleSettingsModal}
      />
    </div>
  );
};

export default Navbar;
