import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";
import googleIcon from "../../img/g-logo.png";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const getUserFromResponse = useCallback((response) => {
    const base64Url = response.credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const payload = JSON.parse(jsonPayload);
    return { firstName: payload.given_name };
  }, []);

  const handleCallbackResponse = useCallback(
    (response) => {
      console.log("Encoded JWT ID token: " + response.credential);
      const user = getUserFromResponse(response);
      login(); // Set the authentication state to logged in
      navigate("/dashboard", { state: { user } });
    },
    [navigate, login, getUserFromResponse]
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCallbackResponse,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCallbackResponse]);

  const handleSignInClick = () => {
    window.google.accounts.id.prompt(); // Triggers the Google Sign-In prompt
  };

  return (
    <div className="LoginPage">
      <button onClick={handleSignInClick} className="googleSignInButton">
        <img src={googleIcon} alt="Google sign-in" />
        Sign in with Google
      </button>
    </div>
  );
}

export default LoginPage;
