const express = require('express');
const router = express.Router();
const DeprecationBannerModel = require('../models/DeprecationBanner');
const { auth, requireAdmin } = require('../middleware/auth');

// Get active deprecation banner
router.get('/active', auth, async (req, res) => {
  try {
    let banner = await DeprecationBannerModel.model.findOne();
    
    if (!banner) {
      banner = new DeprecationBannerModel.model({
        message: 'DEPRECATED: Analysis V1 is outdated and provides limited insights with basic explanations. Upgrade to Analysis V2 for comprehensive market analysis, detailed reasoning, enhanced accuracy, and professional-grade trading signals. V1 may produce incomplete or less accurate results. Continue at your own risk.',
        isActive: false,
        pages: []
      });
      await banner.save();
    }
    
    res.json({ banner });
  } catch (error) {
    console.error('Deprecation banner active error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get banner config
router.get('/admin/config', auth, requireAdmin, async (req, res) => {
  try {
    let banner = await DeprecationBannerModel.model.findOne();
    
    if (!banner) {
      banner = new DeprecationBannerModel.model({
        message: 'DEPRECATED: Analysis V1 is outdated and provides limited insights with basic explanations. Upgrade to Analysis V2 for comprehensive market analysis, detailed reasoning, enhanced accuracy, and professional-grade trading signals. V1 may produce incomplete or less accurate results. Continue at your own risk.',
        isActive: false,
        pages: []
      });
      await banner.save();
    }
    
    res.json({ banner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update banner
router.post('/admin/update', auth, requireAdmin, async (req, res) => {
  try {
    const { message, isActive, pages } = req.body;
    
    let banner = await DeprecationBannerModel.model.findOne();
    
    if (!banner) {
      banner = new DeprecationBannerModel.model();
    }
    
    if (message !== undefined) banner.message = message;
    if (isActive !== undefined) banner.isActive = isActive;
    if (pages !== undefined) banner.pages = pages;
    banner.updatedBy = req.user._id;
    
    await banner.save();
    res.json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
