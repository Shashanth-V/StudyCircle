import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { uploadImage } from '../middleware/upload.js';
import { getChats, getMessages, sendMessage, sendFileMessage } from '../controllers/chatController.js';

const router = Router();
router.use(authenticate);

router.get('/', getChats);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);
router.post('/:chatId/messages/file', uploadImage.single('file'), sendFileMessage, sendMessage);

export default router;
