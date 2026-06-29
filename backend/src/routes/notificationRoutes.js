const express = require('express');
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, c.getNotifications);
router.patch('/:id/read', protect, c.markRead);
module.exports = router;
