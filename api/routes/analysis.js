const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const UserModel = require('../models/User');
const TrainingDataModel = require('../models/TrainingData');
const geminiService = require('../services/gemini');
const { auth, rateLimitByUser } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});

const checkAgreement = (req, res, next) => {
  if (!req.user.settings.analysisAgreementAccepted) {
    return res.status(403).json({ 
      error: 'You must accept the analysis agreement before performing chart analysis.',
      requiresAgreement: true
    });
  }
  next();
};

const checkUsageLimit = (req, res, next) => {
  const usageStatus = req.user.checkUsageLimit();
  
  if (!usageStatus.canAnalyze) {
    return res.status(429).json({
      error: 'Usage limit exceeded',
      limits: {
        plan: req.user.subscription.plan,
        dailyLimit: usageStatus.dailyLimit,
        monthlyLimit: usageStatus.monthlyLimit,
        dailyRemaining: usageStatus.dailyRemaining,
        monthlyRemaining: usageStatus.monthlyRemaining,
        resetDate: usageStatus.resetDate
      },
      requiresUpgrade: req.user.subscription.plan === 'free'
    });
  }
  
  // Add usage info to request for response
  req.usageStatus = usageStatus;
  next();
};

router.post('/chart', 
  auth,
  checkAgreement,
  checkUsageLimit,
  rateLimitByUser(20, 60 * 60 * 1000), 
  upload.single('chart'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      let imageBuffer = req.file.buffer;
      let mimeType = req.file.mimetype;

      if (req.file.size > 5 * 1024 * 1024) {
        imageBuffer = await sharp(imageBuffer)
          .resize(2048, 2048, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        mimeType = 'image/jpeg';
      }

      await geminiService.validateImageForAnalysis(imageBuffer, mimeType);

      const imageHash = crypto
        .createHash('sha256')
        .update(imageBuffer)
        .digest('hex');

      const analysisResult = await geminiService.analyzeChartImage(imageBuffer, mimeType, req.user._id);

      const analysisData = {
        timestamp: new Date(),
        imageHash,
        signal: analysisResult.analysis.signal,
        chartAnalysis: {
          ...analysisResult.analysis.chartAnalysis,
          detectedPatterns: [],
          technicalIndicators: []
        },
        reasoning: analysisResult.analysis.reasoning,
        marketContext: analysisResult.analysis.marketContext,
        webSearchResults: analysisResult.analysis.webSearchResults || [],
        geminiResponse: analysisResult.geminiResponse
      };

      const mongoose = require('mongoose');
      const analysisId = new mongoose.Types.ObjectId();
      analysisData._id = analysisId;
      
      req.user.analysisHistory.push(analysisData);
      await req.user.incrementUsage();

      if (req.user.settings.allowDataTraining) {
        try {
          await saveTrainingData({
            imageHash,
            imageMetadata: {
              width: req.file.width || 0,
              height: req.file.height || 0,
              format: mimeType.split('/')[1],
              size: imageBuffer.length
            },
            chartAnalysis: {
              detectedPatterns: [],
              technicalIndicators: [],
              supportLevels: analysisResult.analysis.chartAnalysis.supportLevels || [],
              resistanceLevels: analysisResult.analysis.chartAnalysis.resistanceLevels || [],
              volume: analysisResult.analysis.chartAnalysis.volume,
              trend: analysisResult.analysis.chartAnalysis.trend,
              timeframe: analysisResult.analysis.chartAnalysis.timeframe,
              marketType: analysisResult.analysis.marketContext.marketType,
              symbol: analysisResult.analysis.marketContext.symbol
            },
            aiAnalysis: {
              signal: analysisResult.analysis.signal,
              reasoning: {
                primary: analysisResult.analysis.reasoning.primary,
                secondary: analysisResult.analysis.reasoning.secondary,
                webSearchResults: analysisResult.analysis.webSearchResults || []
              },
              geminiResponse: analysisResult.geminiResponse
            },
            source: {
              userId: req.user._id.toString(),
              userOptedIn: true,
              sessionId: req.sessionID || crypto.randomUUID(),
              ipHash: crypto.createHash('sha256').update(req.ip).digest('hex'),
              userAgent: req.get('User-Agent')
            }
          });
        } catch (trainingError) {
          logger.error('Failed to save training data:', trainingError);
        }
      }

      res.json({
        success: true,
        analysis: {
          id: analysisId.toString(),
          signal: analysisData.signal,
          reasoning: analysisData.reasoning,
          chartAnalysis: analysisData.chartAnalysis,
          marketContext: analysisData.marketContext,
          webSearchResults: analysisData.webSearchResults,
          confidence: analysisData.signal.confidence,
          timestamp: analysisData.timestamp,
          processingTime: analysisResult.geminiResponse.processingTime
        },
        metadata: {
          imageProcessed: true,
          modelVersion: analysisResult.geminiResponse.modelVersion,
          webSearchPerformed: analysisData.webSearchResults.length > 0
        },
        usage: {
          plan: req.user.subscription.plan,
          dailyRemaining: req.usageStatus.dailyRemaining - 1, // Subtract 1 since we just used one
          monthlyRemaining: req.usageStatus.monthlyRemaining - 1,
          dailyLimit: req.usageStatus.dailyLimit,
          monthlyLimit: req.usageStatus.monthlyLimit,
          resetDate: req.usageStatus.resetDate
        }
      });

    } catch (error) {
      logger.error('Chart analysis error:', error);

      if (error.message.includes('rate limit') || error.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please wait before analyzing another chart.',
          retryAfter: 60
        });
      }

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          error: error.message
        });
      }

      res.status(400).json({
        error: 'Analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

router.post('/feedback/:analysisId', auth, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { rating, comments, actualOutcome, priceChange } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    logger.log('Looking for analysis ID:', analysisId);
    logger.log('User analysis history IDs:', req.user.analysisHistory.map(a => a._id?.toString()));
    
    const analysis = req.user.analysisHistory.find(a => a._id?.toString() === analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (!analysis.feedback) {
      analysis.feedback = {};
    }

    if (rating) analysis.feedback.rating = rating;
    if (comments) analysis.feedback.comments = comments;
    if (actualOutcome) analysis.feedback.actualOutcome = actualOutcome;
    if (priceChange !== undefined) analysis.feedback.priceChange = priceChange;

    await req.user.save();

    // Update AI learning from feedback
    await geminiService.updateLearningFromFeedback(analysisId, {
      rating,
      comments,
      actualOutcome,
      priceChange,
      userId: req.user._id
    });

    if (req.user.settings.allowDataTraining && analysis.imageHash) {
      try {
        const trainingData = await TrainingDataModel.model.findOne({ 
          imageHash: analysis.imageHash 
        });

        if (trainingData) {
          await trainingData.addFeedback({
            userRating: rating,
            userComments: comments
          });

          if (actualOutcome) {
            await trainingData.updatePerformance({
              actualOutcome,
              priceChange24h: priceChange,
              followUpDate: new Date()
            });
          }
        }
      } catch (trainingError) {
        logger.error('Failed to update training data feedback:', trainingError);
      }
    }

    res.json({
      message: 'Feedback submitted successfully',
      feedback: analysis.feedback
    });

  } catch (error) {
    logger.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'timestamp', 
      sortOrder = 'desc',
      signal,
      dateFrom,
      dateTo 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);

    let analyses = req.user.analysisHistory;

    if (signal && ['BUY', 'SELL', 'HOLD'].includes(signal)) {
      analyses = analyses.filter(a => a.signal.action === signal);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      analyses = analyses.filter(a => new Date(a.timestamp) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      analyses = analyses.filter(a => new Date(a.timestamp) <= toDate);
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    analyses.sort((a, b) => {
      const aValue = a[sortBy] || a.timestamp;
      const bValue = b[sortBy] || b.timestamp;
      
      if (sortBy === 'timestamp') {
        return sortDirection * (new Date(bValue) - new Date(aValue));
      }
      
      return sortDirection * (bValue - aValue);
    });

    const total = analyses.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedAnalyses = analyses.slice(startIndex, startIndex + limitNum);

    res.json({
      analyses: paginatedAnalyses.map(analysis => ({
        id: analysis._id || analysis.id,
        timestamp: analysis.timestamp,
        signal: analysis.signal,
        marketContext: analysis.marketContext,
        confidence: analysis.signal.confidence,
        feedback: analysis.feedback
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCount: total,
        hasNext: startIndex + limitNum < total,
        hasPrev: pageNum > 1
      },
      filters: {
        signal,
        dateFrom,
        dateTo
      }
    });

  } catch (error) {
    logger.error('Analysis history error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

router.get('/usage', auth, async (req, res) => {
  try {
    const usageStatus = req.user.checkUsageLimit();
    
    res.json({
      usage: {
        plan: req.user.subscription.plan,
        dailyRemaining: usageStatus.dailyRemaining,
        monthlyRemaining: usageStatus.monthlyRemaining,
        dailyLimit: usageStatus.dailyLimit,
        monthlyLimit: usageStatus.monthlyLimit,
        dailyUsed: usageStatus.dailyLimit - usageStatus.dailyRemaining,
        monthlyUsed: usageStatus.monthlyLimit - usageStatus.monthlyRemaining,
        resetDate: usageStatus.resetDate,
        canAnalyze: usageStatus.canAnalyze
      },
      subscription: {
        plan: req.user.subscription.plan,
        startDate: req.user.subscription.startDate,
        endDate: req.user.subscription.endDate,
        activatedAt: req.user.subscription.activatedAt
      }
    });
  } catch (error) {
    logger.error('Usage status error:', error);
    res.status(500).json({ error: 'Failed to get usage status' });
  }
});

router.get('/statistics', auth, async (req, res) => {
  try {
    const analyses = req.user.analysisHistory;
    
    if (analyses.length === 0) {
      return res.json({
        statistics: {
          totalAnalyses: 0,
          signalDistribution: { BUY: 0, SELL: 0, HOLD: 0 },
          averageConfidence: 0,
          successRate: 0,
          recentActivity: []
        }
      });
    }

    const signalCounts = analyses.reduce((acc, analysis) => {
      acc[analysis.signal.action] = (acc[analysis.signal.action] || 0) + 1;
      return acc;
    }, { BUY: 0, SELL: 0, HOLD: 0 });

    const avgConfidence = analyses.reduce((sum, analysis) => {
      return sum + (analysis.signal.confidence || 0);
    }, 0) / analyses.length;

    const feedbackAnalyses = analyses.filter(a => a.feedback?.rating);
    const avgRating = feedbackAnalyses.length > 0
      ? feedbackAnalyses.reduce((sum, a) => sum + a.feedback.rating, 0) / feedbackAnalyses.length
      : 0;

    const recentAnalyses = analyses
      .slice(-10)
      .reverse()
      .map(analysis => ({
        id: analysis._id,
        timestamp: analysis.timestamp,
        action: analysis.signal.action,
        confidence: analysis.signal.confidence,
        symbol: analysis.marketContext?.symbol
      }));

    res.json({
      statistics: {
        totalAnalyses: analyses.length,
        signalDistribution: signalCounts,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        averageRating: Math.round(avgRating * 100) / 100,
        totalFeedbacks: feedbackAnalyses.length,
        recentActivity: recentAnalyses
      }
    });

  } catch (error) {
    logger.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to generate statistics' });
  }
});

router.delete('/analysis/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const analysis = req.user.analysisHistory.find(a => a._id?.toString() === id);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    req.user.analysisHistory = req.user.analysisHistory.filter(a => a._id?.toString() !== id);
    await req.user.save();

    res.json({ message: 'Analysis deleted successfully' });

  } catch (error) {
    logger.error('Analysis deletion error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

router.post('/charts/multiple', 
  auth, 
  rateLimitByUser(10, 60 * 60 * 1000), 
  upload.array('charts', 5), 
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      if (req.files.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 images allowed' });
      }

      const processedImages = [];
      const imageHashes = [];

      for (const file of req.files) {
        let imageBuffer = file.buffer;
        let mimeType = file.mimetype;

        if (file.size > 5 * 1024 * 1024) {
          imageBuffer = await sharp(imageBuffer)
            .resize(2048, 2048, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();
          mimeType = 'image/jpeg';
        }

        await geminiService.validateImageForAnalysis(imageBuffer, mimeType);

        const imageHash = crypto
          .createHash('sha256')
          .update(imageBuffer)
          .digest('hex');

        processedImages.push({ buffer: imageBuffer, mimeType, originalName: file.originalname });
        imageHashes.push(imageHash);
      }

      const analysisResult = await geminiService.analyzeMultipleChartImages(processedImages, req.user._id);

      // Sanitize analysis data to prevent MongoDB validation errors
      const sanitizeArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => typeof item === 'object' && item !== null);
      };

      const analysisData = {
        timestamp: new Date(),
        imageHashes,
        imageCount: processedImages.length,
        signal: analysisResult.analysis.signal,
        chartAnalysis: {
          ...analysisResult.analysis.chartAnalysis,
          detectedPatterns: [],
          technicalIndicators: []
        },
        reasoning: analysisResult.analysis.reasoning,
        marketContext: analysisResult.analysis.marketContext,
        webSearchResults: analysisResult.analysis.webSearchResults || [],
        geminiResponse: analysisResult.geminiResponse
      };

      const mongoose = require('mongoose');
      const analysisId = new mongoose.Types.ObjectId();
      analysisData._id = analysisId;
      
      req.user.analysisHistory.push(analysisData);
      await req.user.incrementUsage();

      res.json({
        success: true,
        analysis: {
          id: analysisId.toString(),
          signal: analysisData.signal,
          reasoning: analysisData.reasoning,
          chartAnalysis: analysisData.chartAnalysis,
          marketContext: analysisData.marketContext,
          webSearchResults: analysisData.webSearchResults,
          confidence: analysisData.signal.confidence,
          timestamp: analysisData.timestamp,
          imageCount: analysisData.imageCount,
          processingTime: analysisResult.geminiResponse.processingTime
        },
        metadata: {
          imageProcessed: true,
          modelVersion: analysisResult.geminiResponse.modelVersion,
          webSearchPerformed: analysisData.webSearchResults.length > 0,
          multiImageAnalysis: true
        }
      });

    } catch (error) {
      logger.error('Multi-chart analysis error:', error);

      if (error.message.includes('rate limit') || error.status === 429) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please wait before analyzing more charts.',
          retryAfter: 60
        });
      }

      if (error.message.includes('validation failed')) {
        return res.status(400).json({
          error: error.message
        });
      }

      res.status(500).json({
        error: 'Multi-chart analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

router.post('/chat/:analysisId', auth, async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const analysis = req.user.analysisHistory.id(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const aiMessage = await geminiService.chatWithAnalysis(analysisId, message, req.user._id);

    res.json({ 
      message: aiMessage,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

async function saveTrainingData(data) {
  try {
    const existingData = await TrainingDataModel.model.findOne({ 
      imageHash: data.imageHash 
    });

    if (existingData) {
      logger.log('Training data already exists for this image');
      return existingData;
    }

    const trainingData = new TrainingDataModel.model(data);
    await trainingData.save();
    
    return trainingData;

  } catch (error) {
    logger.error('Training data save error:', error);
    throw error;
  }
}

module.exports = router;