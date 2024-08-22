const db = require('../config/db');
const { verifyToken } = require('../utils/jwt');

const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; 
        const decodedToken = await verifyToken(token); 

        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [decodedToken.id]); 
        if (users.length > 0 && users[0].isAdmin) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = adminMiddleware;
