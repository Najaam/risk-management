const asyncHandler = require('express-async-handler');
const Sprint = require('../models/Sprint');
exports.createSprint = asyncHandler(async (req, res) => res.status(201).json(await Sprint.create({ ...req.body, project: req.params.projectId })));
exports.getSprints = asyncHandler(async (req, res) => res.json(await Sprint.find({ project: req.params.projectId }).sort({ startDate: 1 })));
exports.updateSprint = asyncHandler(async (req, res) => res.json(await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true })));
