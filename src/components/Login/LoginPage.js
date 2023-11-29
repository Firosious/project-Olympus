import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';
import googleIcon from '../../img/g-logo.png';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const redirectUri = encodeURIComponent('http://localhost:3000/callback');
const scope = encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.location.read');

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    // If user data exists in local storage, consider the user as authenticated
    const userData = localStorage.getItem('userData');
    if (userData) {
      login(JSON.parse(userData));
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.success) {
        login(event.data.user); // Update auth state
        navigate('/dashboard'); // Redirect to dashboard
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isAuthenticated, navigate, login]);

  const handleSignInClick = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.open(authUrl, 'googleLogin', 'width=500,height=600');
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
