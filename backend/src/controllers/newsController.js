const Analysis = require('../models/Analysis');
const MLClientService = require('../services/mlClientService');
const GeminiService = require('../services/geminiService');
const NewsApiService = require('../services/newsApiService');
const ScraperService = require('../services/scraperService');
const HybridScorer = require('../services/hybridScorer');
const { sampleCases } = require('../utils/sampleCases');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

// Ensure memoryStore has feedback storage
if (!memoryStore.feedback) {
  memoryStore.feedback = [];
}

// Pipeline execution orchestrator
const executeVerificationPipeline = async ({
  headline,
  content,
  sourceUrl = '',
  publisher = '',
  author = '',
  inputType = 'TEXT',
  userId = null,
  isDemo = false,
}) => {
  // Step 1 & 2: Local AI/NLP and ML Feature Extraction
  const mlResult = await MLClientService.analyzeText({
    headline,
    text: content,
    sourceUrl,
  });

  const extractedClaims = mlResult.claims || [];
  const linguisticAnalysis = mlResult.linguistic_analysis;
  const sourceCredibility = mlResult.source_credibility;
  const sentiment = mlResult.sentiment_analysis;
  const suspiciousIndicators = mlResult.suspicious_indicators || [];
  const similarClaims = mlResult.similar_claims || [];
  const detectedLanguage = mlResult.input_summary?.detected_language || 'en';
  const localizedOutcome = mlResult.localized_outcome;
  const xaiExplanation = mlResult.xai_explanation;

  // Step 3: Cross-source Encyclopedic & News Search (Wikipedia + NewsAPI)
  const externalNews = await NewsApiService.searchRelatedNews(
    content.substring(0, 150),
    headline
  );

  // Step 4: AI Reasoning and Claim Stance Determination
  const llmAnalysis = await GeminiService.analyzeNewsContent({
    headline,
    content,
    publisher: publisher || sourceCredibility?.source_name,
    claims: extractedClaims,
    externalNews: externalNews?.articles || [],
  });

  // Step 5: Epistemic Calibrated Confidence Calculation & Category Mapping
  const hybridResult = HybridScorer.calculateFinalScore({
    mlPrediction: mlResult.ml_prediction,
    llmAnalysis,
    sourceCredibility,
    externalNews,
    linguisticAnalysis,
    similarClaims,
  });

  // Synthesize topic-specific similar news coverage
  const rawSimilar = [
    ...(externalNews.articles || []).map(a => ({
      title: a.title,
      publisher: a.publisher,
      url: a.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(a.title)}`,
      similarityScore: a.similarityScore || 0.88,
      date: a.date || 'Recent',
    })),
    ...(llmAnalysis.similarArticles || []).map(a => ({
      title: a.title,
      publisher: a.publisher || 'Verified News Desk',
      url: a.url || `https://news.google.com/search?q=${encodeURIComponent(a.title)}`,
      similarityScore: 0.90,
      date: a.date || 'Recent',
    })),
  ];

  // De-duplicate by title
  const seenTitles = new Set();
  const similarArticles = [];
  for (const art of rawSimilar) {
    if (art && art.title && !seenTitles.has(art.title.toLowerCase())) {
      seenTitles.add(art.title.toLowerCase());
      similarArticles.push(art);
    }
  }

  // Create combined record conforming to TruthLens AI taxonomy
  const analysisDoc = {
    _id: `analysis-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: userId || null,
    inputType,
    headline: headline || (content ? content.substring(0, 80) + '...' : 'News Analysis'),
    content,
    url: sourceUrl,
    publisher: publisher || sourceCredibility?.source_name || 'Independent Source',
    author: author || 'Unspecified Author',
    category: 'General',
    language: detectedLanguage,
    outcomeCategory: hybridResult.outcomeCategory,
    prediction: hybridResult.outcomeCategory,
    localizedOutcome: localizedOutcome || hybridResult.outcomeCategory,
    finalConfidence: hybridResult.finalConfidence,
    confidenceScore: hybridResult.confidenceScore,
    uncertaintyScore: hybridResult.uncertaintyScore,
    confidenceLevel: hybridResult.confidenceLevel,
    scoreBreakdown: hybridResult.scoreBreakdown,
    aiExplanation: {
      summary: llmAnalysis.summary || xaiExplanation?.why_verification_needed,
      keyFactors: llmAnalysis.keyFactors || xaiExplanation?.sensational_cues_found || [],
      recommendations: llmAnalysis.recommendations || xaiExplanation?.limitations || [],
    },
    xaiExplanation,
    claims: llmAnalysis.verifiedClaims || extractedClaims,
    supportingEvidence: hybridResult.supportingEvidence,
    contradictingEvidence: hybridResult.contradictingEvidence,
    contextEvidence: hybridResult.contextEvidence || [],
    similarClaims,
    similarArticles,
    sourceCredibility,
    sentiment,
    suspiciousIndicators,
    isDemoData: isDemo,
    createdAt: new Date(),
  };

  // Persist
  if (getDBStatus()) {
    try {
      const saved = await Analysis.create({ ...analysisDoc, _id: undefined });
      analysisDoc._id = saved._id;
    } catch (e) {
      console.warn(`[Analysis Save DB]: ${e.message}`);
    }
  } else {
    memoryStore.analyses.unshift(analysisDoc);
  }

  return analysisDoc;
};

exports.analyzeText = async (req, res, next) => {
  try {
    const { headline, content, sourceUrl, publisher, author } = req.body;

    if (!content && !headline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a news headline or article text to analyze.',
      });
    }

    const result = await executeVerificationPipeline({
      headline,
      content: content || headline,
      sourceUrl,
      publisher,
      author,
      inputType: 'TEXT',
      userId: req.user?.id,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.analyzeUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide a valid news article URL.' });
    }

    const scraped = await ScraperService.extractFromUrl(url);

    const result = await executeVerificationPipeline({
      headline: scraped.title,
      content: scraped.content,
      sourceUrl: url,
      publisher: scraped.publisher,
      author: scraped.author,
      inputType: 'URL',
      userId: req.user?.id,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image screenshot or photo.' });
    }

    const headline = req.body.headline || '';
    const ocrAnalysis = await MLClientService.analyzeImage(req.file.buffer, req.file.originalname, headline);
    const extractedText = ocrAnalysis.ocr_details?.text || ocrAnalysis.input_summary?.headline || 'Screenshot news text extracted.';

    const result = await executeVerificationPipeline({
      headline: headline || 'Image Screenshot News Analysis',
      content: extractedText,
      inputType: 'IMAGE',
      userId: req.user?.id,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.analyzePdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF document.' });
    }

    const headline = req.body.headline || '';
    const pdfAnalysis = await MLClientService.analyzePdf(req.file.buffer, req.file.originalname, headline);
    const extractedText = pdfAnalysis.pdf_details?.text || 'Document contents extracted.';

    const result = await executeVerificationPipeline({
      headline: headline || 'Uploaded Document News Verification',
      content: extractedText,
      inputType: 'PDF',
      userId: req.user?.id,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { status, inputType, search, page = 1, limit = 50 } = req.query;
    const userId = req.user?.id;

    if (getDBStatus()) {
      const query = userId
        ? { userId }
        : { $or: [{ userId: null }, { userId: { $exists: false } }, { isDemoData: true }] };

      if (status && status !== 'ALL') query.prediction = status;
      if (inputType && inputType !== 'ALL') query.inputType = inputType;
      if (search) {
        query.$or = [
          { headline: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { publisher: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Analysis.countDocuments(query);
      const analyses = await Analysis.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      return res.json({
        success: true,
        data: analyses,
        pagination: { total, page: Number(page), pages: Math.ceil(total / limit) || 1 },
      });
    } else {
      let filtered = userId
        ? memoryStore.analyses.filter(a => a.userId === userId)
        : [...memoryStore.analyses];

      if (status && status !== 'ALL') {
        filtered = filtered.filter(a => a.prediction === status || a.outcomeCategory === status);
      }
      if (inputType && inputType !== 'ALL') {
        filtered = filtered.filter(a => a.inputType === inputType);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          a => (a.headline && a.headline.toLowerCase().includes(s)) ||
               (a.content && a.content.toLowerCase().includes(s)) ||
               (a.publisher && a.publisher.toLowerCase().includes(s))
        );
      }

      return res.json({
        success: true,
        data: filtered,
        pagination: { total: filtered.length, page: 1, pages: 1 },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check sample cases first
    const sample = sampleCases.find(s => s.id === id);
    if (sample) {
      return res.json({ success: true, data: sample });
    }

    if (getDBStatus()) {
      const found = await Analysis.findById(id);
      if (!found) {
        return res.status(404).json({ success: false, message: 'Analysis not found.' });
      }
      return res.json({ success: true, data: found });
    } else {
      const found = memoryStore.analyses.find(a => String(a._id) === String(id));
      if (!found) {
        return res.status(404).json({ success: false, message: 'Analysis record not found.' });
      }
      return res.json({ success: true, data: found });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteAnalysis = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (getDBStatus()) {
      await Analysis.findByIdAndDelete(id);
    } else {
      memoryStore.analyses = memoryStore.analyses.filter(a => String(a._id) !== String(id));
    }
    return res.json({ success: true, message: 'Analysis deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (getDBStatus()) {
      if (userId) {
        await Analysis.deleteMany({ userId });
      } else {
        await Analysis.deleteMany({});
      }
    } else {
      if (userId) {
        memoryStore.analyses = memoryStore.analyses.filter(a => a.userId && a.userId !== userId);
      } else {
        memoryStore.analyses = [];
      }
    }
    return res.json({
      success: true,
      message: 'Verification history cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
};

exports.getDemoCases = (req, res) => {
  return res.json({
    success: true,
    data: sampleCases,
  });
};

exports.getSimilarClaims = async (req, res, next) => {
  try {
    const { claim, topK, threshold } = req.body;
    if (!claim) {
      return res.status(400).json({ success: false, message: 'Claim text is required.' });
    }

    const similar = await MLClientService.findSimilarClaims({ claim, topK, threshold });
    return res.json({ success: true, data: similar });
  } catch (error) {
    next(error);
  }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const { analysisId, feedbackType, notes, suggestedUrl } = req.body;
    const feedbackItem = {
      _id: `fb-${Date.now()}`,
      analysisId: analysisId || null,
      userId: req.user?.id || null,
      feedbackType: feedbackType || 'helpful',
      notes: notes || '',
      suggestedUrl: suggestedUrl || '',
      createdAt: new Date(),
    };

    memoryStore.feedback.push(feedbackItem);
    return res.json({
      success: true,
      message: 'Feedback recorded successfully. Thank you for strengthening TruthLens AI verification models.',
      data: feedbackItem,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMethodology = async (req, res, next) => {
  try {
    const info = await MLClientService.getMethodologyInfo();
    return res.json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};
