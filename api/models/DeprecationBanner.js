const mongoose = require('mongoose');

const deprecationBannerSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    default: 'DEPRECATED: Analysis V1 is outdated and provides limited insights with basic explanations. Upgrade to Analysis V2 for comprehensive market analysis, detailed reasoning, enhanced accuracy, and professional-grade trading signals. V1 may produce incomplete or less accurate results. Continue at your own risk.'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  pages: [{
    type: String,
    enum: ['analysis-v1', 'analysis-v2'],
    default: []
  }],
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const getModel = () => {
  const { getMediaConnection } = require('../config/database');
  const connection = getMediaConnection();
  return connection.models.DeprecationBanner || connection.model('DeprecationBanner', deprecationBannerSchema);
};

module.exports = {
  get model() {
    return getModel();
  },
  schema: deprecationBannerSchema
};
