import { redisClient } from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_MESSAGES) || 5; // 5 messages per window

/**
 * Check if user has exceeded rate limit
 * @param {string} userId - User ID
 * @returns {Promise<{allowed: boolean, remaining: number, resetIn: number}>}
 */
export const checkRateLimit = async (userId) => {
  if (!redisClient.isOpen) {
    console.warn('Redis client not connected, skipping rate limit check');
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 };
  }

  try {
    const key = `rate_limit:${userId}`;
    const current = await redisClient.incr(key);

    if (current === 1) {
      // First message in this window
      await redisClient.expire(key, Math.ceil(RATE_LIMIT_WINDOW / 1000));
    }

    const ttl = await redisClient.ttl(key);
    const resetIn = ttl > 0 ? ttl * 1000 : RATE_LIMIT_WINDOW;
    const allowed = current <= RATE_LIMIT_MAX;
    const remaining = Math.max(0, RATE_LIMIT_MAX - current);

    return { allowed, remaining, resetIn };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow message if Redis is down
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 };
  }
};

/**
 * Reset rate limit for user (admin function)
 * @param {string} userId - User ID
 */
export const resetRateLimit = async (userId) => {
  try {
    const key = `rate_limit:${userId}`;
    await redisClient.del(key);
  } catch (error) {
    console.error('Reset rate limit error:', error);
  }
};
