import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { calculateMatchScore } from '../utils/matchScore.js';

/**
 * Get all matches for current user
 */
export const getMatches = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
    };
    if (status) filter.status = status;

    const matches = await Match.find(filter)
      .populate('requester', 'name profilePhoto isOnline lastActive')
      .populate('receiver', 'name profilePhoto isOnline lastActive')
      .sort({ createdAt: -1 });

    res.json({ matches });
  } catch (err) {
    next(err);
  }
};

/**
 * Send match request
 */
export const sendRequest = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot match with yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.isDeactivated) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existing = await Match.findOne({
      $or: [
        { requester: req.user._id, receiver: userId },
        { requester: userId, receiver: req.user._id },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: 'Match request already exists', status: existing.status });
    }

    const currentUser = await User.findById(req.user._id);
    const score = calculateMatchScore(currentUser, targetUser);

    const match = await Match.create({
      requester: req.user._id,
      receiver: userId,
      status: 'pending',
      matchScore: score,
    });

    // Create notification for receiver
    const notification = await Notification.create({
      userId,
      type: 'match_request',
      fromUser: req.user._id,
      refId: match._id,
      refModel: 'Match',
      title: 'New Match Request',
      body: `${currentUser.name} wants to study with you!`,
    });

    // Emit real-time notification
    if (req.io) {
      req.io.to(`user_${userId}`).emit('notification', notification);
    }

    res.status(201).json({ message: 'Match request sent', match });
  } catch (err) {
    next(err);
  }
};

/**
 * Accept match request
 */
export const acceptRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const match = await Match.findOneAndUpdate(
      { _id: id, receiver: req.user._id, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    const currentUser = await User.findById(req.user._id);
    const notification = await Notification.create({
      userId: match.requester,
      type: 'match_accepted',
      fromUser: req.user._id,
      refId: match._id,
      refModel: 'Match',
      title: 'Match Accepted',
      body: `${currentUser.name} accepted your match request!`,
    });

    if (req.io) {
      req.io.to(`user_${match.requester.toString()}`).emit('notification', notification);
    }

    res.json({ message: 'Match accepted', match });
  } catch (err) {
    next(err);
  }
};

/**
 * Decline match request
 */
export const declineRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const match = await Match.findOneAndUpdate(
      { _id: id, receiver: req.user._id, status: 'pending' },
      { status: 'declined' },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    res.json({ message: 'Match declined', match });
  } catch (err) {
    next(err);
  }
};

/**
 * Block a user / match
 */
export const blockMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const match = await Match.findOneAndUpdate(
      {
        _id: id,
        $or: [{ requester: req.user._id }, { receiver: req.user._id }],
      },
      { status: 'blocked', reason: reason || '' },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({ message: 'User blocked', match });
  } catch (err) {
    next(err);
  }
};

/**
 * Report a user
 */
export const reportUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const match = await Match.findOneAndUpdate(
      {
        _id: id,
        $or: [{ requester: req.user._id }, { receiver: req.user._id }],
      },
      { status: 'blocked', reason: reason || 'Reported by user' },
      { new: true }
    );

    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // TODO: Send report to admin/moderation queue

    res.json({ message: 'User reported and blocked', match });
  } catch (err) {
    next(err);
  }
};

