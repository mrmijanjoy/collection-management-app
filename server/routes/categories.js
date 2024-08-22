const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');

// wrap getConnection in a promise
const getConnectionPromise = () => {
  return new Promise((resolve, reject) => {
    getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
};

// Route to get all categories
router.get('/categories', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM category',
      (err, rows) => {
        connection.release();

        if (err) {
          console.error('Error fetching categories:', err);
          return res.status(500).json({ error: 'Failed to fetch categories' });
        }

        res.json(rows);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Route to add a new category
router.post('/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'INSERT INTO category (name) VALUES (?)',
      [name],
      (err, result) => {
        connection.release(); 

        if (err) {
          console.error('Error adding category:', err);
          return res.status(500).json({ error: 'Failed to add category' });
        }

        res.status(201).json({ id: result.insertId, name });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

module.exports = router;
