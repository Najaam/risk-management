import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import Panel from '../../components/Panel/Panel.jsx';
import TaskBoard from '../../components/TaskBoard/TaskBoard.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './ProjectDetail.css';

function dateValue(days = 0) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
const blankSprint = { name:'', objective:'', status:'ACTIVE', startDate:dateValue(0), endDate:dateValue(14), targetVelocity:35, completedPoints:0 };
const blankTask = { title:'', description:'', type:'TASK', status:'TODO', priority:'MEDIUM', sprint:'', assignee:'', dueDate:dateValue(5), storyPoints:3, estimatedHours:8, blockerReason:'' };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprintForm, setSprintForm] = useState(blankSprint);
  const [taskForm, setTaskForm] = useState(blankTask);
  const [toast, setToast] = useState(null);

  async function load() {
    const [projectRes, sprintRes, taskRes, userRes] = await Promise.all([
      api.get(`/projects/${projectId}`), api.get(`/projects/${projectId}/sprints`), api.get(`/tasks?project=${projectId}`), api.get('/users')
    ]);
    setProject(projectRes.data); setSprints(sprintRes.data || []); setTasks(taskRes.data || []); setUsers(userRes.data || []);
    const firstSprint = sprintRes.data?.[0]?._id || '';
    setTaskForm((current) => ({ ...current, sprint: current.sprint || firstSprint }));
  }

  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Sprint board load failed' })); }, [projectId]);

  const developers = users.filter((user) => user.role === 'DEVELOPER');
  const activeSprint = sprints.find((sprint) => sprint.status === 'ACTIVE') || sprints[0];
  const sprintCompletion = useMemo(() => activeSprint?.targetVelocity ? (activeSprint.completedPoints / activeSprint.targetVelocity) * 100 : 0, [activeSprint]);

  async function createSprint(event) {
    event.preventDefault();
    if (!sprintForm.name.trim()) return setToast({ type:'error', message:'Sprint name is required' });
    try {
      await api.post(`/projects/${projectId}/sprints`, sprintForm);
      setSprintForm(blankSprint);
      await load();
      setToast({ type:'success', message:'Sprint created' });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Sprint creation failed' }); }
  }

  async function createTask(event) {
    event.preventDefault();
    if (!taskForm.title.trim()) return setToast({ type:'error', message:'Task title is required' });
    try {
      await api.post('/tasks', { ...taskForm, project: projectId, sprint: taskForm.sprint || activeSprint?._id || undefined });
      setTaskForm({ ...blankTask, sprint: taskForm.sprint || activeSprint?._id || '' });
      await load();
      setToast({ type:'success', message:'Backlog item added' });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Task creation failed' }); }
  }

  async function moveTask(task, status) {
    try { await api.put(`/tasks/${task._id}`, { status }); await load(); }
    catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Could not update task' }); }
  }

  async function deleteTask(id) {
    try { await api.delete(`/tasks/${id}`); await load(); setToast({ type:'success', message:'Task deleted' }); }
    catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Could not delete task' }); }
  }

  async function runScan() {
    try {
      const { data } = await api.post(`/risks/analyze/${projectId}`);
      const detected = data.detected || 0;
      const created = data.created?.length || 0;
      setToast({
        type: created ? 'success' : 'info',
        message: `AI scan complete. ${detected} risk(s) detected, ${created} new risk(s) created. Check Open Risks.`
      });
    } catch (error) {
      setToast({ type:'error', message:error.response?.data?.message || 'AI scan failed' });
    }
  }

  if (!project) return <p className="empty">Loading sprint board...</p>;

  return (
    <div className="page sprint-page">
      <div className="page-title"><div><h1>{project.name}</h1><p>{project.description}</p></div><div className="actions"><button className="button primary" onClick={runScan} type="button">✦ Run AI Scan</button><Link className="button secondary" to={`/risks/${projectId}`}>Open Risks</Link></div></div>
      <div className="view-grid">
        <Panel title="Active Sprint" action={activeSprint && <StatusPill value={activeSprint.status} />}>
          {activeSprint ? <div className="active-sprint"><h3>{activeSprint.name}</h3><p>{activeSprint.objective}</p><div><span>Velocity</span><strong>{activeSprint.completedPoints}/{activeSprint.targetVelocity}</strong></div><ProgressBar value={sprintCompletion} tone={sprintCompletion < 75 ? 'amber' : 'teal'} /></div> : <p className="empty">No sprint available.</p>}
        </Panel>
        <Panel title="Sprint List">
          <div className="sprint-list">{sprints.map((sprint) => <div className="sprint-mini" key={sprint._id}><div><b>{sprint.name}</b><span>{sprint.objective}</span></div><StatusPill value={sprint.status} /><ProgressBar value={sprint.targetVelocity ? (sprint.completedPoints / sprint.targetVelocity) * 100 : 0} /></div>)}{!sprints.length && <p className="empty">No sprints yet.</p>}</div>
        </Panel>
        <Panel title="Create Sprint" className="wide">
          <form className="form-grid" onSubmit={createSprint}>
            <label>Sprint Name<input value={sprintForm.name} onChange={(e) => setSprintForm({ ...sprintForm, name:e.target.value })} placeholder="Sprint 3 - Risk Automation" /></label>
            <label>Status<select value={sprintForm.status} onChange={(e) => setSprintForm({ ...sprintForm, status:e.target.value })}><option>PLANNED</option><option>ACTIVE</option><option>COMPLETED</option></select></label>
            <label>Target Velocity<input type="number" min="1" value={sprintForm.targetVelocity} onChange={(e) => setSprintForm({ ...sprintForm, targetVelocity:Number(e.target.value) })} /></label>
            <label>Completed Points<input type="number" min="0" value={sprintForm.completedPoints} onChange={(e) => setSprintForm({ ...sprintForm, completedPoints:Number(e.target.value) })} /></label>
            <label>Start<input type="date" value={sprintForm.startDate} onChange={(e) => setSprintForm({ ...sprintForm, startDate:e.target.value })} /></label>
            <label>End<input type="date" value={sprintForm.endDate} onChange={(e) => setSprintForm({ ...sprintForm, endDate:e.target.value })} /></label>
            <label className="span-2">Objective<input value={sprintForm.objective} onChange={(e) => setSprintForm({ ...sprintForm, objective:e.target.value })} placeholder="Deliver AI scan and mitigation actions" /></label>
            <button className="button primary" type="submit">＋ Add Sprint</button>
          </form>
        </Panel>
        <Panel title="Add Backlog Item" className="wide">
          <form className="form-grid" onSubmit={createTask}>
            <label className="span-2">Title<input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title:e.target.value })} placeholder="Add mitigation action or sprint story" /></label>
            <label>Sprint<select value={taskForm.sprint} onChange={(e) => setTaskForm({ ...taskForm, sprint:e.target.value })}>{sprints.map((sprint) => <option value={sprint._id} key={sprint._id}>{sprint.name}</option>)}</select></label>
            <label>Type<select value={taskForm.type} onChange={(e) => setTaskForm({ ...taskForm, type:e.target.value })}><option>STORY</option><option>TASK</option><option>BUG</option><option>BLOCKER</option></select></label>
            <label>Priority<select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority:e.target.value })}><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option></select></label>
            <label>Assignee<select value={taskForm.assignee} onChange={(e) => setTaskForm({ ...taskForm, assignee:e.target.value })}><option value="">Unassigned</option>{developers.map((user) => <option value={user._id} key={user._id}>{user.name}</option>)}</select></label>
            <label>Due Date<input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate:e.target.value })} /></label>
            <label>Story Points<input type="number" min="1" value={taskForm.storyPoints} onChange={(e) => setTaskForm({ ...taskForm, storyPoints:Number(e.target.value) })} /></label>
            <label>Hours<input type="number" min="1" value={taskForm.estimatedHours} onChange={(e) => setTaskForm({ ...taskForm, estimatedHours:Number(e.target.value) })} /></label>
            <label className="span-2">Description<input value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description:e.target.value })} /></label>
            <label className="span-2">Blocker Reason<input value={taskForm.blockerReason} onChange={(e) => setTaskForm({ ...taskForm, blockerReason:e.target.value })} /></label>
            <button className="button primary" type="submit">＋ Add Item</button>
          </form>
        </Panel>
        <Panel title="Sprint Board" subtitle="Move tasks across Agile workflow. These changes are saved in MongoDB." className="wide">
          <TaskBoard tasks={tasks} onMove={moveTask} onDelete={deleteTask} />
        </Panel>
      </div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
