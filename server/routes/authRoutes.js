const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { getConnection } = require('../config/db');
const admin = require('firebase-admin'); // Ensure you have Firebase Admin SDK initialized
const router = express.Router();

// Middleware to verify Firebase ID token
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Add user info to request
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
};

// Middleware to protect routes with JWT
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ msg: 'No token provided' });

  try {
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

// Example route for authenticated users
router.get('/user', authenticate, (req, res) => {
  res.send({ message: 'User is authenticated', user: req.user });
});

// Example route for admin (requires additional admin checks)
router.get('/admin', authenticate, (req, res) => {
  if (req.user.admin) {
    res.send({ message: 'Admin access granted' });
  } else {
    res.status(403).send('Forbidden');
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const connection = await getConnectionPromise();
    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
    connection.release();

    const newUser = { id: result.insertId, username, email };
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const connection = await getConnectionPromise();
    const [results] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();

    const user = results[0];
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken({ id: user.id, email: user.email });
    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Profile endpoint (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const connection = await getConnectionPromise();
    const [results] = await connection.query('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
    connection.release();

    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update profile endpoint (protected)
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ message: 'Username and email are required' });

  try {
    const connection = await getConnectionPromise();
    await connection.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, req.user.id]);
    connection.release();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password endpoint (protected)
router.post('/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new passwords are required' });

  try {
    const connection = await getConnectionPromise();
    const [results] = await connection.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = results[0];
    connection.release();

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect old password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Utility function to wrap getConnection in a promise
const getConnectionPromise = () => {
  return new Promise((resolve, reject) => {
    getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
};

module.exports = router;
