import express from 'express';
import { sendMessage, getChatHistory, getMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth);

/**
 * Send message
 * POST /api/chat/send
 */
router.post('/send', sendMessage);

/**
 * Get chat history
 * GET /api/chat/history
 */
router.get('/history', getChatHistory);

/**
 * Get single message
 * GET /api/chat/message/:messageId
 */
router.get('/message/:messageId', getMessage);

export default router;
