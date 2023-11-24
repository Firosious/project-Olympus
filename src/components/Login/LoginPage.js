import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust the path as necessary
import './LoginPage.css';

const clientId = "202884518480-r03osi0so4qluiu3bd7vhqrmr674d4cp.apps.googleusercontent.com";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Add this to use the login function from AuthContext

  const handleCallbackResponse = useCallback((response) => {
    console.log("Encoded JWT ID token: " + response.credential);
    const user = getUserFromResponse(response);
    login(); // Set the authentication state to logged in
    navigate('/dashboard', { state: { user } });
  }, [navigate, login]); // Add login to the dependency array

  const getUserFromResponse = (response) => {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { given_name } = JSON.parse(jsonPayload);
    return { firstName: given_name };
  };

  const initializeGoogleSignIn = useCallback(() => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCallbackResponse
    });

    /* global google */
    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );

    google.accounts.id.prompt();
  }, [handleCallbackResponse]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initializeGoogleSignIn();
    };

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, [initializeGoogleSignIn]); // Now initializeGoogleSignIn is included as a dependency

  return (
    <div className="LoginPage">
      <div id="signInDiv"></div>
      {/* You can add more login related content here */}
    </div>
  );
}

export default LoginPage;
