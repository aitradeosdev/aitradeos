const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const contactConfigSchema = new mongoose.Schema({
  email: {
    enabled: { type: Boolean, default: false },
    address: { type: String, default: '' },
    label: { type: String, default: 'Email Support' }
  },
  whatsapp: {
    enabled: { type: Boolean, default: false },
    number: { type: String, default: '' },
    label: { type: String, default: 'WhatsApp Support' }
  },
  phone: {
    enabled: { type: Boolean, default: false },
    number: { type: String, default: '' },
    label: { type: String, default: 'Phone Support' }
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

contactConfigSchema.statics.getActiveConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = new this({});
    await config.save();
  }
  return config;
};

let ContactConfig;

module.exports = {
  get model() {
    if (!ContactConfig) {
      const connection = getUserConnection();
      ContactConfig = connection.model('ContactConfig', contactConfigSchema);
    }
    return ContactConfig;
  }
};