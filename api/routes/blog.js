const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { auth, requireAdmin } = require('../middleware/auth');
const BlogModel = require('../models/Blog');
const logger = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: 'published' };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const blogs = await BlogModel.model
      .find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogModel.model.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get public blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await BlogModel.model
      .findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username profile.firstName profile.lastName');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog });
  } catch (error) {
    logger.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Admin routes
router.get('/admin', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await BlogModel.model
      .find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogModel.model.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get admin blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.post('/admin', auth, requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, tags, category, status, featured } = req.body;

    if (!title || !content || !excerpt) {
      return res.status(400).json({ error: 'Title, content, and excerpt are required' });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();

    const blog = new BlogModel.model({
      title,
      content,
      excerpt,
      slug,
      featuredImage: featuredImage || null,
      author: req.user._id,
      tags: tags || [],
      category: category || 'General',
      status: status || 'draft',
      featured: featured || false
    });

    await blog.save();
    await blog.populate('author', 'username profile.firstName profile.lastName');

    res.status(201).json({ blog });
  } catch (error) {
    logger.error('Create blog error:', error);
    console.error('Full create blog error:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create blog',
      details: error.message 
    });
  }
});

router.put('/admin/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, featuredImage, tags, category, status, featured } = req.body;

    const blog = await BlogModel.model.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;
    if (tags !== undefined) blog.tags = tags;
    if (category) blog.category = category;
    if (status) blog.status = status;
    if (featured !== undefined) blog.featured = featured;

    blog.updatedAt = new Date();
    await blog.save();
    await blog.populate('author', 'username profile.firstName profile.lastName');

    res.json({ blog });
  } catch (error) {
    logger.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

router.delete('/admin/:id', auth, requireAdmin, async (req, res) => {
  try {
    const blog = await BlogModel.model.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await BlogModel.model.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    logger.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

router.get('/admin/:id', auth, requireAdmin, async (req, res) => {
  try {
    const blog = await BlogModel.model
      .findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    logger.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

router.post('/admin/upload-image', auth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/blog-images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Process and save image
    await sharp(req.file.buffer)
      .resize(1200, 800, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // Return the image URL
    const imageUrl = `/uploads/blog-images/${filename}`;
    res.json({ imageUrl });
  } catch (error) {
    logger.error('Blog image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/admin/generate', auth, requireAdmin, async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Search for current information about the topic
    let searchResults = '';
    if (process.env.SERPER_API_KEY) {
      try {
        const searchResponse = await axios.post('https://google.serper.dev/search', {
          q: `${topic} latest news trends 2024`,
          num: 5
        }, {
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (searchResponse.data.organic) {
          searchResults = searchResponse.data.organic.map(result => 
            `${result.title}: ${result.snippet}`
          ).join('\n');
        }
      } catch (searchError) {
        console.log('Search failed, proceeding without web data:', searchError.message);
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `Write a comprehensive blog post about "${topic}" for Huntr AI, an AI-powered trading signal platform.

${searchResults ? `CURRENT WEB INFORMATION:\n${searchResults}\n\n` : ''}Context about Huntr AI:
- AI-powered trading signal platform that analyzes chart images
- Provides BUY/SELL/HOLD signals with entry points, take profits, and stop losses
- Upload trading charts and get instant AI analysis
- Supports multiple markets: stocks, forex, crypto, commodities
- Analysis history tracking and performance metrics
- User profiles with customizable trading preferences
- Multiple chart analysis for portfolio insights
- Educational content and market insights through blog system

Write a professional blog post with:
1. An engaging title on the first line
2. A blank line, then "EXCERPT:" followed by a compelling 2-3 sentence excerpt
3. A blank line, then "CONTENT:" followed by well-structured content (800-1200 words)
4. Content relevant to trading, AI, or fintech
5. Natural mentions of Huntr AI where appropriate
6. Actionable insights for traders
7. Current information from web search results when available

Use markdown formatting in content:
- ## for section headers
- ### for subsections
- * for bullet points
- **bold** for emphasis
- Write in paragraphs with proper spacing

Format:
Title Here

EXCERPT:
Excerpt text here

CONTENT:
Well-structured content with proper markdown formatting...`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse text response
    const lines = response.split('\n');
    const title = lines[0].trim();
    
    const excerptIndex = lines.findIndex(line => line.startsWith('EXCERPT:'));
    const contentIndex = lines.findIndex(line => line.startsWith('CONTENT:'));
    
    let excerpt = '';
    let content = '';
    
    if (excerptIndex !== -1) {
      excerpt = lines[excerptIndex].replace('EXCERPT:', '').trim();
    }
    
    if (contentIndex !== -1) {
      content = lines.slice(contentIndex + 1).join('\n').trim();
    }
    
    const blogData = {
      title: title || topic,
      excerpt: excerpt || `AI-generated content about ${topic}`,
      content: content || response
    };
    
    res.json(blogData);
  } catch (error) {
    logger.error('Generate blog error:', error);
    console.error('Full error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to generate blog content',
      details: error.message 
    });
  }
});

module.exports = router;