import User from '../models/User.js';
import Message from '../models/Message.js';

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (name && typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid name' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...(name && { name }) },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Delete user account and messages
 * DELETE /api/auth/account
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user messages
    await Message.deleteMany({ userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
