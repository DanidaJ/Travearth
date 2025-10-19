const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const cronJobs = require('./services/cronJobs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/carbon', require('./routes/carbonRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/crisis', require('./routes/crisisRoutes'));
app.use('/api/souvenir', require('./routes/souvenirRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/ecoplan', require('./routes/ecoplan')); // AI-powered trip planning
app.use('/api/flights', require('./routes/flights')); // Amadeus flight data

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start cron jobs
cronJobs.startCrisisMonitoring();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Travearth Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
