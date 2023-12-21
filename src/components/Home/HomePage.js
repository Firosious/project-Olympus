// src/components/HomePage/HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./HomePage.css";
import googleIcon from "../../img/g-logo.png";

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignInClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = encodeURIComponent("http://localhost:3000/callback");
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
    );
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = authUrl; // Redirects the user in the same window
  };

  // Redirect to dashboard if user is authenticated
  if (user) {
    navigate("/dashboard");
  }

  return (
    <div className="HomePage">
      <header className="HomePage-header">
        <h1>Project Olympus Mons</h1>
        <p>Your Gateway to a Sustainable Future</p>
      </header>
      <section className="HomePage-content">
        <p>
          Developed as part of the CS385 Mobile Application Development course
          at Maynooth University, Project Olympus Mons is a testament to the
          power of technology in promoting sustainable environmental practices.
          Created by a team of four dedicated students - Firose, Éanna, Patrick,
          and Audrius, this app empowers individuals to understand and reduce
          their carbon footprint.
        </p>
        <p>
          Embracing the course theme of "A Sustainable Environment", our
          application offers a unique platform to track and visualize the
          environmental impact of daily transport choices. By opting for walking
          over car travel, users can see real-time data on how much carbon
          emissions they save, fostering a sense of responsibility and
          motivation towards eco-friendly habits.
        </p>
        <p>
          The project represents a significant part of our course grade,
          reflecting our commitment to applying theoretical knowledge in a
          practical, impactful manner. We chose React JavaScript for its
          versatility and support, coupled with MongoDB for efficient data
          management, and utilised various APIs like Google Fit user-specific
          data collection.
        </p>
        <p>
          Collaborative coding and version control were managed through GitHub,
          enhancing teamwork and productivity. Our repository{" "}
          <a
            href="https://github.com/project-OlympusMons"
            target="_blank"
            rel="noopener noreferrer"
          >
            Project Olympus Mons GitHub
          </a>
          , documents our journey, challenges, and successes.
        </p>
        <div className="dependencies-container">
          <div>
            <p>
              <u>Key dependencies we used in our project:</u>
            </p>
            <ul>
              <li>
                <span className="dependency-name">React Router</span> for
                dynamic and responsive navigation.
              </li>
              <li>
                <span className="dependency-name">Axios</span> for API
                integration and data fetching.
              </li>
              <li>
                <span className="dependency-name">Recharts</span> for visually
                representing carbon emission data.
              </li>
              <li>
                <span className="dependency-name">Mongoose</span> for
                streamlined database operations.
              </li>
              <li>
                <span className="dependency-name">Express</span> as the backend
                framework for API development.
              </li>
            </ul>
          </div>
          <div>
            <p>
              <u>Key technologies we used in our project:</u>
            </p>
            <ul>
              <li>
                <span className="api-name">Google Fit API:</span> For real-time
                tracking of physical activities such as walking or cycling.
              </li>
              <li>
                <span className="api-name">React JavaScript:</span> To build a
                dynamic and responsive user interface, ensuring a seamless
                experience across different devices.
              </li>
              <li>
                <span className="api-name">MongoDB:</span> Chosen for its
                flexibility and scalability, our backend database efficiently
                manages user data and activity logs.
              </li>
            </ul>
          </div>
        </div>

        <p>
          Join us as we pave the way to a more sustainable future. Every step
          counts in our collective journey to reduce carbon emissions and foster
          a healthier planet.
        </p>
        <button onClick={handleSignInClick} className="HomePage-loginButton">
          <img
            src={googleIcon}
            alt="Google sign-in"
            className="googleSignInIcon"
          />
          Sign in with Google
        </button>
      </section>
    </div>
  );
}

export default HomePage;
