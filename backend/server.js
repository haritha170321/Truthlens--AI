require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./src/config/db');
const { seedDatabase } = require('./src/utils/seedData');
const errorHandler = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const savedRoutes = require('./src/routes/savedRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global API rate limiter
app.use('/api/', apiLimiter);

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'TruthLens AI Backend API Gateway',
    platform: 'TruthLens AI – Explainable Misinformation Analysis and Verification Platform',
    sdgs: ['SDG 16 – Peace, Justice and Strong Institutions', 'SDG 4 – Quality Education'],
    version: '1.0.0',
    timestamp: new Date(),
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server & Connect to DB
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`TruthLens AI Verification Platform API running on port ${PORT}`);
    console.log(`Backend Health: http://localhost:${PORT}/api/health`);
    console.log(`SDG 16 & SDG 4 Intelligence Engine Initialized`);
    console.log(`====================================================`);
  });
};

startServer();
