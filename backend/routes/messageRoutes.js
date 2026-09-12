const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversations,
  sendBroadcast,
  getBroadcasts,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.post('/broadcast', protect, sendBroadcast);
router.get('/broadcasts', protect, authorize('moh_officer'), getBroadcasts);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);

module.exports = router;