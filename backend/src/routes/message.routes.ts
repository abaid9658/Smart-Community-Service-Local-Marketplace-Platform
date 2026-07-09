import { Router } from 'express';
import {
  getConversations, getOrCreateConversation,
  getMessages, sendMessage,
} from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadChatMedia } from '../middleware/upload.middleware';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.post('/conversations', authenticate, getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticate, getMessages);
router.post('/conversations/:conversationId/messages', authenticate, uploadChatMedia.single('media'), sendMessage);

export default router;
