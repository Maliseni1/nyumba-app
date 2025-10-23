const express = require('express');
const router = express.Router();
const { getConversations, getMessages, createConversation, sendMessage, markAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/conversations').get(protect, getConversations).post(protect, createConversation);
router.put('/conversations/read/:id', protect, markAsRead);
router.get('/:conversationId', protect, getMessages);
router.post('/send/:conversationId', protect, sendMessage);

module.exports = router;