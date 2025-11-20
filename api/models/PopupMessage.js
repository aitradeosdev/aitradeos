const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const popupMessageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  customization: {
    backgroundColor: { type: String, default: '#1A1A1A' },
    titleColor: { type: String, default: '#FFFFFF' },
    messageColor: { type: String, default: '#CCCCCC' },
    buttonText: { type: String, default: 'Got it!' },
    buttonColor: { type: String, default: '#00D4FF' },
    buttonTextColor: { type: String, default: '#FFFFFF' },
    borderRadius: { type: Number, default: 20 },
    link: { type: String, default: '' }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

let PopupMessage;

module.exports = {
  get model() {
    if (!PopupMessage) {
      const connection = getUserConnection();
      PopupMessage = connection.model('PopupMessage', popupMessageSchema);
    }
    return PopupMessage;
  }
};
