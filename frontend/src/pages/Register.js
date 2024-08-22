import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = i18n.language === 'bn' ? 'bengali' : '';
  }, [i18n.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/register', formData);
      if (data.success) {
        navigate('/login'); 
      } else {
        setError(data.message); 
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('registrationFailed')); 
    } finally {
      setLoading(false);
    }
  };

  const navigateToSocialLogin = () => {
    navigate('/social-login');
  };
  
  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container register-container">
      <h2 className="mt-5 mb-2">{t('register')}</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">{t('username')}</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">{t('email')}</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">{t('password')}</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">{t('confirmPassword')}</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t('registering') : t('register')}
        </button>
      </form>
      <button 
        type="button" 
        onClick={navigateToSocialLogin} 
        className="btn btn-link mt-3 social-login-button"
      >
        {t('registerWithSocial')}
      </button>
      <Button variant="link" onClick={navigateToLogin} className="mt-3 login-button">
        {t('login')}
      </Button>
    </div>
  );
};

export default Register;
