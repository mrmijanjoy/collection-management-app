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


// Get top collections
router.get('/topcollections', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM topcollections ORDER BY item_count DESC', 
      (err, results) => {
        if (err) {
          console.error('Error fetching top collections:', err);
          connection.release();
          return res.status(500).json({ error: 'Failed to fetch top collections' });
        }

        res.json(results);
        connection.release(); 
      }
    );
  } catch (error) {
    console.error('Error connecting to the database:', error);
    if (connection) connection.release();
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// POST endpoint to create a new collection
router.post('/collections', auth, async (req, res) => {
  const { name, description, category } = req.body;
  if (!name || !description || !category) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let connection;
  try {
    connection = await getConnectionPromise();
    connection.query(
      'INSERT INTO collections (name, description, category, userId) VALUES (?, ?, ?, ?)',
      [name, description, category, req.user.id], 
      (err, result) => {
        connection.release(); 

        if (err) {
          console.error('Error creating collection:', err);
          return res.status(500).json({ error: 'Failed to create collection' });
        }

        res.status(201).json({
          id: result.insertId,
          name,
          description,
          category
        });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

router.get('/collections', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM collections',
      (err, results) => {
        if (err) {
          console.error('Error fetching collections:', err);
          connection.release(); 
          return res.status(500).json({ error: 'Failed to fetch collections' });
        }

        res.json(results);
        connection.release(); 
      }
    );
  } catch (error) {
    console.error('Error connecting to the database:', error);
    if (connection) connection.release(); 
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});


// Get Collection by ID
router.get('/collections/:id', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM collections WHERE id = ?',
      [req.params.id],
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error fetching collection:', err);
          return res.status(500).json({ error: 'Failed to fetch collection' });
        }

        if (results.length === 0) return res.status(404).json({ error: 'Collection not found' });
        res.json(results[0]);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Get top collections
router.get('/collections/top', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      `
      SELECT collections.*, COUNT(items.id) AS itemCount 
      FROM collections
      LEFT JOIN items ON items.collection_id = collections.id
      GROUP BY collections.id
      ORDER BY itemCount DESC
      LIMIT 5
      `,
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error fetching top collections:', err);
          return res.status(500).json({ error: 'Failed to fetch top collections' });
        }

        res.json(results);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Update Collection
router.put('/collections/:id', auth, async (req, res) => {
  const { name, description, category, imageUrl } = req.body;
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'UPDATE collections SET name = ?, description = ?, category = ?, imageUrl = ? WHERE id = ? AND userId = ?',
      [name, description, category, imageUrl, req.params.id, req.user.id],
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error updating collection:', err);
          return res.status(500).json({ error: 'Failed to update collection' });
        }

        if (results.affectedRows === 0) return res.status(404).json({ error: 'Collection not found or not authorized' });
        res.json({ message: 'Collection updated successfully' });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Delete Collection
router.delete('/collections/:id', auth, async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'DELETE FROM collections WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id],
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error deleting collection:', err);
          return res.status(500).json({ error: 'Failed to delete collection' });
        }

        if (results.affectedRows === 0) return res.status(404).json({ error: 'Collection not found or not authorized' });
        res.json({ message: 'Collection deleted successfully' });
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Get items for a collection
router.get('/collections/:id/items', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM items WHERE collection_id = ?',
      [req.params.id],
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error fetching items for collection:', err);
          return res.status(500).json({ error: 'Failed to fetch items for collection' });
        }

        res.json(results);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

// Get custom fields
router.get('/custom-fields', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM custom_fields',
      (err, results) => {
        connection.release(); 

        if (err) {
          console.error('Error fetching custom fields:', err);
          return res.status(500).json({ error: 'Failed to fetch custom fields' });
        }

        res.json(results);
      }
    );
  } catch (error) {
    if (connection) connection.release(); 
    console.error('Error connecting to the database:', error);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
});

module.exports = router;
