import { Queue, Worker } from 'bullmq';
import { redisClient } from '../config/redis.js';
import dotenv from 'dotenv';

dotenv.config();

// Message processing queue
export const messageQueue = new Queue('message-processing', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

/**
 * Add message to processing queue
 * @param {Object} messageData - Message data to process
 * @returns {Promise<Job>}
 */
export const addMessageToQueue = async (messageData) => {
  try {
    const job = await messageQueue.add('process-message', messageData, {
      jobId: `msg-${messageData.userId}-${Date.now()}`,
      priority: 1,
    });

    console.log(`Message job added: ${job.id}`);
    return job;
  } catch (error) {
    console.error('Error adding message to queue:', error);
    throw error;
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  try {
    const counts = await messageQueue.getJobCounts();
    return counts;
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return null;
  }
};

/**
 * Clear queue (admin function)
 */
export const clearQueue = async () => {
  try {
    await messageQueue.drain();
    console.log('Queue cleared');
  } catch (error) {
    console.error('Error clearing queue:', error);
  }
};

export default messageQueue;
