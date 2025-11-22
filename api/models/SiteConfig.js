const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const siteConfigSchema = new mongoose.Schema({
  activeUsersCount: {
    type: Number,
    default: 0
  },
  useRealActiveUsers: {
    type: Boolean,
    default: true
  },
  customActiveUsers: {
    type: Number,
    default: 10000
  },
  emailVerification: {
    enabled: { type: Boolean, default: false }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const getSiteConfigModel = () => {
  const connection = getUserConnection();
  return connection.model('SiteConfig', siteConfigSchema);
};

module.exports = getSiteConfigModel;