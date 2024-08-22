const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const authMiddleware = require('../middleware/auth');
const db = require('../config/db')


// Get User Profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; 
  
    const [collections] = await db.promise().query('SELECT * FROM Collections WHERE user_id = ?', [userId]);

    const [items] = await db.promise().query('SELECT * FROM Items WHERE user_id = ?', [userId]);

    res.json({ collections, items });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
