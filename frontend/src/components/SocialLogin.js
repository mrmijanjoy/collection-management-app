import React from 'react';
import { auth, googleProvider, facebookProvider, twitterProvider, appleProvider } from '../firebase';
import { FaGoogle, FaFacebook, FaTwitter, FaApple } from 'react-icons/fa';

const providers = {
  Google: googleProvider,
  Facebook: facebookProvider,
  Twitter: twitterProvider,
  Apple: appleProvider,
};

const SocialLogin = () => {
  const handleLogin = async (provider) => {
    try {
      const result = await auth.signInWithPopup(provider);
      const token = await result.user.getIdToken();

      // token sending
      const response = await fetch('/http://localhost:5000/auth/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Backend response:', data);
    } catch (error) {
      console.error(`Error logging in with ${provider.providerId.split('.')[0]}:`, error);
    }
  };

  return (
    <div className="social-login-container">
      {Object.entries(providers).map(([name, provider]) => {
        let Icon;
        switch (name) {
          case 'Google':
            Icon = <FaGoogle />;
            break;
          case 'Facebook':
            Icon = <FaFacebook />;
            break;
          case 'Twitter':
            Icon = <FaTwitter />;
            break;
          case 'Apple':
            Icon = <FaApple />;
            break;
          default:
            Icon = null;
        }

        return (
          <button key={name} onClick={() => handleLogin(provider)} className="social-button">
            {Icon} Login with {name}
          </button>
        );
      })}
    </div>
  );
};

export default SocialLogin;
