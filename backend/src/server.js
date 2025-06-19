const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { connectDB } = require('./config/database');
const cacheService = require('./config/redis');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Allow embedding for CORS
}));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins for now (you can restrict this later)
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://vercel.app',
      /\.vercel\.app$/,
      /\.railway\.app$/,
      process.env.FRONTEND_URL
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400 // 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'none'}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'learning-platform-backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    cors: 'enabled',
    database: 'mock (in-memory)',
    cache: 'mock (in-memory)'
  };
  
  console.log('Health check requested:', healthData);
  res.status(200).json(healthData);
});

// Root endpoint with detailed info
app.get('/', (req, res) => {
  const info = {
    message: 'Learning Platform Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/health',
      recommendations: '/api/recommendations',
      'user-recommendations': '/api/recommendations/user/:userId',
      'recommendation-analytics': '/api/recommendations/user/:userId/analytics'
    },
    cors: {
      enabled: true,
      origin: req.get('Origin') || 'none',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    },
    headers: {
      'user-agent': req.get('User-Agent'),
      'accept': req.get('Accept'),
      'content-type': req.get('Content-Type')
    }
  };
  
  console.log('Root endpoint accessed:', info);
  res.status(200).json(info);
});

// API routes
app.use('/api/recommendations', recommendationRoutes);

// 404 handler
app.use('*', (req, res) => {
  const errorInfo = {
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/recommendations/user/:userId',
      'PATCH /api/recommendations/:id/status',
      'GET /api/recommendations/user/:userId/analytics'
    ]
  };
  
  console.log('404 - Route not found:', errorInfo);
  res.status(404).json(errorInfo);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// Initialize connections and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');
    
    // Connect to cache
    await cacheService.connect();
    logger.info('Cache service connected successfully');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 API root: http://localhost:${PORT}/`);
      logger.info(`📡 CORS enabled for all origins`);
      console.log('\n=== SERVER STARTED SUCCESSFULLY ===');
      console.log(`Backend URL: http://localhost:${PORT}`);
      console.log(`Railway URL: https://personalized-video-learning-path-production.up.railway.app`);
      console.log('=====================================\n');
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  try {
    await cacheService.quit();
    logger.info('Cache connection closed');
    
    const { getDB } = require('./config/database');
    const db = getDB();
    if (db && db.close) {
      await db.close();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.warn('Error during shutdown:', error.message);
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

module.exports = app;