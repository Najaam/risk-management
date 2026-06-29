const asyncHandler = require('express-async-handler');

const mitigation = {
  SCHEDULE: {
    title: 'Schedule Risk Alert',
    mitigationPlan: 'Re-plan sprint scope, add buffer, resolve blockers, and move low-value items to the next sprint.',
    monitoringApproach: 'Review overdue tasks, due dates, and milestone slippage daily.',
    managementPlan: 'Escalate blocked items, reassign critical work, and publish a revised delivery forecast.'
  },
  QUALITY: {
    title: 'Quality Risk Alert',
    mitigationPlan: 'Add focused code reviews, regression tests, bug triage, and a short stabilization window.',
    monitoringApproach: 'Track open bugs, defect age, reopened bugs, and bug-to-story ratio.',
    managementPlan: 'Freeze risky changes temporarily and prioritize production-blocking defects.'
  },
  RESOURCE: {
    title: 'Resource Risk Alert',
    mitigationPlan: 'Redistribute work from overloaded members, adjust WIP limits, and add support if needed.',
    monitoringApproach: 'Track assigned hours, WIP count, blockers, and task ownership by team member.',
    managementPlan: 'Reduce sprint scope or bring another developer into the critical path.'
  },
  DELAY: {
    title: 'Delay Risk Alert',
    mitigationPlan: 'Split large stories, focus on highest-value backlog items, and improve sprint review cadence.',
    monitoringApproach: 'Compare story points done with committed points and velocity target.',
    managementPlan: 'Move unfinished stories to the next sprint and notify stakeholders about impact.'
  }
};

function scoreRisk(body) {
  const values = {
    SCHEDULE: Math.min(1, (Number(body.overdueTasks || 0) * 0.18) + (Number(body.blockerCount || 0) * 0.12)),
    QUALITY: Math.min(1, Number(body.bugCount || 0) * 0.11),
    RESOURCE: Math.min(1, (Number(body.overloadedMembers || 0) * 0.32) + (Number(body.wipCount || 0) * 0.04)),
    DELAY: Math.min(1, Math.max(0, (75 - Number(body.velocityProgress || 0)) / 75) + Math.max(0, (60 - Number(body.taskCompletion || 0)) / 120))
  };
  const category = Object.entries(values).sort((a, b) => b[1] - a[1])[0][0];
  const probability = Math.max(0.1, Math.min(0.95, values[category]));
  const impact = probability > 0.75 ? 5 : probability > 0.55 ? 4 : probability > 0.35 ? 3 : 2;
  const severity = probability * impact >= 3.6 ? 'CRITICAL' : probability * impact >= 2.4 ? 'HIGH' : probability * impact >= 1.2 ? 'MEDIUM' : 'LOW';
  return { category, probability, impact, severity, probabilities: values, ...mitigation[category] };
}

exports.predict = asyncHandler(async (req, res) => {
  res.json(scoreRisk(req.body || {}));
});
