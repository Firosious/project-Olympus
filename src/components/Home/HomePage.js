// src/components/HomePage/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // Make sure you have some basic styles defined in HomePage.css
import bannerImage from "../../img/banner.jpg";
import footerImage from "../../img/footer.jpg";

function HomePage() {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/login"); // This will redirect the user to the login page
  };

  const Banner = () => {
    return (
      <div>
        <img src={bannerImage} alt="Banner" /> 
      </div>
    );
  };

  return (
    <div className="HomePage">
      <header className="HomePage-header">
        <Banner />
      </header>
      <section className="HomePage-content">
        <p>
          Project Olympus Mons tracks daily steps, providing insights into 
          physical activity and its environmental impact. It calculates 
          carbon footprint based on activity, encouraging individuals
          to become more conscious of their ecological footprint.
        </p>
        <button onClick={redirectToLogin} className="HomePage-loginButton">
          Sign In with Google
        </button>
      </section>
      <footer className="HomePage-footer">
        <h1>Meet the team:
          Firose, Patrick, Éanna, Audrius
        </h1>
        <img src={footerImage} alt="Footer" /> 
      </footer>
    </div>
  );
}

export default HomePage;
