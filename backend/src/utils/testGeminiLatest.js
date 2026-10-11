require('dotenv').config();
const axios = require('axios');

async function testGeminiLatest() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

  for (const m of models) {
    try {
      console.log(`Trying ${m}...`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`,
        {
          contents: [{ parts: [{ text: 'Answer in 5 words: Is Hardik Pandya a cricketer or footballer?' }] }],
        },
        { timeout: 10000 }
      );
      console.log(`✅ SUCCESS with ${m}:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
      return m;
    } catch (e) {
      console.log(`❌ Failed ${m}:`, e.response?.data?.error?.message || e.message);
    }
  }
}

testGeminiLatest();
