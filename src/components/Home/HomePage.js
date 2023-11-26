// src/components/HomePage/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // Make sure you have some basic styles defined in HomePage.css

function HomePage() {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/login"); // This will redirect the user to the login page
  };

  return (
    <div className="HomePage">
      <header className="HomePage-header">
        <h1>Welcome to Project Olympus</h1>
      </header>
      <section className="HomePage-content">
        <p>
          Project Olympus is a revolutionary platform that allows you to track
          your daily steps and pace, providing insights into your physical
          activity and its environmental impact. Our innovative system
          calculates your carbon footprint based on your activity, helping you
          to become more conscious of your ecological footprint. Join us on the
          journey to better health and a cleaner planet.
        </p>
        <button onClick={redirectToLogin} className="HomePage-loginButton">
          Sign In with Google
        </button>
      </section>
    </div>
  );
}

export default HomePage;
