const express = require('express');
const router = express.Router();
const { getSavedArticles, saveArticle, deleteSavedArticle } = require('../controllers/savedController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getSavedArticles);
router.post('/', optionalAuth, saveArticle);
router.delete('/:id', optionalAuth, deleteSavedArticle);

module.exports = router;
