const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function(req, res, next) {
  try {
    // Get token from header
    const token = (req.header('Authorization')?.replace('Bearer ', '')) || req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const userId = decoded?.user?.id || decoded?.userId || decoded?.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports.isAdmin = async function(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.isEditor = async function(req, res, next) {
  try {
    if (req.user.role !== 'editor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Editor or Admin role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
