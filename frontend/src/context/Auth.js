import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ isAuthenticated: false, user: null });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data) {
          setAuthState({ isAuthenticated: true, user: response.data });
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setAuthState({ isAuthenticated: true, user: response.data.user });
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/register', { username, email, password });
      if (response.data.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ isAuthenticated: false, user: null });
    navigate('/login');
  };

  const updateProfile = async (username, email) => {
    try {
      const response = await axios.put('http://localhost:5000/auth/profile', { username, email }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data) {
        setAuthState(prevState => ({ ...prevState, user: { ...prevState.user, username, email } }));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await axios.post('http://localhost:5000/auth/change-password', { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
