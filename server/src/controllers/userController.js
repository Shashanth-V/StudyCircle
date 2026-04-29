import { User } from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'bio', 'subjects', 'availability', 'studyGoal', 'studyStyle', 'city', 'onboardingComplete'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'studycircle/profiles');
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: result.url },
      { new: true }
    );

    res.json({ profilePhoto: user.profilePhoto });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name profilePhoto bio subjects availability studyGoal studyStyle city xp streak lastActive createdAt privacySettings');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    // Note: also need to delete matches, sessions, and anonymize messages
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};
