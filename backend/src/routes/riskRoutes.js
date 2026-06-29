const express = require('express');
const c = require('../controllers/riskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/analyze/:projectId', protect, c.analyzeRisks);
router.get('/project/:projectId', protect, c.getProjectRisks);
router.post('/', protect, c.createRisk);
router.route('/:id').put(protect, c.updateRisk).delete(protect, c.deleteRisk);
module.exports = router;
