import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: () => false, // Don't retry after connection fails
  },
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
  if (!isRedisConnected) {
    // Only log once, don't spam
    isRedisConnected = false;
  }
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✓ Redis connected');
});

const connectRedis = async () => {
  try {
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    isRedisConnected = true;
  } catch (error) {
    isRedisConnected = false;
    console.warn('⚠️  Redis unavailable - rate limiting and queue features disabled');
    console.warn('⚠️  To enable Redis: docker run -d -p 6379:6379 redis:latest');
  }
};

export { redisClient, connectRedis };
