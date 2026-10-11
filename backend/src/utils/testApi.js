require('dotenv').config();
const axios = require('axios');

async function testKeys() {
  console.log('--- Testing Gemini Key ---');
  const geminiKey = process.env.GEMINI_API_KEY;
  console.log('Key length:', geminiKey?.length);

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [{ text: 'Answer in 5 words: Is Hardik Pandya a cricketer or footballer?' }],
          },
        ],
      },
      { timeout: 10000 }
    );
    console.log('Gemini Response:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    console.log('✅ Gemini API Working Perfectly!');
  } catch (e) {
    console.error('Gemini Error:', e.response?.data?.error?.message || e.message);
  }

  console.log('\n--- Testing NewsAPI Key ---');
  const newsKey = process.env.NEWS_API_KEY;
  try {
    const res = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology',
        pageSize: 1,
        apiKey: newsKey,
      },
      timeout: 8000,
    });
    console.log('NewsAPI Found:', res.data?.totalResults, 'articles');
    console.log('✅ NewsAPI Working Perfectly!');
  } catch (e) {
    console.error('NewsAPI Error:', e.response?.data?.message || e.message);
  }
}

testKeys();
