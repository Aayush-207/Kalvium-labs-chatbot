import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { verifyToken } from './middleware/authMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware setup
 */
app.use(cors());
app.use(express.json());

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/chat', verifyToken, chatRoutes);

/**
 * Stats endpoint
 */
app.get('/api/stats', async (req, res) => {
  try {
    res.json({
      server: 'running',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Error handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Start server
 */
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log('✓ Database connected');
      console.log('✓ Redis connected');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
