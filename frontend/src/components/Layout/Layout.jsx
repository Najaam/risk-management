import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import './Layout.css';

const projectRouteIds = ['dashboard', 'projects/', 'risks', 'reports', 'ai-analyzer'];

function titleFromPath(pathname) {
  if (pathname.includes('/dashboard/')) return ['Dashboard', 'Live project health, risk exposure and sprint progress.'];
  if (pathname.includes('/projects/') && pathname !== '/projects') return ['Sprint Board', 'Sprints, backlog items and task workflow.'];
  if (pathname.includes('/risks/')) return ['Risk Register', 'RMMM plans, priorities, status and AI/manual risks.'];
  if (pathname.includes('/reports/')) return ['Reports', 'Project summary and exportable management view.'];
  if (pathname.includes('/ai-analyzer/')) return ['AI Analyzer', 'Predictive risk scoring from Agile indicators.'];
  if (pathname.includes('/users')) return ['Users', 'Role based project manager, developer and stakeholder accounts.'];
  if (pathname.includes('/notifications')) return ['Notifications', 'Stakeholder alerts generated from risk detection.'];
  return ['Projects', 'Portfolio and project setup.'];
}

function getProjectId(pathname) {
  const match = pathname.match(/\/(dashboard|projects|risks|reports|ai-analyzer)\/([^/]+)/);
  return match?.[2] || '';
}

export default function Layout() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [title, subtitle] = titleFromPath(location.pathname);
  const currentProjectId = getProjectId(location.pathname) || projects[0]?._id || '';
  const unread = notifications.filter((item) => !item.read).length;

  async function loadShellData() {
    try {
      const [projectRes, notificationRes] = await Promise.all([api.get('/projects'), api.get('/notifications')]);
      setProjects(projectRes.data || []);
      setNotifications(notificationRes.data || []);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => { loadShellData(); }, []);

  const activeProject = useMemo(() => projects.find((project) => project._id === currentProjectId), [projects, currentProjectId]);

  function projectLink(base) {
    if (!currentProjectId) return '/projects';
    return `/${base}/${currentProjectId}`;
  }

  function onProjectChange(event) {
    const id = event.target.value;
    if (!id) return navigate('/projects');
    const segment = location.pathname.split('/')[1];
    if (projectRouteIds.some((key) => segment === key.replace('/', ''))) navigate(`/${segment}/${id}`);
    else navigate(`/dashboard/${id}`);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/projects">
          <span className="brand-mark">⚠</span>
          <div><strong>RiskPro</strong><span>AI Risk CASE Tool</span></div>
        </Link>
        <nav>
          <Link className={location.pathname === '/projects' ? 'active' : ''} to="/projects">▣ Projects</Link>
          <Link className={location.pathname.includes('/dashboard/') ? 'active' : ''} to={projectLink('dashboard')}>▦ Dashboard</Link>
          <Link className={location.pathname.includes('/projects/') ? 'active' : ''} to={projectLink('projects')}>▤ Sprint Board</Link>
          <Link className={location.pathname.includes('/risks/') ? 'active' : ''} to={projectLink('risks')}>◇ Risk Register</Link>
          <Link className={location.pathname.includes('/ai-analyzer/') ? 'active' : ''} to={projectLink('ai-analyzer')}>✦ AI Analyzer</Link>
          <Link className={location.pathname.includes('/reports/') ? 'active' : ''} to={projectLink('reports')}>☷ Reports</Link>
          <Link className={location.pathname.includes('/users') ? 'active' : ''} to="/users">☻ Users</Link>
          <Link className={location.pathname.includes('/notifications') ? 'active' : ''} to="/notifications">🔔 Notifications {unread ? <b>{unread}</b> : null}</Link>
        </nav>
        <div className="sidebar-footer">
          <span>Signed in</span>
          <strong>{user?.name}</strong>
          <span>{String(user?.role || '').replace(/_/g, ' ')}</span>
          <button className="logout" onClick={logout} type="button">Logout</button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}{activeProject ? ` Current project: ${activeProject.name}.` : ''}</p>
          </div>
          <div className="topbar-actions">
            <label className="role-select">Project
              <select value={currentProjectId} onChange={onProjectChange}>
                {projects.length === 0 && <option value="">No project</option>}
                {projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}
              </select>
            </label>
            <Link className="icon-button" to="/notifications">🔔{unread ? <span className="count">{unread}</span> : null}</Link>
          </div>
        </header>
        <div className="content"><Outlet context={{ projects, setProjects, reloadShellData: loadShellData, notifications, setNotifications }} /></div>
      </main>
    </div>
  );
}
