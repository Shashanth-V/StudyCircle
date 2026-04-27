import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createSessionSchema } from '../../../shared/schemas.js';
import {
  getSessions,
  createSession,
  getSessionById,
  joinSession,
  leaveSession,
} from '../controllers/session.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getSessions);
router.post('/', validateBody(createSessionSchema), createSession);
router.get('/:id', getSessionById);
router.post('/:id/join', joinSession);
router.post('/:id/leave', leaveSession);

export default router;

