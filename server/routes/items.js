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

// Create Item with Tags
const createItemWithTags = (itemData, callback) => {
  const { name, description, collection_id, image_url, tags } = itemData;
  
  getConnection((err, connection) => {
    if (err) return callback(err);
    
    connection.query('START TRANSACTION', (err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      connection.query(
        'INSERT INTO items (name, description, collection_id, image_url) VALUES (?, ?, ?, ?)',
        [name, description, collection_id, image_url],
        (err, result) => {
          if (err) {
            connection.query('ROLLBACK', () => connection.release());
            return callback(err);
          }

          const itemId = result.insertId;

          if (tags && tags.length > 0) {
            const tagQueries = tags.map(tagId => 
              (cb) => connection.query('INSERT INTO item_tags (item_id, tag_id) VALUES (?, ?)', [itemId, tagId], cb)
            );

            tagQueries.push((cb) => connection.query('COMMIT', cb));

            const asyncTasks = tagQueries.reduce((prev, curr) => prev.then(() => new Promise((resolve, reject) => curr((err) => err ? reject(err) : resolve()))), Promise.resolve());

            asyncTasks
              .then(() => {
                connection.release();
                callback(null);
              })
              .catch(err => {
                connection.query('ROLLBACK', () => connection.release());
                callback(err);
              });
          } else {
            connection.query('COMMIT', (err) => {
              connection.release();
              callback(err);
            });
          }
        }
      );
    });
  });
};

// Get recent items
router.get('/recentitems', async (req, res) => {
  let connection;

  try {
    connection = await getConnectionPromise();
    connection.query(
      'SELECT * FROM recentitems ORDER BY created_at DESC', 
      (err, results) => {
        if (err) {
          console.error('Error fetching recent items:', err);
          connection.release();
          return res.status(500).json({ error: 'Failed to fetch recent items' });
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

// Create Item Endpoint
router.post('/', (req, res) => {
  createItemWithTags(req.body, (err) => {
    if (err) {
      console.error('Error creating item:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'Item created successfully!' });
  });
});

// Get All Items Endpoint
router.get('/', (req, res) => {
  let { collectionId, searchTerm, sortOrder } = req.query;
  let query = 'SELECT * FROM items';
  let queryParams = [];

  if (collectionId) {
    query += ' WHERE collection_id = ?';
    queryParams.push(collectionId);
  }

  if (searchTerm) {
    query += collectionId ? ' AND name LIKE ?' : ' WHERE name LIKE ?';
    queryParams.push(`%${searchTerm}%`);
  }

  if (sortOrder) {
    const validSortOrders = ['asc', 'desc'];
    if (validSortOrders.includes(sortOrder)) {
      query += ' ORDER BY name ' + (sortOrder === 'asc' ? 'ASC' : 'DESC');
    }
  }

  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query(query, queryParams, (err, results) => {
      connection.release();

      if (err) {
        console.error('Error fetching items:', err);
        return res.status(500).json({ message: 'Server Error' });
      }

      res.json(results);
    });
  });
});

// Get Items by Collection ID Endpoint
router.get('/collection/:collectionId', (req, res) => {
  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query('SELECT * FROM items WHERE collection_id = ?', [req.params.collectionId], (err, results) => {
      connection.release();

      if (err) {
        console.error('Error fetching items by collection:', err);
        return res.status(500).json({ message: 'Failed to fetch items' });
      }

      res.json(results);
    });
  });
});

// Fetch Item Details with Tags
router.get('/:itemID', (req, res) => {
  const { itemID } = req.params;

  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query(
      `SELECT items.*, GROUP_CONCAT(tags.name) AS tags
       FROM items
       LEFT JOIN item_tags ON items.id = item_tags.item_id
       LEFT JOIN tags ON item_tags.tag_id = tags.id
       WHERE items.id = ?
       GROUP BY items.id`,
      [itemID],
      (err, item) => {
        if (err) {
          connection.release();
          console.error('Error fetching item details:', err);
          return res.status(500).json({ message: 'Error fetching item details' });
        }

        connection.query('SELECT * FROM comments WHERE item_id = ?', [itemID], (err, comments) => {
          connection.release();

          if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).json({ message: 'Error fetching comments' });
          }

          res.json({ ...item[0], comments });
        });
      }
    );
  });
});

// Get Comments for Item
router.get('/:itemId/comments', (req, res) => {
  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query('SELECT * FROM comments WHERE item_id = ?', [req.params.itemId], (err, results) => {
      connection.release();

      if (err) {
        console.error('Error fetching comments:', err);
        return res.status(500).json({ message: 'Failed to fetch comments' });
      }

      res.json(results);
    });
  });
});

// Add Comment to Item
router.post('/:itemId/comments', auth, (req, res) => {
  const { text } = req.body;

  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query('INSERT INTO comments (item_id, text) VALUES (?, ?)', [req.params.itemId, text], (err) => {
      connection.release();

      if (err) {
        console.error('Error adding comment:', err);
        return res.status(500).json({ message: 'Failed to add comment' });
      }

      res.status(201).json({ message: 'Comment added successfully' });
    });
  });
});

// Like an Item
router.post('/:itemId/like', auth, (req, res) => {
  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query('UPDATE items SET likes = likes + 1 WHERE id = ?', [req.params.itemId], (err) => {
      connection.release();

      if (err) {
        console.error('Error liking item:', err);
        return res.status(500).json({ message: 'Failed to like item' });
      }

      res.status(200).json({ message: 'Item liked successfully' });
    });
  });
});

// Get Most Liked Items
router.get('/most-liked', (req, res) => {
  getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return res.status(500).json({ message: 'Failed to connect to the database' });
    }

    connection.query(
      'SELECT * FROM items ORDER BY likes DESC LIMIT 5',
      (err, results) => {
        connection.release();

        if (err) {
          console.error('Error fetching most liked items:', err);
          return res.status(500).json({ message: 'Failed to fetch most liked items' });
        }

        res.json(results);
      }
    );
  });
});

module.exports = router;
