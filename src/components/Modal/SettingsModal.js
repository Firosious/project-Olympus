import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [sex, setSex] = useState('male');
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(0);

  useEffect(() => {
    if (user && user.sex) {
      setSex(user.sex);
    }
    if (user && user.heightInCm) {
      const totalInches = user.heightInCm / 2.54;
      setHeightFeet(Math.floor(totalInches / 12));
      setHeightInches(Math.round(totalInches % 12));
    }
  }, [user]);

  const handleSexChange = (e) => {
    setSex(e.target.value);
  };

  const handleHeightFeetChange = (e) => {
    setHeightFeet(e.target.value);
  };

  const handleHeightInchesChange = (e) => {
    setHeightInches(e.target.value);
  };

  const saveSettings = async () => {
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
            name="heightFeet"
            value={heightFeet}
            onChange={handleHeightFeetChange}
          /> feet
          <input
            className="height-input"
            type="number"
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