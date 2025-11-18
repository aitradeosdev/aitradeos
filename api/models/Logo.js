const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const logoSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

let Logo;
module.exports = () => {
  if (!Logo) {
    Logo = getUserConnection().model('Logo', logoSchema);
  }
  return Logo;
};
