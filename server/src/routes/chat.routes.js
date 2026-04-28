import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadFile } from '../middleware/upload.js';
import { validateBody } from '../middleware/validate.js';
import { sendMessageSchema } from '../../../../shared/schemas.js';
import {
  getChats,
  getMessages,
  sendMessage,
  uploadAttachment,
  deleteMessage,
  markMessagesRead,
} from '../controllers/chat.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getChats);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', validateBody(sendMessageSchema), sendMessage);
router.post('/:chatId/upload', uploadFile.single('file'), uploadAttachment);
router.delete('/:chatId/messages/:msgId', deleteMessage);
router.post('/:chatId/read', markMessagesRead);

export default router;
