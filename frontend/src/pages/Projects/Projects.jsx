import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import Panel from '../../components/Panel/Panel.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './Projects.css';

function pct(done, total) { return total ? Math.round((done / total) * 100) : 0; }

const emptyProject = { name:'', description:'', status:'ACTIVE', budget:0, startDate:'', endDate:'', team:[], stakeholders:[] };

export default function Projects() {
  const { projects, setProjects, reloadShellData } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState(emptyProject);
  const [toast, setToast] = useState(null);

  async function load() {
    const [userRes, projectRes] = await Promise.all([api.get('/users'), api.get('/projects')]);
    setUsers(userRes.data || []);
    setProjects(projectRes.data || []);
    const pairs = await Promise.all((projectRes.data || []).map(async (project) => {
      try { const { data } = await api.get(`/dashboard/${project._id}`); return [project._id, data]; }
      catch { return [project._id, null]; }
    }));
    setStats(Object.fromEntries(pairs));
  }

  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Could not load projects' })); }, []);

  function toggleUser(field, id) {
    setForm((current) => ({ ...current, [field]: current[field].includes(id) ? current[field].filter((item) => item !== id) : [...current[field], id] }));
  }

  async function createProject(event) {
    event.preventDefault();
    if (!form.name.trim()) return setToast({ type:'error', message:'Project name is required' });
    try {
      await api.post('/projects', form);
      setForm(emptyProject);
      await load();
      await reloadShellData?.();
      setToast({ type:'success', message:'Project created successfully' });
    } catch (error) {
      setToast({ type:'error', message:error.response?.data?.message || 'Project creation failed' });
    }
  }

  const developers = users.filter((user) => user.role === 'DEVELOPER');
  const stakeholders = users.filter((user) => user.role === 'STAKEHOLDER');

  return (
    <div className="page projects-page">
      <div className="page-title"><div><h1>Project Portfolio</h1><p>Create Agile projects and monitor their risk health.</p></div></div>
      <div className="view-grid">
        <Panel title="Create Project" subtitle="Project managers can define scope, team and stakeholder visibility." className="wide">
          <form className="form-grid" onSubmit={createProject}>
            <label>Project Name<input value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} placeholder="AI Risk Management System" /></label>
            <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status:e.target.value })}><option>PLANNING</option><option>ACTIVE</option><option>ON_HOLD</option><option>COMPLETED</option></select></label>
            <label>Budget<input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget:Number(e.target.value) })} /></label>
            <label>Start Date<input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate:e.target.value })} /></label>
            <label>End Date<input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate:e.target.value })} /></label>
            <label className="span-3">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description:e.target.value })} placeholder="Proactive risk management system for Agile projects." /></label>
            <div className="check-group"><b>Developers</b>{developers.map((user) => <label key={user._id}><input type="checkbox" checked={form.team.includes(user._id)} onChange={() => toggleUser('team', user._id)} />{user.name}</label>)}</div>
            <div className="check-group"><b>Stakeholders</b>{stakeholders.map((user) => <label key={user._id}><input type="checkbox" checked={form.stakeholders.includes(user._id)} onChange={() => toggleUser('stakeholders', user._id)} />{user.name}</label>)}</div>
            <button className="button primary" type="submit">＋ Add Project</button>
          </form>
        </Panel>

        <Panel title="Projects" className="wide">
          <div className="portfolio-grid">
            {projects.map((project) => {
              const data = stats[project._id] || {};
              const completion = pct(data.completedTasks, data.totalTasks);
              return (
                <article className="portfolio-item" key={project._id}>
                  <div className="portfolio-heading"><div><h3>{project.name}</h3><p>{project.description}</p></div><StatusPill value={project.status} /></div>
                  <div className="portfolio-progress"><span>Completion</span><strong>{completion}%</strong><ProgressBar value={completion} tone={completion < 60 ? 'amber' : 'teal'} /></div>
                  <div className="portfolio-metrics"><span>{data.totalTasks || 0} tasks</span><span>{data.openRisks || 0} open risks</span><span>{data.criticalRisks || 0} critical</span><span>Budget: ${Number(project.budget || 0).toLocaleString()}</span></div>
                  <div className="portfolio-actions"><Link className="button primary" to={`/dashboard/${project._id}`}>Dashboard</Link><Link className="button secondary" to={`/projects/${project._id}`}>Sprint Board</Link><Link className="button secondary" to={`/risks/${project._id}`}>Risks</Link></div>
                </article>
              );
            })}
            {!projects.length && <p className="empty">No projects yet. Create your first project.</p>}
          </div>
        </Panel>
      </div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
