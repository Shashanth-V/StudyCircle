import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationOtp: { type: String },
  verificationOtpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String, sparse: true },

  profilePhoto: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  subjects: { type: [subjectSchema], default: [] },
  availability: { type: [availabilitySchema], default: [] },
  studyGoal: { type: String, default: '', maxlength: 300 },
  studyStyle: { type: String, enum: ['solo-focus', 'collaborative', 'mixed'], default: 'mixed' },
  city: { type: String, default: '', maxlength: 100 },

  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastStudyDate: { type: Date },
  totalStudyMinutes: { type: Number, default: 0 },
  sessionsAttended: { type: Number, default: 0 },

  isOnline: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now },
  socketId: { type: String },

  notificationPrefs: {
    emailMatchRequest: { type: Boolean, default: true },
    emailMessage: { type: Boolean, default: true },
    emailSessionInvite: { type: Boolean, default: true },
    inAppMatchRequest: { type: Boolean, default: true },
    inAppMessage: { type: Boolean, default: true },
    inAppSessionInvite: { type: Boolean, default: true },
  },

  privacySettings: {
    showOnlineStatus: { type: Boolean, default: true },
    showLastSeen: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'matched-only'], default: 'public' },
  },

  isDeactivated: { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ isOnline: 1 });
userSchema.index({ xp: -1 });

/**
 * Check if profile is fully completed
 * @returns {boolean}
 */
userSchema.methods.isProfileComplete = function () {
  return !!(
    this.name &&
    this.subjects.length > 0 &&
    this.availability.length > 0 &&
    this.studyStyle
  );
};

/**
 * Calculate profile completion percentage (0-100)
 * @returns {number}
 */
userSchema.methods.getProfileCompletion = function () {
  let score = 0;
  if (this.name) score += 20;
  if (this.profilePhoto) score += 10;
  if (this.bio) score += 10;
  if (this.subjects.length > 0) score += 20;
  if (this.availability.length > 0) score += 20;
  if (this.studyGoal) score += 10;
  if (this.studyStyle) score += 10;
  return Math.min(100, score);
};

export const User = mongoose.model('User', userSchema);

