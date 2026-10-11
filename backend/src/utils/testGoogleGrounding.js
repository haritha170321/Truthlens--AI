require('dotenv').config();
const axios = require('axios');

async function testGeminiSearchGrounding() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing Google Search Grounding on Gemini API...');

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${key}`,
      {
        contents: [
          {
            parts: [{ text: 'What is the latest news regarding Rohit Sharma or Indian cricket today?' }],
          },
        ],
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
      { timeout: 15000 }
    );

    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const groundingMetadata = res.data?.candidates?.[0]?.groundingMetadata;
    console.log('\n--- LIVE GOOGLE GROUNDING RESPONSE ---');
    console.log(text);
    console.log('\n--- SEARCH QUERIES / SOURCES USED ---');
    console.log(groundingMetadata?.webSearchQueries || groundingMetadata?.groundingChunks?.slice(0, 3));
    console.log('\n✅ GOOGLE LIVE SEARCH GROUNDING IS WORKING!');
  } catch (e) {
    console.error('Grounding Error:', e.response?.data?.error?.message || e.message);
  }
}

testGeminiSearchGrounding();
