const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { auth, requireAdmin } = require('../middleware/auth');
const BlogModel = require('../models/Blog');
const CommentModel = require('../models/Comment');
const UserModel = require('../models/User');
const MediaModel = require('../models/Media');
const logger = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BlogModel.model.countDocuments(query);

    res.json({
      blogs: blogs || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    logger.error('Get public blogs error:', error);
    console.error('Blog fetch error details:', error.message, error.stack);
    // Return empty array instead of error to prevent frontend crashes
    res.json({
      blogs: [],
      pagination: {
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10),
        total: 0,
        pages: 0
      }
    });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const blog = await BlogModel.model
      .findOne({ slug: req.params.slug, status: 'published' });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Get comments for this blog
    const comments = await CommentModel.model
      .find({ blogId: blog._id })
      .sort({ createdAt: -1 });

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({ blog, comments });
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
    if (status) {
      blog.status = status;
      if (status === 'published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    if (featured !== undefined) blog.featured = featured;

    blog.updatedAt = new Date();
    await blog.save();

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

    // Delete associated comments first
    await CommentModel.model.deleteMany({ blogId: req.params.id });
    
    // Delete the blog
    await BlogModel.model.findByIdAndDelete(req.params.id);
    
    logger.log(`Blog deleted: ${blog.title} (${req.params.id})`);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    logger.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

router.get('/admin/:id', auth, requireAdmin, async (req, res) => {
  try {
    const blog = await BlogModel.model
      .findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    logger.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

router.post('/admin/upload-media', auth, requireAdmin, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    let processedBuffer = req.file.buffer;
    let mimetype = req.file.mimetype;

    if (!isVideo) {
      processedBuffer = await sharp(req.file.buffer)
        .resize(1200, 800, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();
      mimetype = 'image/jpeg';
    }

    const filename = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}${isVideo ? '.mp4' : '.jpg'}`;
    const base64Data = processedBuffer.toString('base64');

    const media = new MediaModel.model({
      filename,
      mimetype,
      data: base64Data,
      size: processedBuffer.length,
      type: 'blog-image',
      uploadedBy: req.user._id
    });

    await media.save();
    const mediaUrl = `/api/media/${media._id}`;
    
    res.json({ mediaUrl, type: isVideo ? 'video' : 'image' });
  } catch (error) {
    logger.error('Blog media upload error:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

router.post('/admin/generate', auth, requireAdmin, async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return a simple fallback response instead of error
      return res.json({
        title: `${topic} - AI Trading Insights`,
        excerpt: `Discover how AI is revolutionizing ${topic} in modern trading. Learn about the latest trends and strategies that successful traders are using.`,
        content: `<h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px;">Understanding ${topic}</h2><p>This is a <strong style="color: #e74c3c;">sample blog post</strong> about <em style="color: #8e44ad;">${topic}</em>. Configure your <mark style="background-color: #fff3cd; padding: 2px 4px;">Gemini API key</mark> to generate <code style="background-color: #f1f3f4; padding: 2px 6px; border-radius: 4px;">AI-powered content</code>.</p>`
      });
    }

    // Search for current information about the topic
    let searchResults = '';
    if (process.env.SERPER_API_KEY) {
      try {
        const searchResponse = await axios.post('https://google.serper.dev/search', {
          q: `${topic} trading latest news`,
          num: 3
        }, {
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          }
        });
        
        if (searchResponse.data.organic) {
          searchResults = searchResponse.data.organic.slice(0, 2).map(result => 
            `${result.title}: ${result.snippet}`
          ).join('\n');
        }
      } catch (searchError) {
        console.log('Search failed, proceeding without web data:', searchError.message);
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      }
    });

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    const prompt = `Today is ${currentDate}. Write a comprehensive, detailed blog post about "${topic}" for Huntr AI trading platform.

${searchResults ? `Current market info: ${searchResults}\n\n` : ''}Requirements:
- Write 800-1200 words
- Use rich HTML formatting with inline styles
- Include multiple sections with <h2> and <h3> headings
- Use <strong>, <em>, <mark>, <code> tags for emphasis
- Add <ul> or <ol> lists where appropriate
- Include practical examples and actionable insights

Format:
Title (engaging and SEO-friendly)

EXCERPT:
2-3 sentence compelling excerpt

CONTENT:
<h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 24px;">Introduction</h2>
<p>Opening paragraph with <strong style="color: #e74c3c;">key points</strong>...</p>

<h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 24px;">Main Section</h2>
<p>Detailed content with <em style="color: #8e44ad;">emphasis</em> and <mark style="background-color: #fff3cd; padding: 2px 4px;">highlights</mark>...</p>

<h3 style="color: #34495e; margin-top: 16px;">Subsection</h3>
<ul style="line-height: 1.8;">
  <li>Point 1 with details</li>
  <li>Point 2 with examples</li>
</ul>

<h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; margin-top: 24px;">Conclusion</h2>
<p>Summary and call to action...</p>`;

    logger.log('Sending request to Gemini...');
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timeout')), 60000))
    ]);
    
    const response = result.response.text();
    
    logger.log('AI Response received, length:', response.length);
    
    // Parse text response
    const lines = response.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    
    const excerptIndex = lines.findIndex(line => line.toUpperCase().includes('EXCERPT'));
    const contentIndex = lines.findIndex(line => line.toUpperCase().includes('CONTENT'));
    
    if (excerptIndex === -1 || contentIndex === -1) {
      logger.error('Invalid AI response format. Response:', response.substring(0, 500));
      // Return fallback content instead of error
      return res.json({
        title: `${topic} - Trading Insights`,
        excerpt: `Explore ${topic} and discover how it impacts modern trading strategies.`,
        content: response.substring(0, 1000)
      });
    }
    
    let excerpt = lines.slice(excerptIndex + 1, contentIndex).join(' ').replace(/^EXCERPT:?\s*/i, '').trim();
    let content = lines.slice(contentIndex + 1).join('\n').replace(/^CONTENT:?\s*/i, '').trim();
    
    // Fallback if parsing fails
    if (!excerpt) excerpt = lines.slice(1, 3).join(' ').trim();
    if (!content) content = lines.slice(3).join('\n').trim();
    
    logger.log('Parsed successfully - Title:', title.substring(0, 50));
    res.json({ title, excerpt, content });
  } catch (error) {
    logger.error('AI blog generation error:', error);
    console.error('Full AI generation error:', error.message, error.stack);
    
    let errorMessage = 'Failed to generate blog content';
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid or missing Gemini API key';
    } else if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error connecting to AI service';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});

// Serve uploaded images
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Comment routes
router.post('/public/:slug/comments', async (req, res) => {
  try {
    const { name, email, comment, isAnonymous, parentId } = req.body;

    if (!email || !comment) {
      return res.status(400).json({ error: 'Email and comment are required' });
    }

    const blog = await BlogModel.model.findOne({ slug: req.params.slug, status: 'published' });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const newComment = new CommentModel.model({
      blogId: blog._id,
      parentId: parentId || null,
      name: isAnonymous ? 'Anonymous' : (name || 'Anonymous'),
      email,
      comment,
      isAnonymous: isAnonymous !== false
    });

    await newComment.save();
    res.status(201).json({ comment: newComment });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

module.exports = router;