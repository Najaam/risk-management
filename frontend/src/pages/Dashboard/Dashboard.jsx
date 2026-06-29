import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import MetricCard from '../../components/MetricCard/MetricCard.jsx';
import Panel from '../../components/Panel/Panel.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import RiskTable from '../../components/RiskTable/RiskTable.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './Dashboard.css';

function percent(value) { return `${Math.round(Number(value || 0))}%`; }
function countDone(tasks) { return tasks.filter((task) => task.status === 'DONE').length; }
function barEntries(obj = {}) { return Object.entries(obj).sort((a, b) => b[1] - a[1]); }

export default function Dashboard() {
  const { projectId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [project, setProject] = useState(null);
  const [risks, setRisks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const [dashRes, projectRes, riskRes, taskRes] = await Promise.all([
      api.get(`/dashboard/${projectId}`), api.get(`/projects/${projectId}`), api.get(`/risks/project/${projectId}`), api.get(`/tasks?project=${projectId}`)
    ]);
    setDashboard(dashRes.data); setProject(projectRes.data); setRisks(riskRes.data || []); setTasks(taskRes.data || []);
  }

  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Dashboard load failed' })); }, [projectId]);

  const taskCompletion = useMemo(() => tasks.length ? (countDone(tasks) / tasks.length) * 100 : 0, [tasks]);
  const activeSprint = dashboard?.sprintVelocity?.find((sprint) => sprint.completed < sprint.target) || dashboard?.sprintVelocity?.[0];
  const velocity = activeSprint?.target ? (activeSprint.completed / activeSprint.target) * 100 : 0;
  const highestRisks = [...risks].sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact)).slice(0, 5);

  async function runScan() {
    setLoading(true);
    try {
      const { data } = await api.post(`/risks/analyze/${projectId}`);
      await load();
      setToast({ type:'success', message:`AI scan completed. ${data.created?.length || 0} new risk(s) created.` });
    } catch (error) {
      setToast({ type:'error', message:error.response?.data?.message || 'AI scan failed' });
    } finally { setLoading(false); }
  }

  if (!dashboard || !project) return <p className="empty">Loading dashboard...</p>;

  return (
    <div className="page dashboard-page">
      <div className="page-title"><div><h1>{project.name}</h1><p>{project.description}</p></div><div className="actions"><button className="button primary" disabled={loading} onClick={runScan} type="button">✦ Run AI Scan</button><Link className="button secondary" to={`/reports/${projectId}`}>View Report</Link></div></div>

      <div className="metrics-grid">
        <MetricCard icon="◇" label="Open Risks" value={dashboard.openRisks} detail={`${dashboard.criticalRisks} critical risks`} tone="danger" />
        <MetricCard icon="▦" label="Sprint Velocity" value={percent(velocity)} detail="Completed vs target points" tone="info" />
        <MetricCard icon="✓" label="Task Completion" value={percent(taskCompletion)} detail={`${dashboard.completedTasks}/${dashboard.totalTasks} tasks done`} tone="success" />
        <MetricCard icon="☷" label="Risk Exposure" value={risks.reduce((sum, risk) => sum + Number(risk.exposure || 0), 0).toFixed(1)} detail="Probability × impact/cost" tone="warning" />
      </div>

      <div className="view-grid">
        <Panel title="Project Health" action={<StatusPill value={project.status} />} className="wide">
          <div className="health-grid">
            <div className="health-item"><span>Task Completion</span><strong>{percent(taskCompletion)}</strong><ProgressBar value={taskCompletion} tone={taskCompletion < 60 ? 'amber' : 'teal'} /></div>
            <div className="health-item"><span>Sprint Velocity</span><strong>{percent(velocity)}</strong><ProgressBar value={velocity} tone={velocity < 75 ? 'amber' : 'teal'} /></div>
            <div className="health-item"><span>Open Risks</span><strong>{dashboard.openRisks}</strong><ProgressBar value={Math.min(100, dashboard.openRisks * 18)} tone={dashboard.openRisks > 5 ? 'red' : 'blue'} /></div>
          </div>
        </Panel>

        <Panel title="Risk Categories">
          <div className="bar-list">{barEntries(dashboard.riskByCategory).map(([label, value]) => <div className="bar-row" key={label}><div className="bar-label"><span>{label}</span><strong>{value}</strong></div><ProgressBar value={dashboard.openRisks ? (value / dashboard.openRisks) * 100 : 0} /></div>)}{!barEntries(dashboard.riskByCategory).length && <p className="empty">No risk categories yet.</p>}</div>
        </Panel>
        <Panel title="Severity Mix">
          <div className="bar-list">{barEntries(dashboard.riskByPriority).map(([label, value]) => <div className="bar-row" key={label}><div className="bar-label"><span>{label}</span><strong>{value}</strong></div><ProgressBar value={dashboard.openRisks ? (value / dashboard.openRisks) * 100 : 0} tone={label === 'CRITICAL' ? 'red' : label === 'HIGH' ? 'amber' : 'teal'} /></div>)}{!barEntries(dashboard.riskByPriority).length && <p className="empty">No severity data yet.</p>}</div>
        </Panel>

        <Panel title="Sprint Velocity" className="wide">
          <div className="sprint-strip">{dashboard.sprintVelocity.map((sprint) => <div className="sprint-line" key={sprint.name}><div><b>{sprint.name}</b><span>{sprint.completed}/{sprint.target} points</span></div><ProgressBar value={sprint.target ? (sprint.completed / sprint.target) * 100 : 0} tone={sprint.completed < sprint.target ? 'amber' : 'teal'} /></div>)}</div>
        </Panel>

        <Panel title="Highest Priority Risks" className="wide" action={<Link className="button secondary" to={`/risks/${projectId}`}>Open Register</Link>}>
          <RiskTable risks={highestRisks} compact />
        </Panel>
      </div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
