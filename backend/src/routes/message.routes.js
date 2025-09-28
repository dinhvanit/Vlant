import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { sendMessage, getMessages, getConversations, findOrCreateConversation, getConversationDetails } from '../controllers/message.controller.js';

const router = express.Router();

router.use(protect);

router.post('/findOrCreate', findOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/conversation/:conversationId', getConversationDetails);
router.get('/:otherUserId', getMessages);
router.post('/send/:receiverId', sendMessage);

export default router;