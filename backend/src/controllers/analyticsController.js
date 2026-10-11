const Analysis = require('../models/Analysis');
const MLClientService = require('../services/mlClientService');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

exports.getAnalytics = async (req, res, next) => {
  try {
    let items = [];
    const userId = req.user?.id;

    if (getDBStatus()) {
      items = userId
        ? await Analysis.find({ userId }).sort({ createdAt: -1 })
        : await Analysis.find().sort({ createdAt: -1 });
    } else {
      items = userId
        ? memoryStore.analyses.filter(i => i.userId === userId)
        : [...memoryStore.analyses];
    }

    const totalChecks = items.length;
    const fakeCount = items.filter(i => i.prediction === 'LIKELY FAKE' || i.prediction === 'FAKE').length;
    const realCount = items.filter(i => i.prediction === 'REAL' || i.prediction === 'LIKELY REAL').length;
    const misleadingCount = items.filter(i => i.prediction === 'MISLEADING').length;
    const unverifiedCount = items.filter(i => i.prediction === 'UNVERIFIED').length;

    const avgConfidence = totalChecks > 0
      ? Math.round(items.reduce((acc, curr) => acc + (curr.finalConfidence || 75), 0) / totalChecks)
      : 0;

    // Category distribution
    const categoryMap = {};
    items.forEach(i => {
      const cat = i.category || 'General';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

    // Status distribution
    const statusDistribution = [
      { name: 'Likely Fake', value: fakeCount, color: '#EF4444' },
      { name: 'Likely Real', value: realCount, color: '#10B981' },
      { name: 'Misleading', value: misleadingCount, color: '#F59E0B' },
      { name: 'Unverified', value: unverifiedCount, color: '#6B7280' },
    ];

    // Input type distribution
    const inputMap = {};
    items.forEach(i => {
      const type = i.inputType || 'TEXT';
      inputMap[type] = (inputMap[type] || 0) + 1;
    });
    const inputTypeDistribution = Object.entries(inputMap).map(([name, count]) => ({
      name,
      count,
    }));

    // Generate real user timeline trends (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const trends = [];
    for (let d = 6; d >= 0; d--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - d);
      const dayStr = dayNames[targetDate.getDay()];
      const dateStart = new Date(targetDate.setHours(0, 0, 0, 0));
      const dateEnd = new Date(targetDate.setHours(23, 59, 59, 999));

      const dayItems = items.filter(i => {
        const itemDate = new Date(i.createdAt);
        return itemDate >= dateStart && itemDate <= dateEnd;
      });

      trends.push({
        date: dayStr,
        fake: dayItems.filter(i => i.prediction === 'LIKELY FAKE' || i.prediction === 'FAKE').length,
        real: dayItems.filter(i => i.prediction === 'REAL' || i.prediction === 'LIKELY REAL').length,
        misleading: dayItems.filter(i => i.prediction === 'MISLEADING').length,
      });
    }

    // Confidence ranges
    const confidenceRanges = [
      { range: '90-100%', label: 'Very High', count: items.filter(i => (i.finalConfidence || 0) >= 90).length },
      { range: '75-89%', label: 'High', count: items.filter(i => (i.finalConfidence || 0) >= 75 && (i.finalConfidence || 0) < 90).length },
      { range: '50-74%', label: 'Uncertain', count: items.filter(i => (i.finalConfidence || 0) >= 50 && (i.finalConfidence || 0) < 75).length },
      { range: '<50%', label: 'Low', count: items.filter(i => (i.finalConfidence || 0) < 50).length },
    ];

    // Fetch live ML model evaluation metrics
    const mlMetrics = await MLClientService.getModelMetrics();

    return res.json({
      success: true,
      data: {
        summary: {
          totalChecks,
          fakeCount,
          realCount,
          misleadingCount,
          unverifiedCount,
          fakePercentage: totalChecks > 0 ? Math.round((fakeCount / totalChecks) * 100) : 0,
          realPercentage: totalChecks > 0 ? Math.round((realCount / totalChecks) * 100) : 0,
          avgConfidence,
          weeklyChecks: totalChecks,
          monthlyChecks: totalChecks,
        },
        statusDistribution,
        categoryDistribution,
        inputTypeDistribution,
        trends,
        confidenceRanges,
        mlModelEvaluation: mlMetrics,
      },
    });
  } catch (error) {
    next(error);
  }
};
