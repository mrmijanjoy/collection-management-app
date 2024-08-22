const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const auth = require('../middleware/auth');

// wrap getConnection in a promise
const getConnectionPromise = () => {
  return new Promise((resolve, reject) => {
    getConnection((err, connection) => {
      if (err) reject(err);
      else resolve(connection);
    });
  });
};

// Get all tags
router.get('/', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM tags',
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error fetching tags:', err);
          return res.status(500).json({ message: 'Failed to fetch tags' });
        }

        res.json(results);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ message: 'Failed to connect to the database' });
  }
});

// Add a new tag
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tag name is required' });
  }

  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'INSERT INTO tags (name) VALUES (?)',
      [name],
      (err, result) => {
        connection.release(); 

        if (err) {
          console.error('Error creating tag:', err);
          return res.status(500).json({ message: 'Failed to create tag' });
        }

        res.status(201).json({ message: 'Tag created successfully', id: result.insertId });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ message: 'Failed to connect to the database' });
  }
});

// Delete a tag
router.delete('/:id', auth, async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'DELETE FROM tags WHERE id = ?',
      [req.params.id],
      (err, result) => {
        connection.release(); 

        if (err) {
          console.error('Error deleting tag:', err);
          return res.status(500).json({ message: 'Failed to delete tag' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Tag not found' });
        }

        res.json({ message: 'Tag deleted successfully' });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ message: 'Failed to connect to the database' });
  }
});

module.exports = router;
