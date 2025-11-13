const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getUserConnection } = require('../config/database');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String, default: null }
  },
  settings: {
    allowDataTraining: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    aiModel: { type: String, enum: ['gemini-2.5-flash', 'gemini-2.5-pro'], default: 'gemini-2.5-flash' },
    welcomeMessageShown: { type: Boolean, default: false },
    analysisAgreementAccepted: { type: Boolean, default: false },
    analysisAgreementAcceptedAt: { type: Date, default: null }
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    activatedAt: { type: Date, default: null },
    purchaseDate: { type: Date, default: null },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'NGN' },
    paymentReference: { type: String, default: null }
  },
  analysisHistory: [{
    id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    timestamp: { type: Date, default: Date.now },
    imageHash: String, // For single image analysis
    imageHashes: [String], // For multiple image analysis
    imageCount: { type: Number, default: 1 },
    signal: {
      action: { type: String, enum: ['BUY', 'SELL', 'HOLD'] },
      confidence: { type: Number, min: 0, max: 100 },
      entryPoint: Number,
      takeProfit: [Number],
      stopLoss: Number,
      riskReward: Number,
      timeframe: String
    },
    chartAnalysis: {
      detectedPatterns: [{
        type: String,
        confidence: Number,
        description: String,
        timeframe: String
      }],
      technicalIndicators: [{
        name: String,
        value: Number,
        signal: String,
        timeframe: String
      }],
      supportLevels: [Number],
      resistanceLevels: [Number],
      volume: String,
      trend: String,
      timeframe: String,
      timeframeAlignment: String
    },
    reasoning: {
      primary: String,
      secondary: [String],
      risks: [String],
      catalysts: [String]
    },
    marketContext: {
      symbol: String,
      timeframe: String,
      timeframes: [String],
      marketType: String
    },
    webSearchResults: [{
      query: String,
      results: [{
        title: String,
        snippet: String,
        url: String
      }],
      timestamp: Date
    }],
    geminiResponse: {
      fullResponse: String,
      processingTime: Number,
      modelVersion: String,
      timestamp: Date
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: String,
      actualOutcome: String,
      priceChange: Number,
      submittedAt: { type: Date, default: Date.now }
    }
  }],
  notifications: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
  }],
  devices: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['mobile', 'desktop', 'tablet', 'unknown'], default: 'unknown' },
    platform: String,
    browser: String,
    lastActive: { type: Date, default: Date.now },
    ipAddress: String,
    location: String,
    isCurrent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    tokenId: String
  }],
  blacklistedTokens: [{
    tokenId: { type: String, required: true },
    deviceId: String,
    blacklistedAt: { type: Date, default: Date.now }
  }],
  apiUsage: {
    totalAnalyses: { type: Number, default: 0 },
    monthlyAnalyses: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    dailyAnalyses: { type: Number, default: 0 },
    lastDailyReset: { type: Date, default: Date.now },

  },
  paymentHistory: [{
    id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    reference: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    plan: { type: String, enum: ['premium'] },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    paymentMethod: { type: String, default: 'bank_transfer' },
    requestedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date, default: null },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bankDetails: {
      accountNumber: String,
      accountName: String,
      bankName: String,
      displayedAt: Date,
      expiresAt: Date
    },
    adminNotes: { type: String, default: null }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addAnalysis = function(analysisData) {
  this.analysisHistory.push(analysisData);
  this.apiUsage.totalAnalyses += 1;
  this.apiUsage.monthlyAnalyses += 1;
  return this.save();
};

userSchema.methods.resetMonthlyUsage = function() {
  this.apiUsage.monthlyAnalyses = 0;
  this.apiUsage.lastResetDate = new Date();
  return this.save();
};

userSchema.methods.resetDailyUsage = function() {
  this.apiUsage.dailyAnalyses = 0;
  this.apiUsage.lastDailyReset = new Date();
  return this.save();
};

userSchema.methods.checkUsageLimit = function() {
  const now = new Date();
  const plan = this.subscription.plan;
  
  // Define plan limits as constants
  const planLimits = {
    free: { daily: 1, monthly: 30 },
    premium: { daily: 5, monthly: 150 }
  };
  
  const limits = planLimits[plan] || planLimits.free;
  
  // Reset daily count if it's a new day
  const lastReset = new Date(this.apiUsage.lastDailyReset);
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    this.apiUsage.dailyAnalyses = 0;
    this.apiUsage.lastDailyReset = now;
  }
  
  // Reset monthly count if it's been 30 days
  const daysSinceReset = Math.floor((now - this.apiUsage.lastResetDate) / (1000 * 60 * 60 * 24));
  if (daysSinceReset >= 30) {
    this.apiUsage.monthlyAnalyses = 0;
    this.apiUsage.lastResetDate = now;
  }
  
  return {
    canAnalyze: this.apiUsage.dailyAnalyses < limits.daily && this.apiUsage.monthlyAnalyses < limits.monthly,
    dailyRemaining: Math.max(0, limits.daily - this.apiUsage.dailyAnalyses),
    monthlyRemaining: Math.max(0, limits.monthly - this.apiUsage.monthlyAnalyses),
    dailyLimit: limits.daily,
    monthlyLimit: limits.monthly,
    resetDate: new Date(this.apiUsage.lastResetDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  };
};

userSchema.methods.incrementUsage = function() {
  this.apiUsage.totalAnalyses += 1;
  this.apiUsage.monthlyAnalyses += 1;
  this.apiUsage.dailyAnalyses += 1;
  return this.save();
};

userSchema.methods.createPaymentRequest = function(amount, plan = 'premium') {
  const reference = `HUNTR_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const paymentRequest = {
    reference,
    amount,
    currency: 'NGN',
    plan,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    requestedAt: new Date()
  };
  
  this.paymentHistory.push(paymentRequest);
  return { paymentRequest, save: () => this.save() };
};

userSchema.methods.upgradeToPremium = function(paymentReference) {
  this.subscription.plan = 'premium';
  this.subscription.activatedAt = new Date();
  this.subscription.purchaseDate = new Date();
  this.subscription.startDate = new Date();
  this.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  this.subscription.paymentReference = paymentReference;
  
  // Reset usage counts for premium plan
  this.apiUsage.monthlyAnalyses = 0;
  this.apiUsage.dailyAnalyses = 0;
  this.apiUsage.lastResetDate = new Date();
  this.apiUsage.lastDailyReset = new Date();
  
  return this.save();
};

userSchema.methods.addDevice = function(deviceInfo) {
  try {
    const existingDevice = this.devices.find(d => d.id === deviceInfo.id);
    if (existingDevice) {
      existingDevice.lastActive = new Date();
      existingDevice.isCurrent = deviceInfo.isCurrent || false;
      existingDevice.tokenId = deviceInfo.tokenId;
    } else {
      this.devices.push({
        ...deviceInfo,
        lastActive: new Date(),
        createdAt: new Date()
      });
    }
    return this.save();
  } catch (error) {
    console.error('Error in addDevice:', error);
    throw error;
  }
};

userSchema.methods.removeDevice = function(deviceId) {
  const device = this.devices.find(d => d.id === deviceId);
  if (device && device.tokenId) {
    this.blacklistedTokens.push({
      tokenId: device.tokenId,
      deviceId: deviceId,
      blacklistedAt: new Date()
    });
  }
  this.devices = this.devices.filter(d => d.id !== deviceId);
  return this.save();
};

userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

let User;

module.exports = {
  get model() {
    if (!User) {
      const connection = getUserConnection();
      User = connection.model('User', userSchema);
    }
    return User;
  }
};