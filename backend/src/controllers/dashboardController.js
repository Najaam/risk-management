const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Risk = require('../models/Risk');
const Sprint = require('../models/Sprint');
exports.getDashboard = asyncHandler(async (req, res) => {
  const project = req.params.projectId;
  const [tasks, risks, sprints] = await Promise.all([Task.find({ project }), Risk.find({ project }), Sprint.find({ project })]);
  const countBy = (arr, key) => arr.reduce((a, x) => ({ ...a, [x[key]]: (a[x[key]] || 0) + 1 }), {});
  res.json({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'DONE').length,
    openRisks: risks.filter(r => r.status !== 'CLOSED').length,
    criticalRisks: risks.filter(r => r.priority === 'CRITICAL').length,
    riskByCategory: countBy(risks, 'category'),
    riskByPriority: countBy(risks, 'priority'),
    sprintVelocity: sprints.map(s => ({ name: s.name, target: s.targetVelocity, completed: s.completedPoints }))
  });
});
