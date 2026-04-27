import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending',
  },
  matchScore: { type: Number, default: 0 },
  reason: { type: String, default: '' }, // For block/report reason
}, { timestamps: true });

// Prevent duplicate match requests between same users
matchSchema.index({ requester: 1, receiver: 1 }, { unique: true });
matchSchema.index({ status: 1 });
matchSchema.index({ requester: 1, status: 1 });
matchSchema.index({ receiver: 1, status: 1 });

export const Match = mongoose.model('Match', matchSchema);

