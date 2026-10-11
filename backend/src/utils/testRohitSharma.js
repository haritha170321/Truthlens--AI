require('dotenv').config();
const GeminiService = require('../services/geminiService');
const HybridScorer = require('../services/hybridScorer');

async function testRohitSharma() {
  console.log('Testing: "today rohit sharma hit century"\n');
  const res = await GeminiService.analyzeNewsContent({
    headline: 'today rohit sharma hit century',
    content: 'today rohit sharma hit century in cricket match with stellar batting performance.',
    publisher: 'Direct Submission',
    claims: [
      { claim: 'Rohit Sharma scored a century in cricket', type: 'Factual Assertion' },
    ],
  });

  console.log('--- GEMINI OUTPUT ---');
  console.log('Verdict:', res.llmVerdict);
  console.log('Credibility Score:', res.llmCredibilityScore);
  console.log('Summary:', res.summary);

  const hybrid = HybridScorer.calculateFinalScore({
    mlPrediction: { probability_real: 0.85, prediction: 'REAL' },
    llmAnalysis: res,
    sourceCredibility: { credibility_score: 0.8 },
    externalNews: { articles: [] },
    linguisticAnalysis: { linguistic_credibility_score: 0.85 },
  });

  console.log('\n--- HYBRID FINAL VERDICT ---');
  console.log('Final Prediction:', hybrid.prediction);
  console.log('Final Confidence:', hybrid.finalConfidence + '%');
  console.log('Confidence Level:', hybrid.confidenceLevel);
}

testRohitSharma();
