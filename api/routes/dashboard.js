const express = require('express');
const UserModel = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

// Dashboard-only endpoints that don't require auth
router.get('/auth-status', async (req, res) => {
  res.json({ status: 'available', message: 'Auth endpoint is working' });
});

router.get('/analysis-status', async (req, res) => {
  res.json({ status: 'available', message: 'Analysis endpoint is working' });
});

router.get('/user-status', async (req, res) => {
  res.json({ status: 'available', message: 'User endpoints are working' });
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await UserModel.model.countDocuments();
    const activeUsers = await UserModel.model.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    
    res.json({
      totalUsers,
      activeUsers,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;