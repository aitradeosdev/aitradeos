const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
const analysisV2Routes = require('./routes/analysisv2');

const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notifications');
const deviceRoutes = require('./routes/devices');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const blogRoutes = require('./routes/blog');
const mediaRoutes = require('./routes/media');
const popupMessageRoutes = require('./routes/popupMessages');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

let dbConnected = false;

// Initialize database connection
connectDB().then(() => {
  dbConnected = true;
  logger.log('✅ All databases connected and ready');
}).catch(err => {
  logger.error('❌ Database initialization failed:', err);
});

// Middleware to ensure DB is connected
app.use((req, res, next) => {
  if (!dbConnected && !req.path.includes('/health')) {
    return res.status(503).json({ error: 'Service initializing, please try again' });
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 500 : 5000,
  message: 'Too many requests from this IP'
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'https://huntr-ai.netlify.app',
  'https://aitradeos.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Special CORS handling for media endpoint
app.use('/api/media', cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Huntr AI API is running',
    dbConnected: dbConnected 
  });
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
app.use('/api/analysisv2', analysisV2Routes);

app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/popup-messages', popupMessageRoutes);
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

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