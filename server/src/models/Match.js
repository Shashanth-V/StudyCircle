import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'blocked'], default: 'pending' },
  matchScore: { type: Number, default: 0 },
  breakdown: {
    subjects: { type: Number, default: 0 },
    levels: { type: Number, default: 0 },
    availability: { type: Number, default: 0 },
    style: { type: Number, default: 0 },
    location: { type: Number, default: 0 }
  },
  mutualSubjects: [{ type: String }]
}, { timestamps: true });

matchSchema.index({ requester: 1, receiver: 1 }, { unique: true });

export const Match = mongoose.model('Match', matchSchema);
