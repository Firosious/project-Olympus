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
          googleId: data.sub,
          firstName: data.given_name,
          lastName: data.family_name,
          email: data.email
        };
        console.log('Google API response:', data);
        console.log('User data to be sent:', user); // Add this line

        // Save user data to backend and handle the response
        return fetch('http://localhost:5000/api/users/authenticate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
      })
      .then(response => response.json())
      .then(savedUser => {
        // Update login state with the saved user data
        login(savedUser);
        localStorage.setItem('googleAccessToken', accessToken);

        // Navigate to dashboard or handle popup window
        if (window.opener) {
          window.opener.postMessage({ success: true, user: savedUser }, window.location.origin);
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
