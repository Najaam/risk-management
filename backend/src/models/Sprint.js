const mongoose = require('mongoose');
const sprintSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  objective: String,
  startDate: Date,
  endDate: Date,
  targetVelocity: { type: Number, default: 30 },
  completedPoints: { type: Number, default: 0 },
  status: { type: String, enum: ['PLANNED','ACTIVE','COMPLETED'], default: 'PLANNED' }
}, { timestamps: true });
module.exports = mongoose.model('Sprint', sprintSchema);
