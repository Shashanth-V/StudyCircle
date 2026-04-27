import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  badgeType: {
    type: String,
    enum: [
      'first_match',
      'study_buddy',
      'marathon',
      'consistent_learner',
      'social_butterfly',
      'night_owl',
      'early_bird',
      'weekend_warrior',
      'subject_expert',
      'streak_master',
    ],
    required: true,
  },
  earnedAt: { type: Date, default: Date.now },
}, { timestamps: true });

badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

export const Badge = mongoose.model('Badge', badgeSchema);

