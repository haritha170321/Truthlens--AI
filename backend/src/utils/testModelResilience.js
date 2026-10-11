require('dotenv').config();
const axios = require('axios');

async function testModels() {
  const key = process.env.GEMINI_API_KEY;
  const models = ['gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-pro-latest'];
  for (const m of models) {
    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
        {
          contents: [{ parts: [{ text: 'Answer in 5 words: Is Hardik Pandya a cricketer or footballer?' }] }],
        },
        { timeout: 8000 }
      );
      console.log(`Model ${m} SUCCESS:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (e) {
      console.log(`Model ${m} FAILED:`, e.response?.status, e.response?.data?.error?.message || e.message);
    }
  }
}

testModels();
