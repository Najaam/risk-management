import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Panel from '../../components/Panel/Panel.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './Users.css';

const blankUser = { name:'', email:'', password:'password123', role:'DEVELOPER', skills:'', weeklyCapacityHours:40 };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(blankUser);
  const [toast, setToast] = useState(null);

  async function load() { const { data } = await api.get('/users'); setUsers(data || []); }
  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Could not load users' })); }, []);

  async function createUser(event) {
    event.preventDefault();
    if (!form.name || !form.email) return setToast({ type:'error', message:'Name and email are required' });
    try {
      await api.post('/users', { ...form, skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean) });
      setForm(blankUser); await load(); setToast({ type:'success', message:'User created' });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'User creation failed' }); }
  }

  return (
    <div className="page users-page">
      <div className="page-title"><div><h1>User Management</h1><p>Manage project managers, developers and stakeholders.</p></div></div>
      <div className="view-grid">
        <Panel title="Create User" className="wide">
          <form className="form-grid" onSubmit={createUser}>
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} placeholder="Team Member" /></label>
            <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email:e.target.value })} placeholder="member@riskpro.com" /></label>
            <label>Password<input value={form.password} onChange={(e) => setForm({ ...form, password:e.target.value })} /></label>
            <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role:e.target.value })}><option>PROJECT_MANAGER</option><option>DEVELOPER</option><option>STAKEHOLDER</option></select></label>
            <label>Capacity Hours<input type="number" value={form.weeklyCapacityHours} onChange={(e) => setForm({ ...form, weeklyCapacityHours:Number(e.target.value) })} /></label>
            <label>Skills<input value={form.skills} onChange={(e) => setForm({ ...form, skills:e.target.value })} placeholder="React, Node.js" /></label>
            <button className="button primary" type="submit">＋ Add User</button>
          </form>
        </Panel>
        <Panel title="Team Directory" className="wide">
          <div className="user-grid">{users.map((user) => <article className="user-item" key={user._id}><div><h3>{user.name}</h3><p>{user.email}</p></div><StatusPill value={user.role} /><span>{user.weeklyCapacityHours || 0}h capacity</span><small>{(user.skills || []).join(', ') || 'No skills added'}</small></article>)}{!users.length && <p className="empty">No users found.</p>}</div>
        </Panel>
      </div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
