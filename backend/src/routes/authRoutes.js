const express = require('express');
const router = express.Router();
const { register, login, googleLogin, awsCognitoLogin, getMe, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/aws-cognito', authLimiter, awsCognitoLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;
