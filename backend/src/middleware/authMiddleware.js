import initializeFirebase from '../config/firebase.js';
import User from '../models/User.js';

/**
 * Middleware to verify Firebase ID token and attach user info
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const idToken = authHeader.substring(7);
    const auth = initializeFirebase();
    const decodedToken = await auth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;

    // Find or create user in database
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        photoURL: decodedToken.picture,
      });
    }

    // Update last activity
    user.lastActivityAt = new Date();
    await user.save();

    // Attach user to request
    req.user = {
      _id: user._id,
      firebaseUid,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Firebase verification error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Optional middleware to check if user exists in request
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
