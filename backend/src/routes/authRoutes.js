import express from 'express';
import { getCurrentUser, updateProfile, deleteAccount } from '../controllers/authController.js';
import { verifyFirebaseToken, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Verify token and get/create user
 * POST /api/auth/verify
 */
router.post('/verify', verifyFirebaseToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

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
