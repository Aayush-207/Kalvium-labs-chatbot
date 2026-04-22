import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
  try {
    const connectPromise = redisClient.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
  } catch (error) {
    console.warn('⚠️  Redis connection warning:', error.message);
    console.warn('⚠️  Rate limiting and queue features will not work without Redis');
    console.warn('⚠️  To use Redis, install it or use: docker run -d -p 6379:6379 redis:latest');
    // Don't exit - allow server to start without Redis for development
  }
};

export { redisClient, connectRedis };
