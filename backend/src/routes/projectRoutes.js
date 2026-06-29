const express = require('express');
const c = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();
router.route('/').get(protect, c.getProjects).post(protect, authorize('PROJECT_MANAGER'), c.createProject);
router.route('/:id').get(protect, c.getProjectById).put(protect, authorize('PROJECT_MANAGER'), c.updateProject).delete(protect, authorize('PROJECT_MANAGER'), c.deleteProject);
module.exports = router;
