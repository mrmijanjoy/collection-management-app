const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});

// Import database connection
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/items');
const collectionRoutes = require('./routes/collections');
const tagRoutes = require('./routes/tags');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');

// Middleware setup
app.use(express.json()); 
app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route setup
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/collections', collectionRoutes);
app.use('/tags', tagRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
