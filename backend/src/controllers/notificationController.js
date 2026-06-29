const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
exports.getNotifications = asyncHandler(async (req, res) => res.json(await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)));
exports.markRead = asyncHandler(async (req, res) => res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })));
