const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Check optional header or allow guest/demo session
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to perform this operation.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secure_fake_news_detector_jwt_secret_key_2026'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secure_fake_news_detector_jwt_secret_key_2026'
      );
      req.user = decoded;
    } catch (e) {
      // Ignored for optional
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
