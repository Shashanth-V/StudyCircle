import { User } from '../models/User.js';
import { Badge } from '../models/Badge.js';

/**
 * Get weekly leaderboard by XP
 */
export const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // For simplicity, using total XP as weekly score
    // In production, you might track weekly XP in a separate collection
    const users = await User.find({ isDeactivated: false })
      .select('name profilePhoto xp streak sessionsAttended totalStudyMinutes')
      .sort({ xp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments({ isDeactivated: false });

    res.json(
      users.map((u, i) => ({
        rank: (Number(page) - 1) * Number(limit) + i + 1,
        user: u,
      }))
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Get badges for a user
 */
export const getUserBadges = async (req, res, next) => {
  try {
    const { id } = req.params;
    const badges = await Badge.find({ userId: id }).sort({ earnedAt: -1 });
    res.json({ badges });
  } catch (err) {
    next(err);
  }
};

