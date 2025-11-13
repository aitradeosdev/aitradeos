const mongoose = require('mongoose');
const { getTrainingConnection } = require('../config/database');

const trainingDataSchema = new mongoose.Schema({
  imageHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  },
  chartAnalysis: {
    detectedPatterns: [{
      type: String,
      confidence: Number,
      coordinates: {
        x1: Number,
        y1: Number,
        x2: Number,
        y2: Number
      }
    }],
    technicalIndicators: [{
      name: String,
      value: Number,
      signal: String
    }],
    timeframe: String,
    marketType: { type: String, enum: ['crypto', 'forex', 'stocks', 'commodities', 'other'] },
    symbol: String
  },
  aiAnalysis: {
    signal: {
      action: { type: String, enum: ['BUY', 'SELL', 'HOLD'], required: true },
      confidence: { type: Number, min: 0, max: 100, required: true },
      entryPoint: Number,
      takeProfit: [Number],
      stopLoss: Number,
      riskReward: Number
    },
    reasoning: {
      primary: String,
      secondary: [String],
      webSearchResults: [{
        query: String,
        source: String,
        relevantInfo: String,
        timestamp: Date
      }]
    },
    geminiResponse: {
      fullResponse: String,
      processingTime: Number,
      modelVersion: String,
      timestamp: { type: Date, default: Date.now }
    }
  },
  marketContext: {
    priceAtAnalysis: Number,
    volume24h: Number,
    marketCap: Number,
    dominance: Number,
    fearGreedIndex: Number,
    newsHeadlines: [String],
    socialSentiment: Number
  },
  performance: {
    actualOutcome: { type: String, enum: ['success', 'failure', 'pending', 'timeout'] },
    priceChange24h: Number,
    priceChange7d: Number,
    maxGain: Number,
    maxLoss: Number,
    hitTakeProfit: Boolean,
    hitStopLoss: Boolean,
    followUpDate: Date
  },
  feedback: {
    userRating: { type: Number, min: 1, max: 5 },
    userComments: String,
    reportedIssues: [String],
    useForTraining: { type: Boolean, default: true }
  },
  source: {
    userId: { type: String, required: true },
    userOptedIn: { type: Boolean, required: true },
    sessionId: String,
    ipHash: String,
    userAgent: String
  },
  tags: [String],
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

trainingDataSchema.index({ 'chartAnalysis.symbol': 1, 'chartAnalysis.marketType': 1 });
trainingDataSchema.index({ 'aiAnalysis.signal.action': 1, 'aiAnalysis.signal.confidence': -1 });
trainingDataSchema.index({ 'performance.actualOutcome': 1 });
trainingDataSchema.index({ 'source.userId': 1 });
trainingDataSchema.index({ 'createdAt': -1 });

trainingDataSchema.methods.updatePerformance = function(performanceData) {
  this.performance = { ...this.performance, ...performanceData };
  this.updatedAt = new Date();
  return this.save();
};

trainingDataSchema.methods.addFeedback = function(feedbackData) {
  this.feedback = { ...this.feedback, ...feedbackData };
  this.updatedAt = new Date();
  return this.save();
};

trainingDataSchema.statics.getSuccessRate = function(filters = {}) {
  return this.aggregate([
    { $match: { ...filters, 'performance.actualOutcome': { $in: ['success', 'failure'] } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ['$performance.actualOutcome', 'success'] }, 1, 0] } }
      }
    },
    {
      $project: {
        successRate: { $multiply: [{ $divide: ['$successful', '$total'] }, 100] },
        total: 1,
        successful: 1
      }
    }
  ]);
};

trainingDataSchema.statics.getPatternPerformance = function() {
  return this.aggregate([
    { $unwind: '$chartAnalysis.detectedPatterns' },
    {
      $group: {
        _id: '$chartAnalysis.detectedPatterns.type',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$chartAnalysis.detectedPatterns.confidence' },
        successCount: {
          $sum: { $cond: [{ $eq: ['$performance.actualOutcome', 'success'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        pattern: '$_id',
        count: 1,
        avgConfidence: { $round: ['$avgConfidence', 2] },
        successRate: { $round: [{ $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }, 2] }
      }
    },
    { $sort: { successRate: -1 } }
  ]);
};

let TrainingData;

module.exports = {
  get model() {
    if (!TrainingData) {
      const connection = getTrainingConnection();
      TrainingData = connection.model('TrainingData', trainingDataSchema);
    }
    return TrainingData;
  }
};