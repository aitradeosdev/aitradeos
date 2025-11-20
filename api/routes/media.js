const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { getMediaConnection } = require('../config/database');

router.get('/:id', async (req, res) => {
  try {
    logger.log(`Fetching media with ID: ${req.params.id}`);
    
    // Ensure connection is established
    const connection = getMediaConnection();
    if (connection.readyState !== 1) {
      logger.error('Media database not connected');
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Lazy load MediaModel to ensure connection is ready
    const MediaModel = require('../models/Media');
    const media = await MediaModel.model.findById(req.params.id);
    
    if (!media) {
      logger.error(`Media not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    logger.log(`Media found: ${media.filename}, type: ${media.type}, size: ${media.size}`);
    const buffer = Buffer.from(media.data, 'base64');
    
    // Set CORS headers first
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Content-Type': media.mimetype,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000'
    });
    
    res.send(buffer);
  } catch (error) {
    logger.error('Media fetch error:', error);
    logger.error('Error stack:', error.stack);
    
    // Set CORS headers even on error
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    res.status(500).json({ error: 'Failed to fetch media', details: error.message });
  }
});

// Handle OPTIONS preflight
router.options('/:id', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  res.sendStatus(200);
});

module.exports = router;
