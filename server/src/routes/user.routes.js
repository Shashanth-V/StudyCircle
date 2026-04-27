import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  notificationPrefsSchema,
  privacySettingsSchema,
} from '../../../shared/schemas.js';
import {
  getMe,
  updateMe,
  uploadProfilePhoto,
  getUserById,
  getMatchSuggestions,
  changePassword,
  updateNotificationPrefs,
  updatePrivacySettings,
  deactivateAccount,
  deleteAccount,
  searchUsers,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', validateBody(updateProfileSchema), updateMe);
router.post('/me/photo', uploadImage.single('photo'), uploadProfilePhoto);
router.get('/matches/suggestions', getMatchSuggestions);
router.get('/search', searchUsers);
router.get('/:id', getUserById);

// Settings
router.patch('/settings/password', validateBody(changePasswordSchema), changePassword);
router.patch('/settings/notifications', validateBody(notificationPrefsSchema), updateNotificationPrefs);
router.patch('/settings/privacy', validateBody(privacySettingsSchema), updatePrivacySettings);
router.post('/settings/deactivate', deactivateAccount);
router.delete('/settings/account', deleteAccount);

export default router;

