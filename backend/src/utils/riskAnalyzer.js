function mitigationFor(category) {
  const plans = {
    SCHEDULE: [
      'Re-plan sprint scope, resolve blockers, move low-priority work to the next sprint, and add schedule buffer.',
      'Track overdue tasks, near-deadline tasks, blocked items, and milestone slippage daily.',
      'Escalate blocked/late tasks, reassign critical work, and publish a revised delivery forecast.'
    ],
    QUALITY: [
      'Add bug triage, focused code reviews, regression testing, and a short stabilization window.',
      'Track open bug count, defect age, reopened bugs, and bug-to-story ratio.',
      'Freeze risky changes temporarily and prioritize critical defects first.'
    ],
    RESOURCE: [
      'Redistribute overloaded member tasks, reduce WIP, and adjust sprint scope according to capacity.',
      'Track assigned hours per team member and compare them with weekly capacity.',
      'Add support member or move non-critical work to the next sprint.'
    ],
    DELAY: [
      'Split large stories, focus on highest-value backlog items, and improve daily sprint review cadence.',
      'Compare completed points with target velocity and committed sprint scope.',
      'Move unfinished stories to the next sprint and notify stakeholders about delivery impact.'
    ]
  };
  return plans[category] || ['Create mitigation plan.', 'Monitor risk indicators.', 'Execute contingency plan.'];
}

function buildRisk({ title, description, category, probability, impact, costImpact = 0, owner, relatedTasks = [] }) {
  const [mitigationPlan, monitoringApproach, managementPlan] = mitigationFor(category);
  return {
    title,
    description,
    category,
    probability,
    impact,
    costImpact,
    owner,
    relatedTasks,
    mitigationPlan,
    monitoringApproach,
    managementPlan
  };
}

function safeNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalized(value) {
  return String(value || '').trim().toUpperCase();
}

function isOpen(task) {
  return normalized(task.status) !== 'DONE';
}

function isPastDue(dateValue, now) {
  if (!dateValue) return false;
  const due = new Date(dateValue);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(23, 59, 59, 999);
  return due < now;
}

function isDueSoon(dateValue, now, days = 7) {
  if (!dateValue) return false;
  const due = new Date(dateValue);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(23, 59, 59, 999);
  const limit = new Date(now);
  limit.setDate(limit.getDate() + days);
  return due >= now && due <= limit;
}

function analyzeProject({ project, sprints = [], tasks = [] }) {
  const risks = [];
  const now = new Date();
  const thresholds = project?.riskThresholds || {};

  // Demo-friendly thresholds: the UI test data has 3 bugs and around 40+ hours.
  const bugLimit = Math.min(safeNumber(thresholds.maxOpenBugs, 3), 3);
  const minVelocityPercent = safeNumber(thresholds.minVelocityPercent, 70);
  const workloadLimit = Math.min(safeNumber(thresholds.maxWeeklyWorkloadHours, 35), 35);

  const openTasks = tasks.filter(isOpen);
  const overdue = openTasks.filter((task) => isPastDue(task.dueDate, now));
  const dueSoonCritical = openTasks.filter((task) => {
    const priority = normalized(task.priority);
    return isDueSoon(task.dueDate, now) && (priority === 'HIGH' || priority === 'CRITICAL');
  });
  const blockers = openTasks.filter((task) => normalized(task.type) === 'BLOCKER' || (task.blockerReason && String(task.blockerReason).trim()));

  if (overdue.length || blockers.length || dueSoonCritical.length >= 2) {
    const related = [...new Map([...overdue, ...blockers, ...dueSoonCritical].map((task) => [String(task._id), task])).values()];
    const titleParts = [];
    if (overdue.length) titleParts.push(`${overdue.length} overdue`);
    if (blockers.length) titleParts.push(`${blockers.length} blocked`);
    if (dueSoonCritical.length >= 2) titleParts.push(`${dueSoonCritical.length} high-priority due-soon`);
    risks.push(buildRisk({
      title: `${titleParts.join(', ')} task(s) detected`,
      description: 'Late, blocked, or near-deadline high-priority tasks can cause schedule slippage.',
      category: 'SCHEDULE',
      probability: Math.min(0.95, 0.45 + related.length * 0.1),
      impact: Math.min(5, 2 + related.length),
      owner: project.manager,
      relatedTasks: related.map((task) => task._id)
    }));
  }

  const openBugs = tasks.filter((task) => normalized(task.type) === 'BUG' && isOpen(task));
  if (openBugs.length >= bugLimit) {
    risks.push(buildRisk({
      title: `Bug count reached risk threshold (${openBugs.length}/${bugLimit})`,
      description: 'High open bug count threatens deliverable quality and may cause rework.',
      category: 'QUALITY',
      probability: Math.min(0.95, 0.55 + openBugs.length * 0.08),
      impact: openBugs.some((task) => normalized(task.priority) === 'CRITICAL') ? 5 : 4,
      owner: project.manager,
      relatedTasks: openBugs.map((task) => task._id)
    }));
  }

  const workload = new Map();
  openTasks.forEach((task) => {
    if (task.assignee) {
      const userId = String(task.assignee);
      workload.set(userId, (workload.get(userId) || 0) + safeNumber(task.estimatedHours, 0));
    }
  });

  workload.forEach((hours, userId) => {
    if (hours >= workloadLimit) {
      risks.push(buildRisk({
        title: `Team member workload overloaded (${hours}h/${workloadLimit}h)`,
        description: 'A member has more assigned work than safe weekly capacity, which can create delivery and quality problems.',
        category: 'RESOURCE',
        probability: Math.min(0.95, 0.55 + ((hours - workloadLimit) / 100)),
        impact: 4,
        owner: userId
      }));
    }
  });

  sprints.filter((sprint) => normalized(sprint.status) === 'ACTIVE').forEach((sprint) => {
    const target = safeNumber(sprint.targetVelocity, 0);
    const completed = safeNumber(sprint.completedPoints, 0);
    const percent = target ? (completed / target) * 100 : 0;
    if (target > 0 && percent < minVelocityPercent) {
      risks.push(buildRisk({
        title: `Sprint velocity below target (${Math.round(percent)}%/${minVelocityPercent}%)`,
        description: 'Sprint progress is below planned target velocity, so delivery may be delayed.',
        category: 'DELAY',
        probability: Math.min(0.95, 0.5 + ((minVelocityPercent - percent) / 100)),
        impact: 4,
        owner: project.manager
      }));
    }
  });

  return risks;
}

module.exports = { analyzeProject };
