require('dotenv').config();
const axios = require('axios');

async function testGemini25() {
  const geminiKey = process.env.GEMINI_API_KEY;
  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        contents: [
          {
            parts: [{ text: 'Answer in 5 words: Is Hardik Pandya a cricketer or footballer?' }],
          },
        ],
      },
      { timeout: 10000 }
    );
    console.log('Gemini 2.5 Flash Response:', res.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    console.log('✅ GEMINI WORKING 100%!');
  } catch (e) {
    console.error('Gemini Error:', e.response?.data?.error?.message || e.message);
  }
}

testGemini25();
