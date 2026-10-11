require('dotenv').config();
const axios = require('axios');

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const models = res.data?.models?.map(m => m.name) || [];
    console.log('Available models in v1beta:', models.slice(0, 10));
  } catch (e) {
    console.log('v1beta error:', e.response?.data?.error?.message || e.message);
  }

  try {
    const res2 = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
    const models2 = res2.data?.models?.map(m => m.name) || [];
    console.log('Available models in v1:', models2.slice(0, 10));
  } catch (e) {
    console.log('v1 error:', e.response?.data?.error?.message || e.message);
  }
}

listModels();
