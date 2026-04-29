import { User } from '../models/User.js';

// Stub for badges until Phase 7
export const checkAndAwardBadges = async (userId) => {
  // Logic to calculate badges
};

export const awardSessionXP = async (session) => {
  try {
    const participants = session.participants;
    if (!participants || participants.length === 0) return;

    // +10 base XP
    // +5 per 30 min
    const durationBlocks = Math.floor(session.totalMinutesStudied / 30);
    const xpEarned = 10 + (durationBlocks * 5);

    for (const userId of participants) {
      const user = await User.findById(userId);
      if (!user) continue;

      let streakBonus = 0;
      
      const now = new Date();
      const lastActive = user.lastActive ? new Date(user.lastActive) : null;
      
      if (!lastActive) {
        user.streak = 1;
      } else {
        const diffTime = Math.abs(now - lastActive);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          user.streak += 1;
          if (user.streak % 7 === 0) {
            streakBonus = 20; // Weekly streak bonus
          }
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }

      user.xp += xpEarned + streakBonus;
      user.weeklyXP += xpEarned + streakBonus;
      user.lastActive = now;
      
      await user.save();
      await checkAndAwardBadges(user._id);
    }
  } catch (err) {
    console.error('Error awarding XP:', err);
  }
};
