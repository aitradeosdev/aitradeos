const mongoose = require('mongoose');
const { getUserConnection } = require('../config/database');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  featuredImage: { type: String, default: null },
  tags: [{ type: String }],
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  publishedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

let Blog;

module.exports = {
  get model() {
    if (!Blog) {
      const connection = getUserConnection();
      Blog = connection.model('Blog', blogSchema);
    }
    return Blog;
  }
};