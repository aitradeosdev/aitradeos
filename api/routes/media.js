const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

router.get('/:id', async (req, res) => {
  try {
    logger.log(`Fetching media with ID: ${req.params.id}`);
    
    // Lazy load MediaModel to ensure connection is ready
    const MediaModel = require('../models/Media');
    const media = await MediaModel.model.findById(req.params.id);
    
    if (!media) {
      logger.error(`Media not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Media not found' });
    }

    logger.log(`Media found: ${media.filename}, type: ${media.type}, size: ${media.size}`);
    const buffer = Buffer.from(media.data, 'base64');
    
    res.set({
      'Content-Type': media.mimetype,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    });
    
    res.send(buffer);
  } catch (error) {
    logger.error('Media fetch error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch media', details: error.message });
  }
});

module.exports = router;
