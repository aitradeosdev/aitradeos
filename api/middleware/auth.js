const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.model.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user deactivated.' });
    }

    // Check if token is blacklisted
    const isBlacklisted = user.blacklistedTokens.some(bt => bt.tokenId === decoded.tokenId);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked.' });
    }

    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    req.tokenId = decoded.tokenId;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Authentication failed.' });
  }
};

const generateToken = (userId, deviceId = null) => {
  const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    token: jwt.sign(
      { userId, tokenId, deviceId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    ),
    tokenId
  };
};

const optional = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.model.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

const checkSubscription = (requiredPlan = 'free') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userPlan = req.user.subscription.plan;
    
    if (requiredPlan === 'premium' && userPlan !== 'premium') {
      return res.status(403).json({ 
        error: 'Premium subscription required.',
        userPlan,
        requiredPlan 
      });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  next();
};

const rateLimitByUser = (maxRequests = 100, windowMs = 60 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Too many requests.',
        resetTime: Math.ceil((requests[0] + windowMs) / 1000)
      });
    }

    recentRequests.push(now);
    userRequests.set(userId, recentRequests);

    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - recentRequests.length,
      'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000)
    });

    next();
  };
};

module.exports = {
  auth,
  optional,
  generateToken,
  checkSubscription,
  rateLimitByUser,
  requireAdmin
};