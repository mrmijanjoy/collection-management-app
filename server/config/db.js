const mysql = require('mysql');

// database connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

function getConnection(callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting database connection:', err.message);
            callback(err, null);
        } else {
            callback(null, connection);
        }
    });
}


module.exports = { getConnection };
