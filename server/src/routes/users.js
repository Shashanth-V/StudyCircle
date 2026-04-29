import { Router } from 'express';
import { getMe, updateMe, uploadProfilePhoto, getUserById, changePassword, deleteAccount } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/me/photo', uploadImage.single('photo'), uploadProfilePhoto);
router.post('/me/change-password', changePassword);
router.delete('/me', deleteAccount);
router.get('/:id', getUserById);

export default router;
