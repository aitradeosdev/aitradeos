const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const getSiteConfigModel = require('../models/SiteConfig');

router.get('/', async (req, res) => {
  try {
    const SiteConfig = getSiteConfigModel();
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
      await config.save();
    }
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

router.put('/', auth, requireAdmin, async (req, res) => {
  try {
    const { emailVerification } = req.body;
    const SiteConfig = getSiteConfigModel();
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    if (emailVerification !== undefined) {
      config.emailVerification = emailVerification;
    }
    config.updatedAt = new Date();
    config.updatedBy = req.user._id;
    await config.save();
    res.json({ config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update config' });
  }
});

module.exports = router;
