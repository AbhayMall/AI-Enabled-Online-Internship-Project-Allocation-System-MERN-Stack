const jwt = require('jsonwebtoken');

/**
 * Signs a JWT token given user id and role
 * @param {string} id - MongoDB User ObjectId
 * @param {string} role - 'student' | 'faculty' | 'admin'
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'default_jwt_secret_change_me',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

module.exports = generateToken;
