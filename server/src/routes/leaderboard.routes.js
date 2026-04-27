import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  getWeeklyLeaderboard,
  getUserBadges,
} from '../controllers/leaderboard.controller.js';

const router = Router();

router.get('/weekly', optionalAuth, getWeeklyLeaderboard);
router.get('/:id/badges', optionalAuth, getUserBadges);

export default router;

