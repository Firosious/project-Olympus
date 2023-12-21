import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [sex, setSex] = useState('male');
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        // Fetch user details from the server
        try {
          const response = await fetch(`http://localhost:5000/api/users/details/${user.googleId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.sex) setSex(data.sex);
            if (data.heightInCm) {
              const totalInches = data.heightInCm / 2.54;
              setHeightFeet(Math.floor(totalInches / 12));
              setHeightInches(Math.round(totalInches % 12));
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    if (isOpen) {
      fetchUserDetails();
    }
  }, [user, isOpen]);

  const handleSexChange = (e) => {
    setSex(e.target.value);
  };

  const handleHeightFeetChange = (e) => {
    setHeightFeet(e.target.value);
  };

  const handleHeightInchesChange = (e) => {
    setHeightInches(e.target.value);
  };

  const validateHeight = () => {
    if (heightFeet < 2 || heightFeet > 8 || heightInches < 0 || heightInches > 11) {
      setAlertMessage('Invalid height. Feet should be between 2 and 8, and inches should be between 0 and 11.');
      return false;
    }
    setAlertMessage('');
    return true;
  };

  const saveSettings = async () => {
    if (!validateHeight()) return;

    const heightInCm = Math.round((heightFeet * 30.48) + (heightInches * 2.54));

    try {
      const response = await fetch('http://localhost:5000/api/users/updateSettings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.googleId, sex, heightInCm })
      });
      if (response.ok) {
        console.log('Settings saved successfully');
      } else {
        console.error('Error saving settings');
      }
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modalBackdrop">
      <div className="modalContent">
        <h2>User Settings</h2>

        {/* Alert message */}
        {alertMessage && <div className="alert-message">{alertMessage}</div>}
        
        {/* Sex selection */}
        <div>
          <label>Sex: </label>
          <input
            className="sex-radio"
            type="radio"
            name="sex"
            value="male"
            checked={sex === 'male'}
            onChange={handleSexChange}
          /> Male
          <input
            className="sex-radio"
            type="radio"
            name="sex"
            value="female"
            checked={sex === 'female'}
            onChange={handleSexChange}
          /> Female
        </div>

        {/* Height selection */}
        <div>
          <label>Height: </label>
          <input
            className="height-input"
            type="number"
            min="2"
            max="8"
            name="heightFeet"
            value={heightFeet}
            onChange={handleHeightFeetChange}
          /> feet
          <input
            className="height-input"
            type="number"
            min="0"
            max="11"
            name="heightInches"
            value={heightInches}
            onChange={handleHeightInchesChange}
          /> inches
        </div>

        <button onClick={saveSettings}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SettingsModal;
