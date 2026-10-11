const SavedArticle = require('../models/SavedArticle');
const Analysis = require('../models/Analysis');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

exports.getSavedArticles = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    if (getDBStatus()) {
      const saved = await SavedArticle.find({ userId }).populate('analysisId').sort({ createdAt: -1 });
      return res.json({ success: true, data: saved });
    } else {
      const userSaved = memoryStore.savedArticles.filter(s => s.userId === userId);
      const populated = userSaved.map(s => {
        const analysis = memoryStore.analyses.find(a => String(a._id) === String(s.analysisId));
        return {
          ...s,
          analysisId: analysis || null,
        };
      });
      return res.json({ success: true, data: populated });
    }
  } catch (error) {
    next(error);
  }
};

exports.saveArticle = async (req, res, next) => {
  try {
    const { analysisId, title, notes, tags } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Please sign in to save articles.' });
    }

    if (!analysisId || !title) {
      return res.status(400).json({ success: false, message: 'Analysis ID and title are required.' });
    }

    if (getDBStatus()) {
      const saved = await SavedArticle.create({
        userId,
        analysisId,
        title,
        notes: notes || '',
        tags: tags || [],
      });
      return res.status(201).json({ success: true, message: 'Article bookmarked successfully.', data: saved });
    } else {
      const newSaved = {
        _id: `saved-${Date.now()}`,
        userId,
        analysisId,
        title,
        notes: notes || '',
        tags: tags || [],
        createdAt: new Date(),
      };
      memoryStore.savedArticles.unshift(newSaved);
      return res.status(201).json({ success: true, message: 'Article bookmarked successfully.', data: newSaved });
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteSavedArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (getDBStatus()) {
      await SavedArticle.findOneAndDelete({ _id: id, ...(userId ? { userId } : {}) });
    } else {
      memoryStore.savedArticles = memoryStore.savedArticles.filter(
        s => String(s._id) !== String(id) || (userId && s.userId !== userId)
      );
    }
    return res.json({ success: true, message: 'Bookmark removed.' });
  } catch (error) {
    next(error);
  }
};
