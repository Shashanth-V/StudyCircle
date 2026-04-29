import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  googleId: { type: String },
  profilePhoto: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  subjects: [{
    name: String,
    level: String
  }],
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  studyGoal: { type: String, default: '' },
  studyStyle: { type: String, enum: ['solo-focus', 'collaborative', 'mixed'], default: 'mixed' },
  city: { type: String, default: '' },
  onboardingComplete: { type: Boolean, default: false },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  weeklyXP: { type: Number, default: 0 },
  refreshTokens: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationOTP: String,
  emailVerificationExpires: Date,
  notificationPrefs: {
    email: {
      newMatch: { type: Boolean, default: true },
      matchAccepted: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      sessionInvite: { type: Boolean, default: true }
    },
    inApp: {
      newMatch: { type: Boolean, default: true },
      matchAccepted: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true },
      sessionInvite: { type: Boolean, default: true }
    }
  },
  privacySettings: {
    showOnlineStatus: { type: Boolean, default: true },
    showLastSeen: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'matched-only'], default: 'public' }
  }
}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.generateEmailOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = crypto.createHash('sha256').update(otp).digest('hex');
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  return otp;
};

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.emailVerificationOTP;
    delete ret.emailVerificationExpires;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
