const mongoose = require('mongoose');

const savedArticleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SavedArticle', savedArticleSchema);
