import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Match } from '../models/Match.js';
import { Session } from '../models/Session.js';
import { Badge } from '../models/Badge.js';
import { calculateMatchScore } from '../utils/matchScore.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * Get current user profile
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({
      ...user.toObject(),
      isProfileComplete: user.isProfileComplete(),
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update current user profile
 */
export const updateMe = async (req, res, next) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({
      ...user.toObject(),
      isProfileComplete: user.isProfileComplete(),
      profileCompletion: user.getProfileCompletion(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload profile photo to Cloudinary
 */
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'studycircle/profiles');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: result.url },
      { new: true }
    ).select('-passwordHash');

    res.json({ profilePhoto: user.profilePhoto });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user by ID (public profile)
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash -email -notificationPrefs');
    if (!user || user.isDeactivated) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check privacy: if matched-only, verify current user is matched
    if (user.privacySettings?.profileVisibility === 'matched-only') {
      const isMatched = await Match.exists({
        $or: [
          { requester: req.user._id, receiver: id, status: 'accepted' },
          { requester: id, receiver: req.user._id, status: 'accepted' },
        ],
      });
      if (!isMatched && req.user._id.toString() !== id) {
        return res.status(403).json({ message: 'Profile is private' });
      }
    }

    const badges = await Badge.find({ userId: id });

    res.json({
      user: {
        ...user.toObject(),
        isProfileComplete: user.isProfileComplete(),
        profileCompletion: user.getProfileCompletion(),
      },
      badges,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get match suggestions for current user
 */
export const getMatchSuggestions = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Users already matched or pending
    const existingMatches = await Match.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    });
    const excludeIds = new Set([
      req.user._id.toString(),
      ...existingMatches.map(m => m.requester.toString()),
      ...existingMatches.map(m => m.receiver.toString()),
    ]);

    // Find potential matches
    const potentialUsers = await User.find({
      _id: { $nin: [...excludeIds].map(id => id) },
      isDeactivated: false,
      isVerified: true,
      subjects: { $exists: true, $not: { $size: 0 } },
    }).select('-passwordHash -email -notificationPrefs');

    const suggestions = potentialUsers
      .map(u => {
        const score = calculateMatchScore(currentUser, u);
        return { ...u.toObject(), matchScore: score };
      })
      .filter(s => s.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 50);

    res.json(suggestions);
  } catch (err) {
    next(err);
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPrefs = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { notificationPrefs: req.body } },
      { new: true }
    ).select('notificationPrefs');
    res.json(user.notificationPrefs);
  } catch (err) {
    next(err);
  }
};

/**
 * Update privacy settings
 */
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { privacySettings: req.body } },
      { new: true }
    ).select('privacySettings');
    res.json(user.privacySettings);
  } catch (err) {
    next(err);
  }
};

/**
 * Deactivate account
 */
export const deactivateAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isDeactivated: true });
    res.json({ message: 'Account deactivated' });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete account permanently
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await Promise.all([
      User.findByIdAndDelete(userId),
      Match.deleteMany({ $or: [{ requester: userId }, { receiver: userId }] }),
      Session.updateMany({ participants: userId }, { $pull: { participants: userId } }),
      Badge.deleteMany({ userId }),
    ]);
    res.json({ message: 'Account deleted permanently' });
  } catch (err) {
    next(err);
  }
};

/**
 * Search users by name or subject
 */
export const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [
        { name: regex },
        { 'subjects.name': regex },
      ],
      isDeactivated: false,
      _id: { $ne: req.user._id },
    })
      .select('-passwordHash -email -notificationPrefs')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json(users);
  } catch (err) {
    next(err);
  }
};

