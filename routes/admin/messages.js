const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');
const { authenticateAdmin } = require('../../middleware/auth');

// All routes require authentication
router.use(authenticateAdmin);

// Get all messages page
router.get('/', messageController.getAllMessages);

// Get archived messages page
router.get('/archive', messageController.getArchivedMessages);

// Get single message (for viewing)
router.get('/:id', messageController.getMessage);

// Update message status
router.put('/:id/status', messageController.updateMessageStatus);

// Delete message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
