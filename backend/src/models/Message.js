import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    messageHash: String, // For duplicate detection
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'sent',
    },
  },
  { timestamps: true }
);

// Index for efficient chat history retrieval
messageSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);
