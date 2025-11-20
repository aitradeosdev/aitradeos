const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const UserModel = require('../models/User');
const TrainingDataModel = require('../models/TrainingData');
const geminiService = require('../services/geminiv2');
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

const checkUsageLimit = async (req, res, next) => {
  try {
    const usageStatus = await req.user.checkUsageLimit();
    
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
    
    req.usageStatus = usageStatus;
    next();
  } catch (error) {
    next(error);
  }
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
          dailyRemaining: req.usageStatus.dailyRemaining - 1,
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

router.post('/charts/multiple', 
  auth, 
  checkAgreement,
  checkUsageLimit,
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

      res.status(500).json({
        error: 'Multi-chart analysis failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

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
