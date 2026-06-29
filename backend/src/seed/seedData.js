const dotenv = require('dotenv'); dotenv.config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const Risk = require('../models/Risk');
const Notification = require('../models/Notification');
const { analyzeProject } = require('../utils/riskAnalyzer');

async function seed(){
  await connectDB();
  await Promise.all([User.deleteMany(), Project.deleteMany(), Sprint.deleteMany(), Task.deleteMany(), Risk.deleteMany(), Notification.deleteMany()]);

  const manager = await User.create({ name:'Sana Project Manager', email:'manager@riskpro.com', password:'password123', role:'PROJECT_MANAGER', weeklyCapacityHours:40, skills:['Risk planning','Agile leadership'] });
  const dev1 = await User.create({ name:'Sana Frontend Developer', email:'dev@riskpro.com', password:'password123', role:'DEVELOPER', weeklyCapacityHours:35, skills:['React','UI Components'] });
  const dev2 = await User.create({ name:'Sana Backend Developer', email:'backend@riskpro.com', password:'password123', role:'DEVELOPER', weeklyCapacityHours:40, skills:['Node.js','MongoDB'] });
  const stakeholder = await User.create({ name:'Sana Stakeholder', email:'stakeholder@riskpro.com', password:'password123', role:'STAKEHOLDER', weeklyCapacityHours:10, skills:['Review','Approval'] });

  const project = await Project.create({
    name:'Sana Risk Management Project',
    description:'Agile CASE tool for proactive project risk management, AI risk detection, RMMM plans, dashboards, notifications and reports.',
    status:'ACTIVE', manager:manager._id, team:[dev1._id, dev2._id], stakeholders:[stakeholder._id], budget:25000,
    startDate:new Date(Date.now()-14*86400000), endDate:new Date(Date.now()+45*86400000),
    riskThresholds:{maxOpenBugs:2,minVelocityPercent:75,maxWeeklyWorkloadHours:35}
  });

  const sprint1 = await Sprint.create({ project:project._id, name:'Sprint 1 - Foundation', objective:'Build authentication, projects, tasks and base UI', status:'COMPLETED', targetVelocity:38, completedPoints:36, startDate:new Date(Date.now()-20*86400000), endDate:new Date(Date.now()-7*86400000) });
  const sprint2 = await Sprint.create({ project:project._id, name:'Sprint 2 - AI Risk Automation', objective:'Risk register, AI scan, reports and notifications', status:'ACTIVE', targetVelocity:42, completedPoints:20, startDate:new Date(Date.now()-6*86400000), endDate:new Date(Date.now()+8*86400000) });

  await Task.insertMany([
    { project:project._id, sprint:sprint1._id, title:'Define project risk categories', type:'STORY', status:'DONE', assignee:dev2._id, dueDate:new Date(Date.now()-15*86400000), storyPoints:8, estimatedHours:10, actualHours:9 },
    { project:project._id, sprint:sprint1._id, title:'Create role based login UI', type:'STORY', status:'DONE', assignee:dev1._id, dueDate:new Date(Date.now()-12*86400000), storyPoints:8, estimatedHours:10, actualHours:11 },
    { project:project._id, sprint:sprint2._id, title:'Implement AI risk scan endpoint', type:'TASK', status:'IN_PROGRESS', assignee:dev2._id, dueDate:new Date(Date.now()-1*86400000), storyPoints:8, estimatedHours:18, actualHours:9 },
    { project:project._id, sprint:sprint2._id, title:'Build dashboard health cards', type:'STORY', status:'IN_PROGRESS', assignee:dev1._id, dueDate:new Date(Date.now()+2*86400000), storyPoints:5, estimatedHours:14, actualHours:6 },
    { project:project._id, sprint:sprint2._id, title:'Fix risk table export defect', type:'BUG', status:'TODO', assignee:dev2._id, dueDate:new Date(Date.now()+1*86400000), storyPoints:3, estimatedHours:8 },
    { project:project._id, sprint:sprint2._id, title:'Resolve notification duplicate bug', type:'BUG', status:'TODO', assignee:dev2._id, dueDate:new Date(Date.now()+3*86400000), storyPoints:3, estimatedHours:8 },
    { project:project._id, sprint:sprint2._id, title:'Fix sprint velocity calculation', type:'BUG', status:'TODO', assignee:dev1._id, dueDate:new Date(Date.now()+4*86400000), storyPoints:3, estimatedHours:8 },
    { project:project._id, sprint:sprint2._id, title:'Client review blocker', type:'BLOCKER', status:'TODO', assignee:dev1._id, dueDate:new Date(Date.now()-2*86400000), storyPoints:2, estimatedHours:8, blockerReason:'Stakeholder approval is pending' }
  ]);

  const sprints = await Sprint.find({ project: project._id });
  const tasks = await Task.find({ project: project._id });
  const detected = analyzeProject({ project, sprints, tasks });
  const createdRisks = [];
  for (const riskData of detected) {
    const risk = await Risk.create({ ...riskData, project: project._id });
    createdRisks.push(risk);
  }
  const users = [manager, dev1, dev2, stakeholder];
  const notifications = [];
  for (const risk of createdRisks) {
    for (const user of users) {
      notifications.push({ user:user._id, project:project._id, risk:risk._id, title:`Risk Alert: ${risk.category}`, message:risk.title });
    }
  }
  if (notifications.length) await Notification.insertMany(notifications);

  console.log('Seed complete');
  console.log('Login: manager@riskpro.com / password123');
  process.exit();
}
seed().catch(e=>{ console.error(e); process.exit(1); });
