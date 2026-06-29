const mongoose = require('mongoose');
const riskSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['SCHEDULE','QUALITY','RESOURCE','DELAY','COST','PERFORMANCE','SUPPORT','BUSINESS','TECHNOLOGY','CUSTOMER','PROCESS'], required: true },
  probability: { type: Number, min: 0, max: 1, required: true },
  impact: { type: Number, min: 1, max: 5, required: true },
  costImpact: { type: Number, default: 0 },
  exposure: { type: Number, default: 0 },
  priority: { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], default: 'MEDIUM' },
  status: { type: String, enum: ['OPEN','MITIGATING','MONITORING','CLOSED'], default: 'OPEN' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: ['AI_DETECTED','MANUAL'], default: 'AI_DETECTED' },
  mitigationPlan: String,
  monitoringApproach: String,
  managementPlan: String,
  relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}, { timestamps: true });

riskSchema.pre('save', function(next) {
  this.exposure = Number((this.probability * (this.costImpact || this.impact)).toFixed(2));
  const score = this.probability * this.impact;
  this.priority = score >= 4 ? 'CRITICAL' : score >= 2.5 ? 'HIGH' : score >= 1.25 ? 'MEDIUM' : 'LOW';
  next();
});
module.exports = mongoose.model('Risk', riskSchema);
