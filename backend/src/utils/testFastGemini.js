require('dotenv').config();
const axios = require('axios');

async function benchmark() {
  const key = process.env.GEMINI_API_KEY;
  const configs = [
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', name: 'v1beta gemini-3.8-flash' },
    { url: 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent', name: 'v1 gemini-2.5-flash-lite' },
    { url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', name: 'v1beta gemini-flash-latest' },
  ];

  for (const cfg of configs) {
    const t0 = Date.now();
    try {
      const res = await axios.post(
        `${cfg.url}?key=${key}`,
        {
          contents: [{ parts: [{ text: 'Verify in 10 words: Did India win the 2024 T20 World Cup?' }] }],
        },
        { timeout: 8000 }
      );
      const took = Date.now() - t0;
      console.log(`✅ [${cfg.name}] Took ${took}ms ->`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    } catch (e) {
      const took = Date.now() - t0;
      console.log(`❌ [${cfg.name}] Took ${took}ms -> Error: ${e.response?.status || e.message}`);
    }
  }
}

benchmark();
