require('dotenv').config();
const GeminiService = require('../services/geminiService');
const NewsApiService = require('../services/newsApiService');
const HybridScorer = require('../services/hybridScorer');

async function testLiveRunOut() {
  const statement = 'rohit sharma was run out on todays match';
  console.log(`Searching live news and fact-checking: "${statement}"\n`);

  const externalNews = await NewsApiService.searchRelatedNews(statement, statement);
  console.log(`NewsAPI found ${externalNews.articles?.length || 0} live news articles.\n`);

  const geminiRes = await GeminiService.analyzeNewsContent({
    headline: statement,
    content: statement,
    publisher: 'Direct Submission',
    claims: [{ claim: 'Rohit Sharma was run out in today match', type: 'Event Assertion' }],
    externalNews: externalNews.articles || [],
  });

  console.log('--- GEMINI OUTPUT ---');
  console.log('Verdict:', geminiRes.llmVerdict);
  console.log('Credibility Score:', geminiRes.llmCredibilityScore);
  console.log('Summary:', geminiRes.summary);
  console.log('Key Factors:', geminiRes.keyFactors);

  const hybrid = HybridScorer.calculateFinalScore({
    mlPrediction: { probability_real: 0.5, prediction: 'UNCERTAIN' },
    llmAnalysis: geminiRes,
    sourceCredibility: { credibility_score: 0.7 },
    externalNews: externalNews,
    linguisticAnalysis: { linguistic_credibility_score: 0.8 },
  });

  console.log('\n--- HYBRID RESULT ---');
  console.log('Verdict:', hybrid.prediction);
  console.log('Confidence:', hybrid.finalConfidence + '%');
}

testLiveRunOut();
