const express = require('express');
const c = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, c.getUsers).post(protect, authorize('PROJECT_MANAGER'), c.createUser);
router.route('/:id').put(protect, authorize('PROJECT_MANAGER'), c.updateUser).delete(protect, authorize('PROJECT_MANAGER'), c.deleteUser);

module.exports = router;
