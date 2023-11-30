import React from 'react';
import './SettingsModal.css'; // You should create a corresponding CSS file

function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modalBackdrop">
      <div className="modalContent">
        <h2>User Settings</h2>
        <p>Settings content goes here...</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SettingsModal;