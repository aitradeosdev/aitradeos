const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notifications');
const deviceRoutes = require('./routes/devices');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Vercel deployment
app.set('trust proxy', 1);

connectDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  process.env.FRONTEND_URL,
  'https://huntr-ai.netlify.app',
  'https://aitradeosdev.github.io',
  '*'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Huntr AI API is running' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const UserModel = require('./models/User');
    const count = await UserModel.model.countDocuments();
    res.json({ 
      status: 'OK', 
      userCount: count,
      mongoUri: process.env.MONGODB_URI_USERS ? 'Set' : 'Not set'
    });
  } catch (error) {
    logger.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message,
      mongoUri: process.env.MONGODB_URI_USERS ? 'Set' : 'Not set'
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (allow in all environments for direct node execution)
app.listen(PORT, () => {
  logger.log(`Huntr AI API running on port ${PORT}`);
});

module.exports = app;