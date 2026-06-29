const express = require('express');
const c = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.route('/').get(protect, c.getTasks).post(protect, c.createTask);
router.route('/:id').put(protect, c.updateTask).delete(protect, c.deleteTask);
module.exports = router;
