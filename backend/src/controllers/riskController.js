const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Risk = require('../models/Risk');
const Notification = require('../models/Notification');
const { analyzeProject } = require('../utils/riskAnalyzer');

exports.analyzeRisks = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) { res.status(404); throw new Error('Project not found'); }
  const sprints = await Sprint.find({ project: project._id });
  const tasks = await Task.find({ project: project._id });
  const detected = analyzeProject({ project, sprints, tasks });
  const created = [];
  for (const r of detected) {
    const exists = await Risk.findOne({ project: project._id, title: r.title, category: r.category, status: { $ne: 'CLOSED' } });
    if (!exists) {
      const risk = await Risk.create({ ...r, project: project._id });
      created.push(risk);
      const users = [project.manager, ...project.team, ...project.stakeholders].filter(Boolean);
      await Notification.insertMany(users.map(user => ({ user, project: project._id, risk: risk._id, title: `Risk Alert: ${risk.category}`, message: risk.title })));
    }
  }
  res.json({ detected: detected.length, created, detectedRisks: detected });
});
exports.getProjectRisks = asyncHandler(async (req, res) => res.json(await Risk.find({ project: req.params.projectId }).populate('owner','name email role').sort({ createdAt: -1 })));
exports.createRisk = asyncHandler(async (req, res) => {
  const risk = await Risk.create({ ...req.body, source: 'MANUAL' });
  res.status(201).json(risk);
});
exports.updateRisk = asyncHandler(async (req, res) => {
  const existing = await Risk.findById(req.params.id);
  if (!existing) { res.status(404); throw new Error('Risk not found'); }
  Object.assign(existing, req.body);
  await existing.save();
  res.json(existing);
});
exports.deleteRisk = asyncHandler(async (req, res) => { await Risk.findByIdAndDelete(req.params.id); res.json({ message: 'Risk deleted' }); });
