const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  claim: { type: String, required: true },
  type: { type: String, default: 'Factual Assertion' },
  status: {
    type: String,
    default: 'Unverified',
  },
  evidence: { type: String, default: '' },
  confidence: { type: Number, default: 0.7 },
  language: { type: String, default: 'en' },
});

const evidenceSchema = new mongoose.Schema({
  source: { type: String, required: true },
  title: { type: String, default: '' },
  url: { type: String, default: '' },
  stance: {
    type: String,
    enum: ['SUPPORTS', 'CONTRADICTS', 'CONTEXT', 'NEUTRAL', 'DISCUSSES'],
    default: 'CONTEXT',
  },
  snippet: { type: String, default: '' },
  publishedDate: { type: String, default: '' },
  reliability: { type: Number, default: 0.8 },
});

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  inputType: {
    type: String,
    enum: ['TEXT', 'URL', 'IMAGE', 'PDF', 'DEMO'],
    default: 'TEXT',
  },
  headline: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: '',
  },
  publisher: {
    type: String,
    default: '',
  },
  author: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  language: {
    type: String,
    default: 'en',
  },
  // Classification & Epistemic Taxonomy
  prediction: {
    type: String,
    required: true,
  },
  outcomeCategory: {
    type: String,
    default: 'Insufficient evidence',
  },
  localizedOutcome: {
    type: String,
    default: '',
  },
  finalConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    default: 50,
  },
  uncertaintyScore: {
    type: Number,
    default: 50,
  },
  confidenceLevel: {
    type: String,
    default: 'Uncertain / Needs Verification',
  },
  // Detailed Weighted Scoring Signals
  scoreBreakdown: {
    mlScore: { type: Number, default: 50 },
    llmScore: { type: Number, default: 50 },
    sourceScore: { type: Number, default: 50 },
    evidenceScore: { type: Number, default: 50 },
    linguisticScore: { type: Number, default: 50 },
  },
  aiExplanation: {
    summary: { type: String, default: '' },
    keyFactors: [{ type: String }],
    recommendations: [{ type: String }],
  },
  xaiExplanation: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  claims: [claimSchema],
  supportingEvidence: [evidenceSchema],
  contradictingEvidence: [evidenceSchema],
  contextEvidence: [evidenceSchema],
  searchMetadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  googleFactCheck: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  similarClaims: [{ type: mongoose.Schema.Types.Mixed }],
  similarArticles: [
    {
      title: String,
      publisher: String,
      url: String,
      similarityScore: Number,
      date: String,
    },
  ],
  sourceCredibility: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  sentiment: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  suspiciousIndicators: [{ type: String }],
  isDemoData: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ prediction: 1 });
analysisSchema.index({ outcomeCategory: 1 });

module.exports = mongoose.model('Analysis', analysisSchema);
