const express = require('express');
const c = require('../controllers/sprintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router({ mergeParams: true });
router.route('/:projectId/sprints').get(protect, c.getSprints).post(protect, authorize('PROJECT_MANAGER'), c.createSprint);
router.put('/sprints/:id', protect, authorize('PROJECT_MANAGER'), c.updateSprint);
module.exports = router;
