const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const commentSchema = new mongoose.Schema({
  blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  name: { type: String, default: 'Anonymous' },
  email: { type: String, required: true },
  comment: { type: String, required: true },
  isAnonymous: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

let Comment;

module.exports = {
  get model() {
    if (!Comment) {
      const connection = getUserConnection();
      Comment = connection.model('Comment', commentSchema);
    }
    return Comment;
  }
};