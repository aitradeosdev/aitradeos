const mongoose = require('mongoose');
const logger = require('../utils/logger');

let userConnection = null;
let trainingConnection = null;
let mediaConnection = null;

const connectDB = async () => {
  try {
    userConnection = await mongoose.createConnection(process.env.MONGODB_URI_USERS, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    
    trainingConnection = await mongoose.createConnection(process.env.MONGODB_URI_TRAINING, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    mediaConnection = await mongoose.createConnection(process.env.MONGODB_URI_MEDIA, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    logger.log('✅ Connected to MongoDB - Users Database');
    logger.log('✅ Connected to MongoDB - Training Database');
    logger.log('✅ Connected to MongoDB - Media Database');

    userConnection.on('error', (err) => {
      logger.error('❌ Users Database connection error:', err);
    });

    trainingConnection.on('error', (err) => {
      logger.error('❌ Training Database connection error:', err);
    });

    userConnection.on('disconnected', () => {
      logger.log('🔌 Users Database disconnected');
    });

    trainingConnection.on('disconnected', () => {
      logger.log('🔌 Training Database disconnected');
    });

    mediaConnection.on('error', (err) => {
      logger.error('❌ Media Database connection error:', err);
    });

    mediaConnection.on('disconnected', () => {
      logger.log('🔌 Media Database disconnected');
    });

  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const getUserConnection = () => {
  if (!userConnection) {
    throw new Error('User database connection not established');
  }
  return userConnection;
};

const getTrainingConnection = () => {
  if (!trainingConnection) {
    throw new Error('Training database connection not established');
  }
  return trainingConnection;
};

const getMediaConnection = () => {
  if (!mediaConnection) {
    throw new Error('Media database connection not established');
  }
  return mediaConnection;
};

module.exports = {
  connectDB,
  getUserConnection,
  getTrainingConnection,
  getMediaConnection
};