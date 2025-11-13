const express = require('express');
const UserModel = require('../models/User');
const ContactConfigModel = require('../models/ContactConfig');
const { auth, rateLimitByUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/analysis-history', auth, rateLimitByUser(100, 60 * 60 * 1000), async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
    const user = req.user;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    const analysisHistory = user.analysisHistory
      .sort((a, b) => {
        const aValue = a[sortBy] || a.timestamp;
        const bValue = b[sortBy] || b.timestamp;
        return sortDirection * (new Date(bValue) - new Date(aValue));
      })
      .slice(skip, skip + limitNum);

    const totalCount = user.analysisHistory.length;
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      analyses: analysisHistory,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    logger.error('Analysis history error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history.' });
  }
});

router.get('/analysis/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const analysis = user.analysisHistory.id(id);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    res.json({
      analysis
    });

  } catch (error) {
    logger.error('Single analysis fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
});

router.delete('/analysis/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Attempting to delete analysis with ID:', id);
    logger.log('User has', req.user.analysisHistory.length, 'analyses');
    
    const analysis = req.user.analysisHistory.find(a => 
      a._id?.toString() === id || a.id?.toString() === id
    );
    
    if (!analysis) {
      logger.log('Analysis not found. Available IDs:', req.user.analysisHistory.map(a => ({ _id: a._id?.toString(), id: a.id?.toString() })));
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    req.user.analysisHistory = req.user.analysisHistory.filter(a => 
      a._id?.toString() !== id && a.id?.toString() !== id
    );
    await req.user.save();
    logger.log('Analysis deleted successfully');

    res.json({ message: 'Analysis deleted successfully.' });

  } catch (error) {
    logger.error('Analysis deletion error:', error);
    res.status(500).json({ error: 'Failed to delete analysis.' });
  }
});

router.get('/statistics', auth, rateLimitByUser(1000, 60 * 60 * 1000), async (req, res) => {
  try {
    const user = req.user;
    const analyses = user.analysisHistory;

    const totalAnalyses = user.apiUsage.totalAnalyses || analyses.length;
    
    if (totalAnalyses === 0) {
      return res.json({
        statistics: {
          totalAnalyses: user.apiUsage.totalAnalyses || 0,
          signalDistribution: { BUY: 0, SELL: 0, HOLD: 0 },
          averageConfidence: 0,
          monthlyAnalyses: 0,
          recentActivity: []
        }
      });
    }

    const signalDistribution = analyses.reduce((acc, analysis) => {
      const action = analysis.signal.action;
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, { BUY: 0, SELL: 0, HOLD: 0 });

    const averageConfidence = analyses.reduce((sum, analysis) => {
      return sum + (analysis.signal.confidence || 0);
    }, 0) / totalAnalyses;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyAnalyses = analyses.filter(analysis => 
      new Date(analysis.timestamp) >= thirtyDaysAgo
    ).length;

    const recentActivity = analyses
      .slice(-7)
      .reverse()
      .map(analysis => ({
        id: analysis._id,
        timestamp: analysis.timestamp,
        action: analysis.signal.action,
        confidence: analysis.signal.confidence,
        symbol: analysis.marketData?.symbol
      }));

    res.json({
      statistics: {
        totalAnalyses,
        signalDistribution,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        monthlyAnalyses,
        recentActivity
      }
    });

  } catch (error) {
    logger.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to generate statistics.' });
  }
});

router.put('/feedback/:analysisId', auth, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { rating, comments } = req.body;
    const user = req.user;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const analysis = user.analysisHistory.id(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    if (!analysis.feedback) {
      analysis.feedback = {};
    }

    if (rating) analysis.feedback.rating = rating;
    if (comments !== undefined) analysis.feedback.comments = comments;

    await user.save();

    res.json({
      message: 'Feedback submitted successfully.',
      feedback: analysis.feedback
    });

  } catch (error) {
    logger.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
});

router.delete('/clear-history', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        error: 'Password required to clear history.' 
      });
    }

    const isValidPassword = await req.user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid password.' 
      });
    }

    req.user.analysisHistory = [];
    await req.user.save();

    res.json({
      message: 'Analysis history cleared successfully.'
    });

  } catch (error) {
    logger.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear history.' });
  }
});

// Get contact configuration for users
router.get('/contact-config', async (req, res) => {
  try {
    const config = await ContactConfigModel.model.getActiveConfig();
    
    // Only return enabled contact methods
    const enabledContacts = {
      email: config.email.enabled ? {
        address: config.email.address,
        label: config.email.label
      } : null,
      whatsapp: config.whatsapp.enabled ? {
        number: config.whatsapp.number,
        label: config.whatsapp.label
      } : null,
      phone: config.phone.enabled ? {
        number: config.phone.number,
        label: config.phone.label
      } : null
    };
    
    res.json({ contacts: enabledContacts });
  } catch (error) {
    logger.error('Get user contact config error:', error);
    res.status(500).json({ error: 'Failed to get contact information' });
  }
});

module.exports = router;