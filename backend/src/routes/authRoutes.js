import express from 'express';
import { login, register, getCurrentUser, updateProfile, deleteAccount } from '../controllers/authController.js';
import { verifyToken, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * User registration
 * POST /api/auth/register
 */
router.post('/register', register);

/**
 * User login
 * POST /api/auth/login
 */
router.post('/login', login);

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * Update user profile
 * PUT /api/auth/profile
 */
router.put('/profile', requireAuth, updateProfile);

/**
 * Delete account
 * DELETE /api/auth/account
 */
router.delete('/account', requireAuth, deleteAccount);

export default router;
