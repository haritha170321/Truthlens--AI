const express = require('express');
const router = express.Router();
const {
  analyzeText,
  analyzeUrl,
  analyzeImage,
  analyzePdf,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  clearHistory,
  getDemoCases,
  getSimilarClaims,
  submitFeedback,
  getMethodology,
  searchGoogleFactCheck,
} = require('../controllers/newsController');
const { optionalAuth, protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public metadata & demo endpoints
router.get('/demo-cases', getDemoCases);
router.get('/methodology', getMethodology);
router.post('/similar-claims', optionalAuth, getSimilarClaims);
router.post('/feedback', optionalAuth, submitFeedback);
router.post('/fact-check-search', optionalAuth, searchGoogleFactCheck);
router.get('/fact-check-search', optionalAuth, searchGoogleFactCheck);

// Analysis endpoints
router.post('/analyze', optionalAuth, analyzeText);
router.post('/analyze-url', optionalAuth, analyzeUrl);
router.post('/analyze-image', optionalAuth, upload.single('image'), analyzeImage);
router.post('/analyze-pdf', optionalAuth, upload.single('pdf'), analyzePdf);

// History & management endpoints
router.delete('/history/clear', optionalAuth, clearHistory);
router.delete('/history', optionalAuth, clearHistory);
router.get('/history', optionalAuth, getHistory);
router.get('/:id', optionalAuth, getAnalysisById);
router.delete('/:id', optionalAuth, deleteAnalysis);

module.exports = router;
