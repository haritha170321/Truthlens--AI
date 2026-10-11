const { sampleCases } = require('./sampleCases');

// In-Memory storage fallback when MongoDB is not connected
const memoryStore = {
  users: [
    {
      _id: 'demo-user-id-001',
      name: 'Dr. Alex Morgan',
      email: 'demo@fakenewsdetector.ai',
      password: '$2a$12$eXAMPLeHashedPasswordKeyDemo1234567890abcdef', // Demo placeholder
      role: 'researcher',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ],
  analyses: [...sampleCases],
  savedArticles: [],
  feedback: [],
};

const { getDBStatus } = require('../config/db');

const seedDatabase = async () => {
  if (!getDBStatus()) {
    console.log('[Seeding]: In-memory storage ready for demo mode.');
    return;
  }
  try {
    const User = require('../models/User');
    const Analysis = require('../models/Analysis');
    const SavedArticle = require('../models/SavedArticle');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Seeding]: Inserting demo user into MongoDB...');
      const demoUser = await User.create({
        name: 'Dr. Alex Morgan',
        email: 'demo@fakenewsdetector.ai',
        password: 'Password123!',
        role: 'researcher',
      });

      for (const item of memoryStore.analyses) {
        await Analysis.create({
          ...item,
          _id: undefined,
          userId: demoUser._id,
        });
      }
      console.log('[Seeding]: Successfully seeded demo analyses.');
    }
  } catch (err) {
    console.warn(`[Seeding Notice]: MongoDB seeding skipped (${err.message}). In-memory store active.`);
  }
};

module.exports = { memoryStore, seedDatabase };
