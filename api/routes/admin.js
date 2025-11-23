const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const UserModel = require('../models/User');
const PaymentConfigModel = require('../models/Payment');
const ContactConfigModel = require('../models/ContactConfig');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');
const multer = require('multer');
const sharp = require('sharp');
const getLogo = require('../models/Logo');
const MediaModel = require('../models/Media');

const upload = multer({ storage: multer.memoryStorage() });

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search ? {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await UserModel.model
      .find(query)
      .select('-password -blacklistedTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UserModel.model.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.model
      .findById(req.params.userId)
      .select('-password -blacklistedTokens');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Admin get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user role
router.put('/users/:userId/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { id: user._id, role: user.role } });
  } catch (error) {
    logger.error('Admin update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Deactivate user
router.put('/users/:userId/deactivate', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Deactivating user:', req.params.userId);
    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User before deactivation:', { id: user._id, isActive: user.isActive });
    user.isActive = false;
    await user.save();
    console.log('User after deactivation:', { id: user._id, isActive: user.isActive });

    res.json({ message: 'User deactivated successfully', user: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    console.error('Admin deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Reactivate user
router.put('/users/:userId/reactivate', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Reactivating user:', req.params.userId);
    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User before reactivation:', { id: user._id, isActive: user.isActive });
    user.isActive = true;
    await user.save();
    console.log('User after reactivation:', { id: user._id, isActive: user.isActive });

    res.json({ message: 'User reactivated successfully', user: { id: user._id, isActive: user.isActive } });
  } catch (error) {
    console.error('Admin reactivate user error:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// Toggle user status (activate/deactivate)
router.put('/users/:userId/toggle-status', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Toggling user status for userId:', req.params.userId);
    
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    console.log('User before status toggle:', { 
      id: user._id, 
      username: user.username,
      isActive: user.isActive,
      role: user.role 
    });
    
    // Ensure isActive field exists and toggle it
    const newStatus = user.isActive === false ? true : false;
    user.isActive = newStatus;
    
    const savedUser = await user.save();
    
    console.log('User after status toggle:', { 
      id: savedUser._id, 
      username: savedUser.username,
      isActive: savedUser.isActive,
      role: savedUser.role 
    });

    res.json({ 
      message: `User ${savedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { 
        id: savedUser._id, 
        username: savedUser.username,
        isActive: savedUser.isActive,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('Admin toggle user status error:', error);
    res.status(500).json({ error: 'Failed to toggle user status', details: error.message });
  }
});

// Make user admin by ID (for fixing existing users)
router.post('/make-admin/:userId', async (req, res) => {
  try {
    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ message: 'User is now admin', user: { id: user._id, role: user.role } });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
});

// Create first admin (one-time setup)
router.post('/setup', async (req, res) => {
  try {
    const adminCount = await UserModel.model.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username required' });
    }

    const admin = new UserModel.model({
      email,
      password,
      username,
      role: 'admin',
      profile: { firstName: 'Admin', lastName: 'User' }
    });

    await admin.save();
    res.json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Get/update site configuration
router.get('/site-config', auth, requireAdmin, async (req, res) => {
  try {
    const SiteConfig = require('../models/SiteConfig')();
    let config = await SiteConfig.findOne();
    
    if (!config) {
      config = new SiteConfig({
        useRealActiveUsers: true,
        customActiveUsers: 10000
      });
      await config.save();
    }
    
    // Calculate real active users (all active users)
    const realActiveUsers = await UserModel.model.countDocuments({
      isActive: true
    });
    
    config.activeUsersCount = config.useRealActiveUsers ? realActiveUsers : config.customActiveUsers;
    
    res.json({ config, realActiveUsers });
  } catch (error) {
    console.error('Get site config error:', error);
    res.status(500).json({ error: 'Failed to get site configuration' });
  }
});

router.put('/site-config', auth, requireAdmin, async (req, res) => {
  try {
    const { useRealActiveUsers, customActiveUsers } = req.body;
    const SiteConfig = require('../models/SiteConfig')();
    
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig();
    }
    
    if (typeof useRealActiveUsers === 'boolean') {
      config.useRealActiveUsers = useRealActiveUsers;
    }
    
    if (typeof customActiveUsers === 'number' && customActiveUsers >= 0) {
      config.customActiveUsers = customActiveUsers;
    }
    
    config.updatedBy = req.user._id;
    config.updatedAt = new Date();
    await config.save();
    
    res.json({ message: 'Site configuration updated', config });
  } catch (error) {
    console.error('Update site config error:', error);
    res.status(500).json({ error: 'Failed to update site configuration' });
  }
});

// Get public active users count
router.get('/active-users', async (req, res) => {
  try {
    const SiteConfig = require('../models/SiteConfig')();
    let config = await SiteConfig.findOne();
    
    if (!config) {
      config = new SiteConfig({ useRealActiveUsers: true, customActiveUsers: 10000 });
      await config.save();
    }
    
    let activeUsersCount;
    
    if (config.useRealActiveUsers) {
      activeUsersCount = await UserModel.model.countDocuments({
        isActive: true
      });
    } else {
      activeUsersCount = config.customActiveUsers;
    }
    
    res.json({ activeUsersCount });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({ activeUsersCount: 10000 }); // Fallback
  }
});

// Get system statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await UserModel.model.countDocuments();
    const activeUsers = await UserModel.model.countDocuments({ isActive: true });
    const premiumUsers = await UserModel.model.countDocuments({ 'subscription.plan': 'premium' });
    
    const totalAnalyses = await UserModel.model.aggregate([
      { $group: { _id: null, total: { $sum: '$apiUsage.totalAnalyses' } } }
    ]);

    const recentUsers = await UserModel.model
      .find()
      .select('username email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        premiumUsers,
        totalAnalyses: totalAnalyses[0]?.total || 0
      },
      recentUsers
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Change user password (admin only)
router.put('/users/:userId/password', auth, requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Remove user device (admin only)
router.delete('/users/:userId/devices/:deviceId', auth, requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const device = user.devices.find(d => d.id === req.params.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    await user.removeDevice(req.params.deviceId);
    res.json({ message: 'Device removed successfully' });
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

// Logout user from all devices (admin only)
router.post('/users/:userId/logout-devices', auth, requireAdmin, async (req, res) => {
  try {
    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove all devices from user account
    user.devices = [];
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({ message: 'User logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout devices error:', error);
    res.status(500).json({ error: 'Failed to logout devices' });
  }
});



// Delete user account (admin only)
router.delete('/users/:userId', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Admin deleting user:', req.params.userId);
    
    // Validate userId format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await UserModel.model.findById(req.params.userId);
    if (!user) {
      console.log('User not found:', req.params.userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    console.log('Deleting user:', { 
      id: user._id, 
      username: user.username,
      email: user.email,
      role: user.role 
    });
    
    // Delete the user
    await UserModel.model.findByIdAndDelete(req.params.userId);
    
    console.log('User deleted successfully:', user.username);

    res.json({ 
      message: `User ${user.username} deleted successfully`,
      deletedUser: { 
        id: user._id, 
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

const fs = require('fs');
const path = require('path');

// Get environment variables
router.get('/env', auth, requireAdmin, async (req, res) => {
  try {
    // In serverless, return process.env instead of reading file
    const envVars = {
      NODE_ENV: process.env.NODE_ENV || 'Not set',
      MONGODB_URI_USERS: process.env.MONGODB_URI_USERS ? '***' + process.env.MONGODB_URI_USERS.slice(-10) : 'Not set',
      MONGODB_URI_TRAINING: process.env.MONGODB_URI_TRAINING ? '***' + process.env.MONGODB_URI_TRAINING.slice(-10) : 'Not set',
      MONGODB_URI_MEDIA: process.env.MONGODB_URI_MEDIA ? '***' + process.env.MONGODB_URI_MEDIA.slice(-10) : 'Not set',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'Not set',
      SERPER_API_KEY: process.env.SERPER_API_KEY ? '***' + process.env.SERPER_API_KEY.slice(-4) : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? '***' : 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'Not set'
    };
    
    res.json({ envVars });
  } catch (error) {
    console.error('Get env vars error:', error);
    res.status(500).json({ error: 'Failed to get environment variables' });
  }
});

// Update environment variables
router.put('/env', auth, requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    const envPath = path.join(__dirname, '../../.env');
    
    if (!value || value.trim() === '') {
      return res.status(400).json({ error: 'Value cannot be empty' });
    }
    
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    let keyFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(key + '=')) {
        lines[i] = `${key}=${value}`;
        keyFound = true;
        break;
      }
    }
    
    if (!keyFound) {
      lines.push(`${key}=${value}`);
    }
    
    fs.writeFileSync(envPath, lines.join('\n'));
    process.env[key] = value;
    
    console.log(`Environment variable ${key} updated by admin`);
    res.json({ message: `${key} updated successfully` });
  } catch (error) {
    console.error('Update env var error:', error);
    res.status(500).json({ error: 'Failed to update environment variable' });
  }
});

// Restart server
router.post('/restart', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Server restart requested by admin');
    const environment = process.env.NODE_ENV || 'development';
    const isProduction = environment === 'production';
    
    console.log(`Environment detected: ${environment}`);
    console.log(`Using ${isProduction ? 'production' : 'development'} restart method`);
    
    res.json({ 
      message: `Server restarting in ${environment} mode...`,
      method: isProduction ? 'process-spawn-restart' : 'nodemon-touch'
    });
    
    setTimeout(() => {
      if (isProduction) {
        // Production restart: graceful exit for platform restart
        console.log('Initiating production restart...');
        console.log('Platform/PM2 will automatically restart after process exit');
        
        // Clean exit - deployment platforms handle restart automatically
        setTimeout(() => {
          process.exit(0);
        }, 1000);
      } else {
        // Development restart: touch main file to trigger nodemon
        try {
          const mainFile = path.join(__dirname, '../index.js');
          const time = new Date();
          fs.utimesSync(mainFile, time, time);
          console.log('Main file touched, nodemon should restart the server');
        } catch (touchError) {
          console.error('Failed to touch main file:', touchError);
          // Fallback to process exit even in development
          console.log('Falling back to process exit');
          process.exit(0);
        }
      }
    }, 1000);
  } catch (error) {
    console.error('Restart error:', error);
    res.status(500).json({ 
      error: 'Failed to restart server',
      details: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Initialize database - fix missing isActive and lastActive fields
router.post('/init-database', auth, requireAdmin, async (req, res) => {
  try {
    console.log('Initializing database - fixing user fields...');
    
    // Update users without isActive field
    const isActiveResult = await UserModel.model.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    // Update users without lastActive field
    const lastActiveResult = await UserModel.model.updateMany(
      { lastActive: { $exists: false } },
      { $set: { lastActive: new Date() } }
    );
    
    console.log(`Updated ${isActiveResult.modifiedCount} users with missing isActive field`);
    console.log(`Updated ${lastActiveResult.modifiedCount} users with missing lastActive field`);
    
    // Get all users to verify
    const allUsers = await UserModel.model.find({}, 'username email isActive lastActive role').sort({ createdAt: -1 });
    
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.isActive === true).length,
      inactiveUsers: allUsers.filter(u => u.isActive === false).length,
      usersFixedIsActive: isActiveResult.modifiedCount,
      usersFixedLastActive: lastActiveResult.modifiedCount
    };
    
    console.log('Database initialization completed:', stats);
    
    res.json({
      message: 'Database initialized successfully',
      stats,
      users: allUsers.map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        isActive: u.isActive,
        lastActive: u.lastActive,
        role: u.role
      }))
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
});

// PAYMENT MANAGEMENT ROUTES

// Get all payment requests
router.get('/payments', auth, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Aggregate all payment requests from all users
    const pipeline = [
      { $unwind: '$paymentHistory' },
      {
        $match: status ? { 'paymentHistory.status': status } : {}
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          payment: {
            id: '$paymentHistory._id',
            userId: '$_id',  
            reference: '$paymentHistory.reference',
            amount: '$paymentHistory.amount',
            currency: '$paymentHistory.currency',
            plan: '$paymentHistory.plan',
            status: '$paymentHistory.status',
            paymentMethod: '$paymentHistory.paymentMethod',
            requestedAt: '$paymentHistory.requestedAt',
            confirmedAt: '$paymentHistory.confirmedAt',
            confirmedBy: '$paymentHistory.confirmedBy',
            bankDetails: '$paymentHistory.bankDetails',
            adminNotes: '$paymentHistory.adminNotes',
            createdAt: '$paymentHistory.requestedAt',
            expiresAt: '$paymentHistory.bankDetails.expiresAt'
          },
          user: {
            id: '$_id',
            email: { $arrayElemAt: ['$userInfo.email', 0] },
            username: { $arrayElemAt: ['$userInfo.username', 0] },
            name: {
              $concat: [
                { $ifNull: [{ $arrayElemAt: ['$userInfo.profile.firstName', 0] }, ''] },
                ' ',
                { $ifNull: [{ $arrayElemAt: ['$userInfo.profile.lastName', 0] }, ''] }
              ]
            }
          }
        }
      },
      { $sort: { 'payment.requestedAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];
    
    const payments = await UserModel.model.aggregate(pipeline);
    
    // Get total count for pagination
    const totalPipeline = [
      { $unwind: '$paymentHistory' },
      {
        $match: status ? { 'paymentHistory.status': status } : {}
      },
      { $count: 'total' }
    ];
    
    const totalResult = await UserModel.model.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    // Flatten the response structure for frontend
    const flattenedPayments = payments.map(p => ({
      ...p.payment,
      username: p.user.username,
      userEmail: p.user.email,
      userName: p.user.name?.trim() || p.user.username
    }));
    
    res.json({
      success: true,
      payments: flattenedPayments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        total: total,
        filtered: flattenedPayments.length
      }
    });
    
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment statistics
router.get('/payments/stats', auth, requireAdmin, async (req, res) => {
  try {
    const config = await PaymentConfigModel.model.getActiveConfig();
    
    // Get counts from all users
    const stats = await UserModel.model.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $group: {
          _id: '$paymentHistory.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$paymentHistory.amount' }
        }
      }
    ]);
    
    const summary = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      totalRevenue: 0,
      pendingAmount: 0
    };
    
    stats.forEach(stat => {
      summary[stat._id] = stat.count;
      if (stat._id === 'confirmed') {
        summary.totalRevenue = stat.totalAmount;
      } else if (stat._id === 'pending') {
        summary.pendingAmount = stat.totalAmount;
      }
    });
    
    // Get recent payments (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPayments = await UserModel.model.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.requestedAt': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentHistory.requestedAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$paymentHistory.amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      summary,
      recentPayments,
      config: {
        premiumAmount: config.premiumPlan.amount,
        currency: config.premiumPlan.currency,
        bankAccount: config.bankAccount
      }
    });
    
  } catch (error) {
    console.error('Admin payment stats error:', error);
    res.status(500).json({ error: 'Failed to get payment statistics' });
  }
});

// Approve payment request
router.post('/payments/:userId/:reference/approve', auth, requireAdmin, async (req, res) => {
  try {
    const { userId, reference } = req.params;
    const { adminNotes } = req.body;
    
    const user = await UserModel.model.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const payment = user.paymentHistory.find(p => p.reference === reference);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        error: `Payment is already ${payment.status}`,
        payment: {
          reference: payment.reference,
          status: payment.status
        }
      });
    }
    
    // Update payment status
    payment.status = 'confirmed';
    payment.confirmedAt = new Date();
    payment.confirmedBy = req.user._id;
    if (adminNotes) {
      payment.adminNotes = adminNotes;
    }
    
    // Upgrade user to premium
    await user.upgradeToPremium(payment.reference);
    
    // Update payment statistics
    const config = await PaymentConfigModel.model.getActiveConfig();
    await config.incrementPaymentStats(payment.amount, 'confirmed');
    
    // Send notification to user about payment approval
    await notificationService.sendPaymentNotification('payment_approved', {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      userId: user._id,
      adminNotes: payment.adminNotes
    }, {
      id: user._id,
      username: user.username
    });
    
    res.json({
      success: true,
      message: 'Payment approved and user upgraded to premium',
      payment: {
        reference: payment.reference,
        status: payment.status,
        confirmedAt: payment.confirmedAt,
        adminNotes: payment.adminNotes
      },
      user: {
        id: user._id,
        subscription: user.subscription
      }
    });
    
  } catch (error) {
    console.error('Admin approve payment error:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// Reject payment request
router.post('/payments/:userId/:reference/reject', auth, requireAdmin, async (req, res) => {
  try {
    const { userId, reference } = req.params;
    const { adminNotes } = req.body;
    
    const user = await UserModel.model.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const payment = user.paymentHistory.find(p => p.reference === reference);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        error: `Payment is already ${payment.status}`,
        payment: {
          reference: payment.reference,
          status: payment.status
        }
      });
    }
    
    // Update payment status
    payment.status = 'rejected';
    payment.confirmedAt = new Date();
    payment.confirmedBy = req.user._id;
    if (adminNotes) {
      payment.adminNotes = adminNotes;
    } else {
      payment.adminNotes = 'Rejected by admin';
    }
    
    await user.save();
    
    // Update payment statistics
    const config = await PaymentConfigModel.model.getActiveConfig();
    await config.incrementPaymentStats(payment.amount, 'rejected');
    
    // Send notification to user about payment rejection
    await notificationService.sendPaymentNotification('payment_rejected', {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      userId: user._id,
      adminNotes: payment.adminNotes
    }, {
      id: user._id,
      username: user.username
    });
    
    res.json({
      success: true,
      message: 'Payment rejected',
      payment: {
        reference: payment.reference,
        status: payment.status,
        confirmedAt: payment.confirmedAt,
        adminNotes: payment.adminNotes
      }
    });
    
  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Simplified approve payment route (using payment ID from aggregated results)
router.put('/payments/:paymentId/approve', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    // Find user with this payment ID in their payment history
    const user = await UserModel.model.findOne({
      'paymentHistory._id': new mongoose.Types.ObjectId(paymentId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = user.paymentHistory.id(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending' && payment.status !== 'confirmed') {
      return res.status(400).json({ 
        error: `Payment is already ${payment.status}`,
        payment: { reference: payment.reference, status: payment.status }
      });
    }
    
    // Update payment status  
    payment.status = 'confirmed';
    payment.confirmedAt = new Date();
    payment.confirmedBy = req.user._id;
    if (reason) {
      payment.adminNotes = reason;
    }
    
    // Upgrade user to premium
    await user.upgradeToPremium(payment.reference);
    
    // Update payment statistics
    const config = await PaymentConfigModel.model.getActiveConfig();
    await config.incrementPaymentStats(payment.amount, 'confirmed');
    
    // Send notification to user about payment approval
    await notificationService.sendPaymentNotification('payment_approved', {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      userId: user._id,
      adminNotes: payment.adminNotes
    }, {
      id: user._id,
      username: user.username
    });
    
    res.json({
      success: true,
      message: 'Payment approved and user upgraded to premium',
      payment: {
        id: payment._id,
        reference: payment.reference,
        status: payment.status,
        confirmedAt: payment.confirmedAt
      }
    });
    
  } catch (error) {
    console.error('Admin approve payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve payment' });
  }
});

// Simplified reject payment route (using payment ID from aggregated results)
router.put('/payments/:paymentId/reject', auth, requireAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    // Find user with this payment ID in their payment history
    const user = await UserModel.model.findOne({
      'paymentHistory._id': new mongoose.Types.ObjectId(paymentId)
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = user.paymentHistory.id(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (payment.status !== 'pending' && payment.status !== 'confirmed') {
      return res.status(400).json({ 
        error: `Payment is already ${payment.status}`,
        payment: { reference: payment.reference, status: payment.status }
      });
    }
    
    // Update payment status
    payment.status = 'rejected';
    payment.confirmedAt = new Date();
    payment.confirmedBy = req.user._id;
    payment.adminNotes = reason || 'Rejected by admin';
    
    await user.save();
    
    // Update payment statistics
    const config = await PaymentConfigModel.model.getActiveConfig();
    await config.incrementPaymentStats(payment.amount, 'rejected');
    
    // Send notification to user about payment rejection
    await notificationService.sendPaymentNotification('payment_rejected', {
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      userId: user._id,
      adminNotes: payment.adminNotes
    }, {
      id: user._id,
      username: user.username
    });
    
    res.json({
      success: true,
      message: 'Payment rejected',
      payment: {
        id: payment._id,
        reference: payment.reference,
        status: payment.status,
        confirmedAt: payment.confirmedAt,
        adminNotes: payment.adminNotes
      }
    });
    
  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject payment' });
  }
});

// Get payment configuration
router.get('/payment-config', auth, requireAdmin, async (req, res) => {
  try {
    const config = await PaymentConfigModel.model.getActiveConfig();
    
    res.json({
      config: {
        premiumPlan: config.premiumPlan,
        bankAccount: config.bankAccount,
        paymentSettings: config.paymentSettings,
        notifications: config.notifications,
        statistics: config.statistics
      }
    });
    
  } catch (error) {
    console.error('Admin get payment config error:', error);
    res.status(500).json({ error: 'Failed to get payment configuration' });
  }
});

// Update payment configuration
router.put('/payment-config', auth, requireAdmin, async (req, res) => {
  try {
    const { premiumPlan, bankAccount, paymentSettings, notifications } = req.body;
    
    const config = await PaymentConfigModel.model.getActiveConfig();
    
    if (premiumPlan) {
      await config.updatePremiumPlan(premiumPlan, req.user._id);
    }
    
    if (bankAccount) {
      await config.updateBankAccount(bankAccount, req.user._id);
    }
    
    if (paymentSettings) {
      config.paymentSettings = { ...config.paymentSettings, ...paymentSettings };
      config.updatedBy = req.user._id;
      await config.save();
    }
    
    if (notifications) {
      config.notifications = { ...config.notifications, ...notifications };
      config.updatedBy = req.user._id;
      await config.save();
    }
    
    res.json({
      success: true,
      message: 'Payment configuration updated successfully',
      config: {
        premiumPlan: config.premiumPlan,
        bankAccount: config.bankAccount,
        paymentSettings: config.paymentSettings,
        notifications: config.notifications
      }
    });
    
  } catch (error) {
    console.error('Admin update payment config error:', error);
    res.status(500).json({ error: 'Failed to update payment configuration' });
  }
});

// CONTACT CONFIGURATION ROUTES

// Get contact configuration
router.get('/contact-config', auth, requireAdmin, async (req, res) => {
  try {
    const config = await ContactConfigModel.model.getActiveConfig();
    res.json({ config });
  } catch (error) {
    console.error('Get contact config error:', error);
    res.status(500).json({ error: 'Failed to get contact configuration' });
  }
});

// Update contact configuration
router.put('/contact-config', auth, requireAdmin, async (req, res) => {
  try {
    const { email, whatsapp, phone } = req.body;
    const config = await ContactConfigModel.model.getActiveConfig();
    
    if (email !== undefined) {
      config.email = { ...config.email, ...email };
    }
    if (whatsapp !== undefined) {
      config.whatsapp = { ...config.whatsapp, ...whatsapp };
    }
    if (phone !== undefined) {
      config.phone = { ...config.phone, ...phone };
    }
    
    config.updatedBy = req.user._id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Contact configuration updated successfully',
      config
    });
  } catch (error) {
    console.error('Update contact config error:', error);
    res.status(500).json({ error: 'Failed to update contact configuration' });
  }
});

// TRAINING DATA ROUTES

// Get training data
router.get('/training-data', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, hasFeedback = 'false' } = req.query;
    const skip = (page - 1) * limit;

    const TrainingDataModel = require('../models/TrainingData');
    
    const query = hasFeedback === 'true' ? { 'feedback.userRating': { $exists: true } } : {};
    
    const trainingData = await TrainingDataModel.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TrainingDataModel.model.countDocuments(query);

    res.json({
      trainingData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get training data error:', error);
    res.status(500).json({ error: 'Failed to fetch training data' });
  }
});

// Get training data statistics
router.get('/training-data/stats', auth, requireAdmin, async (req, res) => {
  try {
    const TrainingDataModel = require('../models/TrainingData');
    
    const total = await TrainingDataModel.model.countDocuments();
    const withFeedback = await TrainingDataModel.model.countDocuments({ 'feedback.userRating': { $exists: true } });
    const avgRating = await TrainingDataModel.model.aggregate([
      { $match: { 'feedback.userRating': { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$feedback.userRating' } } }
    ]);

    res.json({
      total,
      withFeedback,
      withoutFeedback: total - withFeedback,
      averageRating: avgRating[0]?.avg || 0
    });
  } catch (error) {
    logger.error('Get training stats error:', error);
    res.status(500).json({ error: 'Failed to fetch training statistics' });
  }
});

// Clear all training data
router.delete('/training-data', auth, requireAdmin, async (req, res) => {
  try {
    const TrainingDataModel = require('../models/TrainingData');
    const result = await TrainingDataModel.model.deleteMany({});
    
    logger.log(`Admin cleared ${result.deletedCount} training data records`);
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} training records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('Clear training data error:', error);
    res.status(500).json({ error: 'Failed to clear training data' });
  }
});

// LOGO MANAGEMENT ROUTES

// Get all logos
router.get('/logos', async (req, res) => {
  try {
    const Logo = getLogo();
    const logos = await Logo.find().sort({ order: 1 });
    res.json({ logos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logos' });
  }
});

// Upload logo
router.post('/logos', auth, requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const processedImage = await sharp(req.file.buffer)
      .trim()
      .resize(800, 200, { fit: 'inside', withoutEnlargement: false, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const filename = `logo-${Date.now()}.png`;
    const base64Data = processedImage.toString('base64');

    const media = new MediaModel.model({
      filename,
      mimetype: 'image/png',
      data: base64Data,
      size: processedImage.length,
      type: 'logo',
      uploadedBy: req.user._id
    });

    await media.save();

    const Logo = getLogo();
    const maxOrder = await Logo.findOne().sort({ order: -1 });
    const logo = new Logo({
      imageUrl: `/api/media/${media._id}`,
      order: maxOrder ? maxOrder.order + 1 : 0,
    });

    await logo.save();
    res.json({ logo });
  } catch (error) {
    logger.error('Logo upload error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Delete logo
router.delete('/logos/:id', auth, requireAdmin, async (req, res) => {
  try {
    const Logo = getLogo();
    const logo = await Logo.findById(req.params.id);
    if (!logo) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    // Delete from media database if it's a media URL
    if (logo.imageUrl.includes('/api/media/')) {
      const mediaId = logo.imageUrl.split('/').pop();
      try {
        await MediaModel.model.findByIdAndDelete(mediaId);
      } catch (err) {
        logger.error('Failed to delete media:', err);
      }
    }

    await logo.deleteOne();
    res.json({ message: 'Logo deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete logo' });
  }
});



module.exports = router;