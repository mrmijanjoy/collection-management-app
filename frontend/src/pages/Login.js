import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = i18n.language === 'bn' ? 'bengali' : '';
  }, [i18n.language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/login', { email, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token); 
        navigate('/admin');
      } else {
        setError(t('loginFailed'));
      }
    } catch (err) {
      console.error('Login request error:', err); 
      setError(err.response?.data?.msg || t('loginError'));
    }
  };  
  
  const navigateToSocialLogin = () => {
    navigate('/social-login');
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="container mt-5 login-container">
      <h2 className='mt-5 mb-2'>{t('login')}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>{t('email')}</Form.Label>
          <Form.Control 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder={t('enterEmail')} 
          />
        </Form.Group>
        <Form.Group controlId="formPassword">
          <Form.Label>{t('password')}</Form.Label>
          <Form.Control 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder={t('enterPassword')} 
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">{t('login')}</Button>
      </Form>
      <Button variant="link" onClick={navigateToSocialLogin} className="mt-3 social-login-button">
        {t('loginWithSocial')}
      </Button>
      <Button variant="link" onClick={navigateToRegister} className="mt-3 register-button">
        {t('register')}
      </Button>
    </div>
  );
};

export default Login;
