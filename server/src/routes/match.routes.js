import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMatches,
  sendRequest,
  acceptRequest,
  declineRequest,
  blockMatch,
  reportUser,
} from '../controllers/match.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getMatches);
router.post('/request/:userId', sendRequest);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/decline', declineRequest);
router.post('/:id/block', blockMatch);
router.post('/:id/report', reportUser);

export default router;

