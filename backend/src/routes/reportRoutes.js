const express = require('express');
const { projectReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/project/:projectId', protect, projectReport);
module.exports = router;
