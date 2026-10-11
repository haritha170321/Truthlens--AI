require('dotenv').config();
const axios = require('axios');

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  const models = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  for (const m of models) {
    try {
      console.log(`Querying ${m}...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
        {
          contents: [{ parts: [{ text: 'Answer in 5 words: Is Hardik Pandya a cricketer or footballer?' }] }],
        },
        { timeout: 15000 }
      );
      console.log(`✅ SUCCESS with ${m}:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
      return;
    } catch (e) {
      console.log(`❌ Failed ${m}:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

testGemini();
