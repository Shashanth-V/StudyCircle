import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getSessions, createSession, getSessionById,
  joinSession, leaveSession, startSession, endSession, addSessionChat
} from '../controllers/sessionController.js';

const router = Router();
router.use(authenticate);

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id', getSessionById);
router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);
router.patch('/:id/start', startSession);
router.patch('/:id/end', endSession);
router.post('/:id/chat', addSessionChat);

export default router;
