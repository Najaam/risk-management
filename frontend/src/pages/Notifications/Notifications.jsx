import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import Panel from '../../components/Panel/Panel.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './Notifications.css';

export default function Notifications() {
  const { notifications, setNotifications, reloadShellData } = useOutletContext();
  const [toast, setToast] = useState(null);

  async function load() { const { data } = await api.get('/notifications'); setNotifications(data || []); }
  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Could not load notifications' })); }, []);

  async function markRead(id) {
    try { await api.patch(`/notifications/${id}/read`); await load(); await reloadShellData?.(); }
    catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Could not mark notification' }); }
  }

  return (
    <div className="page notifications-page">
      <div className="page-title"><div><h1>Notifications</h1><p>Alerts generated when risks are detected or require stakeholder attention.</p></div></div>
      <Panel title="Recent Alerts" className="wide">
        <div className="notification-list">{notifications.map((item) => <article className={`notification-row ${item.read ? 'read' : ''}`} key={item._id}><div className="notification-icon">🔔</div><div><strong>{item.title}</strong><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>{!item.read ? <button className="button secondary" onClick={() => markRead(item._id)} type="button">Mark read</button> : <span className="read-label">Read</span>}</article>)}{!notifications.length && <p className="empty">No notifications yet.</p>}</div>
      </Panel>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
