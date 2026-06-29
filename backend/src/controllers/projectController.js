const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
exports.getProjects = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'PROJECT_MANAGER' ? { manager: req.user._id } : { $or: [{ team: req.user._id }, { stakeholders: req.user._id }, { manager: req.user._id }] };
  res.json(await Project.find(filter).populate('manager team stakeholders', 'name email role'));
});
exports.createProject = asyncHandler(async (req, res) => res.status(201).json(await Project.create({ ...req.body, manager: req.user._id })));
exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('manager team stakeholders', 'name email role');
  if (!project) { res.status(404); throw new Error('Project not found'); }
  res.json(project);
});
exports.updateProject = asyncHandler(async (req, res) => res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })));
exports.deleteProject = asyncHandler(async (req, res) => { await Project.findByIdAndDelete(req.params.id); res.json({ message: 'Project deleted' }); });
