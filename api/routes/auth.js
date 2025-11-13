const express = require('express');
const UserModel = require('../models/User');
const { auth, generateToken, rateLimitByUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'Email, password, and username are required.' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long.' 
      });
    }

    const existingUser = await UserModel.model.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({ 
        error: `User with this ${field} already exists.` 
      });
    }

    const user = new UserModel.model({
      email,
      password,
      username,
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    await user.save();

    // Add welcome notification for new user
    const notificationId = `welcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    user.notifications.push({
      id: notificationId,
      title: 'Welcome to Huntr AI!',
      message: 'Start analyzing trading charts to get AI-powered insights.',
      type: 'info',
      read: false,
      timestamp: new Date()
    });
    
    // Mark welcome message as shown
    user.settings.welcomeMessageShown = true;
    await user.save();

    const { token } = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        subscription: user.subscription,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        error: `User with this ${field} already exists.` 
      });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required.' 
      });
    }

    const user = await UserModel.model.findOne({ 
      $or: [{ email }, { username: email }],
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials.' 
      });
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials.' 
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const { token } = generateToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        subscription: user.subscription,
        apiUsage: user.apiUsage,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await UserModel.model.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile: user.profile,
        settings: user.settings,
        subscription: user.subscription,
        apiUsage: user.apiUsage,
        analysisHistory: user.analysisHistory,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const user = req.user;

    if (username && username !== user.username) {
      const existingUser = await UserModel.model.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already taken.' 
        });
      }
      user.username = username;
    }

    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;

    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        settings: user.settings,
        subscription: user.subscription,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    logger.error('Profile update error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Username already taken.' 
      });
    }
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

router.put('/settings', auth, async (req, res) => {
  try {
    const { allowDataTraining, notifications, theme, aiModel } = req.body;
    const user = req.user;

    logger.log('Settings update request:', { allowDataTraining, notifications, theme, aiModel });
    logger.log('Current user settings:', user.settings);

    if (allowDataTraining !== undefined) {
      user.settings.allowDataTraining = allowDataTraining;
    }
    if (notifications !== undefined) {
      user.settings.notifications = notifications;
    }
    if (theme !== undefined && ['light', 'dark'].includes(theme)) {
      user.settings.theme = theme;
    }
    if (aiModel !== undefined && ['gemini-2.5-flash', 'gemini-2.5-pro'].includes(aiModel)) {
      user.settings.aiModel = aiModel;
      logger.log('Setting aiModel to:', aiModel);
    }

    user.updatedAt = new Date();
    await user.save();

    logger.log('Updated user settings:', user.settings);

    res.json({
      message: 'Settings updated successfully.',
      settings: user.settings
    });

  } catch (error) {
    logger.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ 
        error: 'Password required to delete account.' 
      });
    }

    const isValidPassword = await req.user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid password.' 
      });
    }

    await UserModel.model.findByIdAndDelete(req.user._id);

    res.json({
      message: 'Account deleted successfully.'
    });

  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

router.post('/verify-token', auth, async (req, res) => {
  try {
    res.json({
      valid: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username
      }
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false,
      error: 'Invalid token' 
    });
  }
});

router.get('/usage-stats', auth, rateLimitByUser(50, 60 * 60 * 1000), async (req, res) => {
  try {
    const user = req.user;
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (user.apiUsage.lastResetDate < monthStart) {
      user.apiUsage.monthlyAnalyses = 0;
      user.apiUsage.lastResetDate = now;
      await user.save();
    }

    res.json({
      usage: {
        totalAnalyses: user.apiUsage.totalAnalyses,
        monthlyAnalyses: user.apiUsage.monthlyAnalyses,
        lastResetDate: user.apiUsage.lastResetDate,
        plan: user.subscription.plan,
        analysisHistoryCount: user.analysisHistory.length
      }
    });

  } catch (error) {
    logger.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics.' });
  }
});

router.put('/analysis-agreement', auth, async (req, res) => {
  try {
    const { accepted } = req.body;

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({ 
        error: 'Agreement acceptance status is required.' 
      });
    }

    const user = req.user;

    if (accepted) {
      user.settings.analysisAgreementAccepted = true;
      user.settings.analysisAgreementAcceptedAt = new Date();
      await user.save();

      return res.json({
        message: 'Analysis agreement accepted successfully.',
        settings: user.settings
      });
    } else {
      return res.status(403).json({
        error: 'You must accept the agreement to use analysis features.',
        requiresLogout: true
      });
    }

  } catch (error) {
    logger.error('Analysis agreement error:', error);
    res.status(500).json({ error: 'Failed to process agreement.' });
  }
});



module.exports = router;