const jwt = require('jsonwebtoken');

const secretKey = '1060115d7a02c33d7e301f8a1a65153d2bfa229cbf7b45e8c1501b0e7c7b3926005538be7432d49e09e9f100f08bdfaf0d3a0577520399a7eacbc8f04502a1e2'; 

const generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

module.exports = { generateToken, verifyToken };
