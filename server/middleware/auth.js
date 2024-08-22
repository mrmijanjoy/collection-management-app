const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = await verifyToken(token);
    req.user = decoded; 
    next(); 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired' });
    }
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

module.exports = authMiddleware;
