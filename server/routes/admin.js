// src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { getConnection } = require('../config/db');

// Function to execute a query
const executeQuery = async (query, params = []) => {
    return new Promise((resolve, reject) => {
        getConnection((err, connection) => {
            if (err) return reject(err);
            
            connection.query(query, params, (error, results) => {
                connection.release();
                if (error) return reject(error);
                resolve(results);
            });
        });
    });
};

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
    try {
        const results = await executeQuery('SELECT * FROM users');
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Block user
router.post('/users/:id/block', adminMiddleware, async (req, res) => {
    try {
        await executeQuery('UPDATE users SET isBlocked = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'User blocked successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to block user' });
    }
});

// Unblock user
router.post('/users/:id/unblock', adminMiddleware, async (req, res) => {
    try {
        await executeQuery('UPDATE users SET isBlocked = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'User unblocked successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to unblock user' });
    }
});

// Delete user
router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
        await executeQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Add to admins
router.post('/users/:id/make-admin', adminMiddleware, async (req, res) => {
    try {
        await executeQuery('UPDATE users SET isAdmin = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'User is now an admin' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to make user admin' });
    }
});

// Remove from admins
router.post('/users/:id/remove-admin', adminMiddleware, async (req, res) => {
    try {
        await executeQuery('UPDATE users SET isAdmin = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'User is no longer an admin' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to remove admin rights' });
    }
});

module.exports = router;
