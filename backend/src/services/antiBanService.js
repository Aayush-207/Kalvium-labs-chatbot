import { redisClient } from '../config/redis.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ANTI_BAN_DELAY_MIN = parseInt(process.env.ANTI_BAN_DELAY_MIN) || 2000;
const ANTI_BAN_DELAY_MAX = parseInt(process.env.ANTI_BAN_DELAY_MAX) || 5000;
const DUPLICATE_THRESHOLD = parseInt(process.env.ANTI_BAN_DUPLICATE_THRESHOLD) || 3;
const COOLDOWN_DURATION = parseInt(process.env.ANTI_BAN_COOLDOWN_DURATION) || 30000;
const MESSAGE_THRESHOLD = parseInt(process.env.ANTI_BAN_MESSAGE_THRESHOLD) || 10;

/**
 * Calculate hash of message for duplicate detection
 */
const hashMessage = (message) => {
  return crypto.createHash('md5').update(message.toLowerCase()).digest('hex');
};

/**
 * Get random delay to simulate natural behavior (prevents ban)
 */
export const getRandomDelay = () => {
  return Math.random() * (ANTI_BAN_DELAY_MAX - ANTI_BAN_DELAY_MIN) + ANTI_BAN_DELAY_MIN;
};

/**
 * Check for duplicate messages (spam detection)
 */
export const checkDuplicateMessages = async (userId, messageText) => {
  if (!redisClient.isOpen) {
    return { isDuplicate: false, duplicateCount: 0 };
  }

  try {
    const messageHash = hashMessage(messageText);
    const key = `duplicate_check:${userId}:${messageHash}`;
    const count = await redisClient.incr(key);

    if (count === 1) {
      // Expire after 5 minutes
      await redisClient.expire(key, 300);
    }

    const isDuplicate = count >= DUPLICATE_THRESHOLD;

    return { isDuplicate, duplicateCount: count };
  } catch (error) {
    console.error('Duplicate check error:', error);
    return { isDuplicate: false, duplicateCount: 0 };
  }
};

/**
 * Track rapid message sending for anti-ban cooldown
 */
export const trackMessageVelocity = async (userId) => {
  if (!redisClient.isOpen) {
    return { shouldCooldown: false };
  }

  try {
    const key = `message_velocity:${userId}`;
    const count = await redisClient.incr(key);

    if (count === 1) {
      // Track for 1 minute
      await redisClient.expire(key, 60);
    }

    const shouldCooldown = count >= MESSAGE_THRESHOLD;

    if (shouldCooldown) {
      // Set cooldown flag
      const cooldownKey = `cooldown:${userId}`;
      await redisClient.setEx(cooldownKey, COOLDOWN_DURATION / 1000, '1');
    }

    return { shouldCooldown, messageCount: count };
  } catch (error) {
    console.error('Message velocity tracking error:', error);
    return { shouldCooldown: false, messageCount: 0 };
  }
};

/**
 * Check if user is in cooldown
 */
export const isUserInCooldown = async (userId) => {
  if (!redisClient.isOpen) {
    return false;
  }

  try {
    const cooldownKey = `cooldown:${userId}`;
    const inCooldown = await redisClient.exists(cooldownKey);
    return inCooldown === 1;
  } catch (error) {
    console.error('Cooldown check error:', error);
    return false;
  }
};

/**
 * Get cooldown remaining time
 */
export const getCooldownRemaining = async (userId) => {
  if (!redisClient.isOpen) {
    return 0;
  }

  try {
    const cooldownKey = `cooldown:${userId}`;
    const ttl = await redisClient.ttl(cooldownKey);
    return ttl > 0 ? ttl * 1000 : 0;
  } catch (error) {
    console.error('Get cooldown remaining error:', error);
    return 0;
  }
};

/**
 * Log message action for monitoring
 */
export const logMessageAction = (userId, action, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] User ${userId}: ${action}`, details);

  // In production, send to logging service (e.g., ELK, Splunk)
};
