require('dotenv').config();
const GeminiService = require('../services/geminiService');

async function testFactCheck() {
  console.log('Testing AI Fact Check for: "hardik pandya is football player"');
  const res = await GeminiService.analyzeNewsContent({
    headline: 'Hardik Pandya joins Manchester United as star football player',
    content: 'hardik pandya is football player who scored 3 goals in his recent match.',
    publisher: 'Social Media Claim',
    claims: [
      { claim: 'Hardik Pandya is a football player', type: 'Factual Assertion' },
    ],
  });

  console.log('\n--- AI VERDICT ---');
  console.log('Verdict:', res.llmVerdict);
  console.log('Credibility Score:', res.llmCredibilityScore);
  console.log('Summary:', res.summary);
  console.log('Key Factors:', res.keyFactors);
}

testFactCheck();
