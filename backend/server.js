import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchNews, aggregateNews } from './controllers/newsController.js';
import { generateTopics, generateCategorizedTopics } from './controllers/topicsController.js';
import { generatePosts } from './controllers/postsController.js';
import { fetchForexRates as fetchAlphaVantageRates, fetchNewsSentiment } from './controllers/alphaVantageController.js';
import { fetchForexNews, fetchForexRates as fetchFinnhubRates } from './controllers/finnhubController.js';
import { searchRealtimeNews, searchNewsByCategory } from './controllers/geminiNewsController.js';
import { detectFXTrends, searchTrendingNews } from './controllers/trendsController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// News API Routes
app.get('/api/news', fetchNews);
app.get('/api/news/aggregated', aggregateNews);
app.get('/api/news/sentiment', fetchNewsSentiment);
app.get('/api/news/realtime', searchRealtimeNews);
app.get('/api/news/realtime/category/:category', searchNewsByCategory);
app.get('/api/news/trending', searchTrendingNews);

// Trends API Routes
app.get('/api/trends/fx', detectFXTrends);

// Forex Rates Routes
app.get('/api/forex-rates', fetchFinnhubRates);
app.get('/api/forex-rates/alphavantage', fetchAlphaVantageRates);

// Topic and Post Generation Routes
app.post('/api/topics', generateTopics);
app.post('/api/topics/categorized', generateCategorizedTopics);
app.post('/api/posts', generatePosts);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
