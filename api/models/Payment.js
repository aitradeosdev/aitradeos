const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const paymentConfigSchema = new mongoose.Schema({
  premiumPlan: {
    amount: { type: Number, default: 5000 }, // Default amount in smallest currency unit (kobo for NGN)
    currency: { type: String, default: 'NGN' },
    displayAmount: { type: String, default: '₦5,000' },
    duration: { type: Number, default: 30 }, // Days
    features: {
      dailyAnalyses: { type: Number, default: 5 },
      monthlyAnalyses: { type: Number, default: 150 },
      supportLevel: { type: String, default: 'Priority' },
      additionalFeatures: [{ type: String }]
    }
  },
  bankAccount: {
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    bankName: { type: String, required: true },
    bankCode: { type: String, default: null },
    isActive: { type: Boolean, default: true }
  },
  paymentSettings: {
    autoApproval: { type: Boolean, default: false },
    paymentTimeoutMinutes: { type: Number, default: 30 },
    requireProofOfPayment: { type: Boolean, default: false },
    maxPendingPayments: { type: Number, default: 10 }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    adminEmails: [{ type: String }],
    notificationTemplate: {
      subject: { type: String, default: 'New Payment Request - Huntr AI' },
      message: { type: String, default: 'A new payment request has been submitted for review.' }
    }
  },
  statistics: {
    totalPayments: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    pendingPayments: { type: Number, default: 0 },
    approvedPayments: { type: Number, default: 0 },
    rejectedPayments: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure only one active config exists
paymentConfigSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Methods for updating payment statistics
paymentConfigSchema.methods.incrementPaymentStats = function(amount, status) {
  this.statistics.totalPayments += 1;
  
  if (status === 'confirmed') {
    this.statistics.totalRevenue += amount;
    this.statistics.approvedPayments += 1;
  } else if (status === 'rejected') {
    this.statistics.rejectedPayments += 1;
  } else if (status === 'pending') {
    this.statistics.pendingPayments += 1;
  }
  
  this.statistics.lastUpdated = new Date();
  return this.save();
};

paymentConfigSchema.methods.updateBankAccount = function(bankDetails, updatedBy) {
  this.bankAccount = { ...this.bankAccount, ...bankDetails };
  this.updatedBy = updatedBy;
  return this.save();
};

paymentConfigSchema.methods.updatePremiumPlan = function(planDetails, updatedBy) {
  this.premiumPlan = { ...this.premiumPlan, ...planDetails };
  this.updatedBy = updatedBy;
  return this.save();
};

// Static method to get active config
paymentConfigSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne({ isActive: true });
  
  // Create default config if none exists
  if (!config) {
    // Find the first admin user to create the config
    const User = require('./User').model;
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      throw new Error('No admin user found to create payment configuration');
    }
    
    config = new this({
      bankAccount: {
        accountNumber: '0123456789',
        accountName: 'HUNTR AI TECHNOLOGIES',
        bankName: 'ACCESS BANK'
      },
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    });
    
    await config.save();
  }
  
  return config;
};

// Static method to create or update config
paymentConfigSchema.statics.upsertConfig = async function(configData, userId) {
  let config = await this.findOne({ isActive: true });
  
  if (config) {
    Object.keys(configData).forEach(key => {
      if (typeof configData[key] === 'object' && !Array.isArray(configData[key])) {
        config[key] = { ...config[key], ...configData[key] };
      } else {
        config[key] = configData[key];
      }
    });
    config.updatedBy = userId;
  } else {
    config = new this({
      ...configData,
      createdBy: userId,
      updatedBy: userId
    });
  }
  
  return await config.save();
};

let PaymentConfig;

module.exports = {
  get model() {
    if (!PaymentConfig) {
      const connection = getUserConnection();
      PaymentConfig = connection.model('PaymentConfig', paymentConfigSchema);
    }
    return PaymentConfig;
  }
};