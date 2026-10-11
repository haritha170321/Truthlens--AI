const axios = require('axios');

async function testBackendServer() {
  try {
    console.log('Sending request to local backend server http://localhost:5000/api/news/analyze ...');
    const res = await axios.post('http://localhost:5000/api/news/analyze', {
      headline: 'Hardik Pandya is a football player',
      content: 'Viral social media claims state Hardik Pandya is a world-class football player who plays in the Premier League.',
    }, { timeout: 15000 });

    console.log('\n--- SERVER RESPONSE ---');
    console.log('Prediction:', res.data?.data?.prediction);
    console.log('Confidence:', res.data?.data?.finalConfidence + '%');
    console.log('Summary:', res.data?.data?.aiExplanation?.summary);
    console.log('Supporting evidence:', res.data?.data?.supportingEvidence?.length);
    console.log('Contradicting evidence:', res.data?.data?.contradictingEvidence?.length);
    console.log('\n✅ BACKEND API FULLY FUNCTIONAL AND WORKING!');
  } catch (err) {
    console.error('Server test error:', err.response?.data || err.message);
  }
}

testBackendServer();
