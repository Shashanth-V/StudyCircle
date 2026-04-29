import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getSuggestions,
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getMatches,
  acceptRequest,
  declineRequest
} from '../controllers/matchController.js';

const router = Router();
router.use(authenticate);

router.get('/suggestions', getSuggestions);
router.post('/request/:userId', createRequest);
router.get('/requests/incoming', getIncomingRequests);
router.get('/requests/outgoing', getOutgoingRequests);
router.get('/', getMatches);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/decline', declineRequest);

export default router;
