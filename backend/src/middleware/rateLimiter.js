const rateLimit = require('express-rate-limit');

// Helper to allow uninterrupted local testing
const isLocalOrDev = (req) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  return (
    process.env.NODE_ENV !== 'production' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.includes('127.0.0.1') ||
    ip.includes('::ffff:127.0.0.1')
  );
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Generous limit
  skip: (req) => isLocalOrDev(req),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again in a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Generous limit so users never get blocked during login/signup testing
  skip: (req) => isLocalOrDev(req),
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in a moment.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
