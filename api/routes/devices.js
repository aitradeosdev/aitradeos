const express = require('express');
const router = express.Router();
const { getUserConnection } = require('../config/database');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const deviceLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour per IP
  message: { error: 'Too many device requests, try again later' }
});

// Get user devices
router.get('/', deviceLimit, auth, async (req, res) => {
  try {
    const User = require('../models/User').model;
    const user = await User.findById(req.user.id).select('devices');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Sort devices by last active (most recent first)
    const sortedDevices = user.devices.sort((a, b) => 
      new Date(b.lastActive) - new Date(a.lastActive)
    );

    res.json({ devices: sortedDevices });
  } catch (error) {
    logger.error('Get devices error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Register/update device
router.post('/register', deviceLimit, auth, async (req, res) => {
  try {
    const { deviceId, name, type, platform, browser, ipAddress, location } = req.body;
    
    if (!deviceId || !name) {
      return res.status(400).json({ error: 'Device ID and name are required' });
    }

    const User = require('../models/User').model;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingDevice = user.devices.find(d => d.id === deviceId);
    const isNewDevice = !existingDevice;

    // Mark all other devices as not current
    user.devices.forEach(device => {
      device.isCurrent = false;
    });

    await user.addDevice({
      id: deviceId,
      name,
      type: type || 'unknown',
      platform,
      browser,
      ipAddress,
      location,
      isCurrent: true,
      tokenId: req.tokenId
    });

    // Add notification for new device login (non-blocking)
    if (isNewDevice && user.settings?.notifications) {
      const notificationId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      user.notifications.push({
        id: notificationId,
        title: 'New Device Login',
        message: `Login detected from ${name}${location ? ` in ${location}` : ''}`,
        type: 'info',
        read: false,
        timestamp: new Date()
      });
      // Save in background to avoid blocking
      user.save().catch(logger.error);
    }

    res.json({ message: 'Device registered successfully' });
  } catch (error) {
    logger.error('Register device error:', error);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// Remove device
router.delete('/:deviceId', deviceLimit, auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const User = require('../models/User').model;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const device = user.devices.find(d => d.id === deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Don't allow removing current device
    if (device.isCurrent) {
      return res.status(400).json({ error: 'Cannot remove current device' });
    }

    await user.removeDevice(deviceId);
    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    logger.error('Remove device error:', error);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

module.exports = router;