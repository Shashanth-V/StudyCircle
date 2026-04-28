import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { Badge } from '../models/Badge.js';
import { Match } from '../models/Match.js';

/**
 * Get sessions (with filters)
 */
export const getSessions = async (req, res, next) => {
  try {
    const { type, status, subject, mine, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (mine === 'true') {
      filter.$or = [{ host: req.user._id }, { participants: req.user._id }];
    }

    // For public explore: only show upcoming/live public sessions
    if (!mine && !type) {
      filter.type = 'public';
      filter.status = { $in: ['upcoming', 'live'] };
    }

    const sessions = await Session.find(filter)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto')
      .sort({ scheduledAt: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a study session
 */
export const createSession = async (req, res, next) => {
  try {
    const sessionData = req.body;

    const session = await Session.create({
      ...sessionData,
      host: req.user._id,
      participants: [req.user._id],
    });

    const populated = await Session.findById(session._id)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto');

    // Award XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10, sessionsAttended: 1 } });

    // Check for badges
    await checkAndAwardBadges(req.user._id);

    res.status(201).json({ message: 'Session created', session: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single session
 */
export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    next(err);
  }
};

/**
 * Join a session
 */
export const joinSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ message: 'Session has ended' });
    }

    if (session.participants.includes(req.user._id)) {
      return res.status(409).json({ message: 'Already joined this session' });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }

    // For private sessions, check if user is matched with host
    if (session.type === 'private') {
      const isMatched = await Match.exists({
        $or: [
          { requester: req.user._id, receiver: session.host, status: 'accepted' },
          { requester: session.host, receiver: req.user._id, status: 'accepted' },
        ],
      });
      if (!isMatched) {
        return res.status(403).json({ message: 'Private session: you must be matched with the host' });
      }
    }

    session.participants.push(req.user._id);
    await session.save();

    // Award XP
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 10, sessionsAttended: 1 } });

    const populated = await Session.findById(id)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto');

    // Notify host
    const notification = await Notification.create({
      userId: session.host,
      type: 'study_session_invite',
      fromUser: req.user._id,
      refId: session._id,
      refModel: 'Session',
      title: 'New Participant',
      body: `${req.user.name} joined your session "${session.title}"`,
    });

    if (req.io) {
      req.io.to(`user_${session.host.toString()}`).emit('notification', notification);
      req.io.to(`session_${id}`).emit('session_updated', populated);
    }

    res.json({ message: 'Joined session', session: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * Leave a session
 */
export const leaveSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await Session.findById(id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Host cannot leave their own session' });
    }

    session.participants = session.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    await session.save();

    const populated = await Session.findById(id)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto');

    if (req.io) {
      req.io.to(`session_${id}`).emit('session_updated', populated);
    }

    res.json({ message: 'Left session', session: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * Check and award badges based on user stats
 * @param {string} userId
 */
const checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  const existingBadges = await Badge.find({ userId }).distinct('badgeType');
  const toAward = [];

  if (!existingBadges.includes('first_match')) {
    const hasMatch = await Match.exists({
      $or: [{ requester: userId }, { receiver: userId }],
      status: 'accepted',
    });
    if (hasMatch) toAward.push('first_match');
  }

  if (!existingBadges.includes('study_buddy') && user.sessionsAttended >= 5) {
    toAward.push('study_buddy');
  }

  if (!existingBadges.includes('marathon')) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = await Session.find({
      participants: userId,
      createdAt: { $gte: weekAgo },
    });
    const totalMinutes = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    if (totalMinutes >= 600) toAward.push('marathon'); // 10 hours
  }

  if (!existingBadges.includes('consistent_learner') && user.streak >= 7) {
    toAward.push('consistent_learner');
  }

  if (!existingBadges.includes('streak_master') && user.streak >= 30) {
    toAward.push('streak_master');
  }

  for (const badgeType of toAward) {
    await Badge.create({ userId, badgeType });
  }
};

