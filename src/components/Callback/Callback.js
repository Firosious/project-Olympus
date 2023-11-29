// Callback.js
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = queryParams.get('access_token');

    if (accessToken) {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then(response => response.json())
      .then(data => {
        const user = {
          firstName: data.given_name,
          googleId: data.sub // Assuming 'sub' is the Google ID
        };

        // Save user data to backend
        fetch('http://localhost:5000/api/users/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        })
        .then(res => res.json())
        .then(savedUser => {
          // Perform login in AuthContext
          login(savedUser);
        })
        .catch(err => {
          console.error('Error saving user data:', err);
        });

        localStorage.setItem('googleAccessToken', accessToken);
        if (window.opener) {
          window.opener.postMessage({ success: true, user }, window.location.origin);
          window.close();
        } else {
          navigate('/dashboard');
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        if (window.opener) {
          window.opener.postMessage({ success: false }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
      });
    } else {
      if (window.opener) {
        window.opener.postMessage({ success: false }, window.location.origin);
        window.close();
      } else {
        navigate('/login');
      }
    }
  }, [navigate, login]);

  return <div>Loading...</div>;
}

export default Callback;
