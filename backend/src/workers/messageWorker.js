import { Worker } from 'bullmq';
import { redisClient, connectRedis } from '../config/redis.js';
import connectDB from '../config/db.js';
import Message from '../models/Message.js';
import { generateBotResponse } from '../services/chatbotService.js';
import { getRandomDelay, logMessageAction } from '../services/antiBanService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize database and Redis
 */
const initialize = async () => {
  try {
    await connectDB();
    await connectRedis();
    console.log('Worker initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

/**
 * Process message job from queue
 * Simulates natural delay and generates bot response
 */
const messageWorker = new Worker(
  'message-processing',
  async (job) => {
    try {
      const { userId, text, userMessageId } = job.data;

      console.log(`Processing job ${job.id} for user ${userId}`);
      logMessageAction(userId, 'processing_started', { jobId: job.id });

      // Get random delay (2-5 seconds) to simulate natural behavior
      const delay = getRandomDelay();
      console.log(`Job ${job.id}: waiting ${Math.round(delay / 1000)}s before responding`);

      // Report progress
      job.updateProgress(20);

      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      job.updateProgress(50);

      // Generate bot response
      const botResponse = generateBotResponse(text);
      console.log(`Job ${job.id}: Generated response: ${botResponse}`);

      job.updateProgress(75);

      // Save bot message
      const botMessage = await Message.create({
        userId,
        sender: 'bot',
        text: botResponse,
      });

      console.log(`Job ${job.id}: Bot message saved: ${botMessage._id}`);
      logMessageAction(userId, 'bot_response_sent', {
        jobId: job.id,
        messageId: botMessage._id,
        delay: Math.round(delay / 1000),
      });

      job.updateProgress(100);

      return {
        success: true,
        botMessageId: botMessage._id,
        response: botResponse,
        processingTime: Math.round(delay / 1000),
      };
    } catch (error) {
      console.error(`Job ${job.id} error:`, error);
      logMessageAction(job.data.userId, 'processing_error', {
        jobId: job.id,
        error: error.message,
      });
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 5, // Process up to 5 messages in parallel
  }
);

/**
 * Worker event handlers
 */
messageWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

messageWorker.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error.message);
});

messageWorker.on('error', (error) => {
  console.error('Worker error:', error);
});

/**
 * Start worker
 */
const start = async () => {
  await initialize();
  console.log('Message worker started and listening for jobs...');
};

start().catch((error) => {
  console.error('Failed to start worker:', error);
  process.exit(1);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await messageWorker.close();
  await redisClient.disconnect();
  process.exit(0);
});
