const mongoose = require('mongoose');
const { getMediaConnection } = require('../config/database');

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  data: { type: String, required: true }, // base64 encoded
  size: { type: Number, required: true },
  type: { type: String, enum: ['blog-image', 'logo'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

let Media;

module.exports = {
  get model() {
    if (!Media) {
      try {
        const connection = getMediaConnection();
        Media = connection.model('Media', mediaSchema);
      } catch (error) {
        console.error('Error getting media connection:', error);
        throw error;
      }
    }
    return Media;
  }
};
