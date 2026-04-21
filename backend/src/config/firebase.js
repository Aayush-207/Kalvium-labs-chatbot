import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const initializeFirebase = () => {
  if (!admin.apps.length) {
    // For development, use a service account key file
    // In production, use environment variables or IAM
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  }
  return admin.auth();
};

export default initializeFirebase;
