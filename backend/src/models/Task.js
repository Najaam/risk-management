const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint' },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['STORY','BUG','TASK','BLOCKER'], default: 'TASK' },
  status: { type: String, enum: ['TODO','IN_PROGRESS','REVIEW','DONE'], default: 'TODO' },
  priority: { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  storyPoints: { type: Number, default: 1 },
  estimatedHours: { type: Number, default: 4 },
  actualHours: { type: Number, default: 0 },
  blockerReason: String
}, { timestamps: true });
module.exports = mongoose.model('Task', taskSchema);
