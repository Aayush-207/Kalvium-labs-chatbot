import Message from '../models/Message.js';
import {
  generateBotResponse,
  isValidMessage,
} from '../services/chatbotService.js';
import {
  checkRateLimit,
} from '../services/rateLimiter.js';
import {
  getRandomDelay,
  checkDuplicateMessages,
  trackMessageVelocity,
  isUserInCooldown,
  getCooldownRemaining,
  logMessageAction,
} from '../services/antiBanService.js';
import { addMessageToQueue } from '../services/queueService.js';

/**
 * Send message endpoint
 * POST /api/chat/send
 */
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user._id;

    // Validate message
    if (!isValidMessage(text)) {
      return res.status(400).json({ error: 'Invalid message' });
    }

    logMessageAction(userId, 'send_attempt', { messageLength: text.length });

    // Check if user is in cooldown
    const inCooldown = await isUserInCooldown(userId);
    if (inCooldown) {
      const cooldownRemaining = await getCooldownRemaining(userId);
      logMessageAction(userId, 'blocked_cooldown', { cooldownRemaining });
      return res.status(429).json({
        error: 'Too many messages. Please wait.',
        retryAfter: cooldownRemaining,
      });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      logMessageAction(userId, 'rate_limited', { resetIn: rateLimit.resetIn });
      return res.status(429).json({
        error: 'Too many messages. Please wait.',
        remaining: rateLimit.remaining,
        resetIn: rateLimit.resetIn,
      });
    }

    // Check for duplicate messages
    const dupCheck = await checkDuplicateMessages(userId, text);
    if (dupCheck.isDuplicate) {
      logMessageAction(userId, 'duplicate_detected', { count: dupCheck.duplicateCount });
      return res.status(400).json({
        error: 'Please avoid sending duplicate messages',
      });
    }

    // Save user message
    const userMessage = await Message.create({
      userId,
      sender: 'user',
      text,
    });

    logMessageAction(userId, 'message_saved', { messageId: userMessage._id });

    // Track message velocity for anti-ban
    const velocity = await trackMessageVelocity(userId);

    // Add to processing queue
    const queueJob = await addMessageToQueue({
      messageId: userMessage._id,
      userId: userId.toString(),
      text,
      userMessageId: userMessage._id,
    });

    logMessageAction(userId, 'queued_for_processing', {
      jobId: queueJob.id,
      velocityCount: velocity.messageCount,
    });

    res.status(201).json({
      success: true,
      message: userMessage,
      queueJobId: queueJob.id,
      info: {
        rateLimitRemaining: rateLimit.remaining,
        delayEstimate: `${Math.round(getRandomDelay() / 1000)}s`,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Get chat history
 * GET /api/chat/history
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    // Get all messages for user, sorted by timestamp descending
    const allMessages = await Message.find({ userId });
    const total = allMessages.length;

    // Apply pagination
    const messages = allMessages
      .slice(skip, skip + limit)
      .reverse(); // Reverse to get chronological order

    res.json({
      messages,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

/**
 * Get single message
 * GET /api/chat/message/:messageId
 */
export const getMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message || message.userId !== userId) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
};
