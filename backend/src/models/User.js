import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    photoURL: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
