require('dotenv').config();
const GeminiService = require('../services/geminiService');

async function testCases() {
  const tests = [
    {
      title: 'Real Fact',
      headline: 'India defeated South Africa to win the 2024 ICC Men\'s T20 World Cup in Barbados',
      content: 'India won the 2024 ICC T20 World Cup final against South Africa by 7 runs under the captaincy of Rohit Sharma.',
    },
    {
      title: 'Real Fact 2',
      headline: 'Rohit Sharma is the captain and opening batsman of the Indian national cricket team',
      content: 'Rohit Sharma is an internationally acclaimed Indian cricketer who has scored three double centuries in One Day Internationals.',
    },
    {
      title: 'Fake Claim',
      headline: 'Hardik Pandya signed a 5-year contract with Real Madrid as a goalkeeper',
      content: 'Hardik Pandya has quit cricket to join Real Madrid as their primary starting football goalkeeper.',
    },
  ];

  for (const t of tests) {
    console.log(`\n================ Testing: ${t.title} ================`);
    console.log(`Headline: "${t.headline}"`);
    const res = await GeminiService.analyzeNewsContent({
      headline: t.headline,
      content: t.content,
      publisher: 'News Report',
      claims: [{ claim: t.headline, type: 'Factual Statement' }],
    });
    console.log('Verdict:', res.llmVerdict);
    console.log('Credibility Score:', res.llmCredibilityScore);
    console.log('Summary:', res.summary);
    console.log('Supporting Evidence:', JSON.stringify(res.supportingEvidence, null, 2));
    console.log('Contradicting Evidence:', JSON.stringify(res.contradictingEvidence, null, 2));
    console.log('Similar Articles:', JSON.stringify(res.similarArticles, null, 2));
  }
}

testCases();
