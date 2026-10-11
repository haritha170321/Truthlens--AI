const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAnalytics);

module.exports = router;
