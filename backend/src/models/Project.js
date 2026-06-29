const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  status: { type: String, enum: ['PLANNING','ACTIVE','ON_HOLD','COMPLETED'], default: 'PLANNING' },
  startDate: Date,
  endDate: Date,
  budget: { type: Number, default: 0 },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  riskThresholds: {
    maxOpenBugs: { type: Number, default: 8 },
    minVelocityPercent: { type: Number, default: 70 },
    maxWeeklyWorkloadHours: { type: Number, default: 42 }
  }
}, { timestamps: true });
module.exports = mongoose.model('Project', projectSchema);
