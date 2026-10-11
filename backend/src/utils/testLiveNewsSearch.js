require('dotenv').config();
const axios = require('axios');

async function testLiveNewsSearch() {
  const newsKey = process.env.NEWS_API_KEY;
  console.log('Querying NewsAPI for latest real-time articles on: "Rohit Sharma"...');

  try {
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'Rohit Sharma',
        sortBy: 'publishedAt',
        pageSize: 5,
        language: 'en',
        apiKey: newsKey,
      },
    });

    console.log('\n--- LIVE REAL-WORLD NEWS DISCOVERED ---');
    res.data?.articles?.forEach((art, idx) => {
      console.log(`\n[${idx + 1}] ${art.title}`);
      console.log(`Source: ${art.source?.name} | Published: ${art.publishedAt}`);
      console.log(`Snippet: ${art.description}`);
    });
  } catch (e) {
    console.error('NewsAPI error:', e.response?.data || e.message);
  }
}

testLiveNewsSearch();
