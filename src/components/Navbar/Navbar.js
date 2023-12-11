import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SettingsModal from "../Modal/SettingsModal"; // Update this path as needed

const Navbar = ({ onDashboard }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleNavButtonClick = () => {
    if (onDashboard) {
      navigate("/analysis");
    } else {
      navigate("/dashboard");
    }
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen(!isSettingsModalOpen);
  };

  return (
    <div className="Dashboard-header">
      <h1>Project Olympus</h1>
      <div>
        <button onClick={handleNavButtonClick}>{onDashboard ? "Data Report" : "Dashboard"}</button>
        <button onClick={toggleSettingsModal}>Settings</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={toggleSettingsModal} />
    </div>
  );
};

export default Navbar;
