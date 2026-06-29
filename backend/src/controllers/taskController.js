const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

function cleanTaskPayload(payload) {
  const data = { ...payload };
  ['assignee', 'sprint'].forEach((field) => {
    if (data[field] === '' || data[field] === null) delete data[field];
  });
  if (data.dueDate === '') delete data.dueDate;
  return data;
}

exports.createTask = asyncHandler(async (req, res) => {
  const task = await Task.create(cleanTaskPayload(req.body));
  const populated = await Task.findById(task._id).populate('assignee', 'name email role');
  res.status(201).json(populated);
});

exports.getTasks = asyncHandler(async (req, res) => {
  res.json(await Task.find(req.query).populate('assignee', 'name email role').sort({ dueDate: 1 }));
});

exports.updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, cleanTaskPayload(req.body), { new: true }).populate('assignee', 'name email role');
  if (!task) { res.status(404); throw new Error('Task not found'); }
  res.json(task);
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  res.json({ message: 'Task deleted' });
});
