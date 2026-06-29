const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Risk = require('../models/Risk');
exports.projectReport = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate('manager team stakeholders', 'name email role');
  const tasks = await Task.find({ project: req.params.projectId });
  const risks = await Risk.find({ project: req.params.projectId }).populate('owner','name email');
  res.json({
    project,
    summary: {
      tasks: tasks.length,
      done: tasks.filter(t => t.status === 'DONE').length,
      openRisks: risks.filter(r => r.status !== 'CLOSED').length,
      totalRiskExposure: risks.reduce((sum, r) => sum + r.exposure, 0)
    },
    risks
  });
});
