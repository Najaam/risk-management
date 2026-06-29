const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { predict } = require('../controllers/aiController');
const router = express.Router();
router.post('/predict', protect, predict);
module.exports = router;
