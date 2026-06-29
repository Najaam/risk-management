import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Panel from '../../components/Panel/Panel.jsx';
import RiskTable from '../../components/RiskTable/RiskTable.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './RiskRegister.css';

const blankRisk = { title:'', description:'', category:'SCHEDULE', probability:0.5, impact:3, costImpact:0, status:'OPEN', mitigationPlan:'', monitoringApproach:'', managementPlan:'' };

export default function RiskRegister() {
  const { projectId } = useParams();
  const [risks, setRisks] = useState([]);
  const [form, setForm] = useState(blankRisk);
  const [toast, setToast] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  async function load() {
    const { data } = await api.get(`/risks/project/${projectId}`);
    setRisks(data || []);
  }

  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Risk register load failed' })); }, [projectId]);

  async function createRisk(event) {
    event.preventDefault();
    if (!form.title.trim()) return setToast({ type:'error', message:'Risk title is required' });
    try {
      await api.post('/risks', { ...form, project:projectId, probability:Number(form.probability), impact:Number(form.impact), costImpact:Number(form.costImpact) });
      setForm(blankRisk);
      await load();
      setToast({ type:'success', message:'Manual risk added' });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Risk creation failed' }); }
  }

  async function runScan() {
    setScanLoading(true);
    try {
      const { data } = await api.post(`/risks/analyze/${projectId}`);
      await load();
      setToast({ type:'success', message:`AI scan completed. ${data.created?.length || 0} new risk(s) created.` });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'AI scan failed' }); }
    finally { setScanLoading(false); }
  }

  async function updateStatus(id, status) {
    try { await api.put(`/risks/${id}`, { status }); await load(); setToast({ type:'success', message:`Risk moved to ${status}` }); }
    catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Risk update failed' }); }
  }
  async function deleteRisk(id) {
    try { await api.delete(`/risks/${id}`); await load(); setToast({ type:'success', message:'Risk deleted' }); }
    catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Risk delete failed' }); }
  }

  return (
    <div className="page risks-page">
      <div className="page-title"><div><h1>Risk Register</h1><p>Centralized risk log with probability, impact, exposure and RMMM planning.</p></div><button className="button primary" disabled={scanLoading} onClick={runScan} type="button">✦ Run AI Scan</button></div>
      <Panel title="Add Manual Risk" subtitle="Use this for business, customer, technology or process risks not detected automatically." className="wide">
        <form className="form-grid" onSubmit={createRisk}>
          <label className="span-2">Risk Title<input value={form.title} onChange={(e) => setForm({ ...form, title:e.target.value })} placeholder="Hardware delivery may be delayed" /></label>
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category:e.target.value })}>{['SCHEDULE','QUALITY','RESOURCE','DELAY','COST','PERFORMANCE','SUPPORT','BUSINESS','TECHNOLOGY','CUSTOMER','PROCESS'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Probability<input type="number" min="0" max="1" step="0.05" value={form.probability} onChange={(e) => setForm({ ...form, probability:e.target.value })} /></label>
          <label>Impact 1-5<input type="number" min="1" max="5" value={form.impact} onChange={(e) => setForm({ ...form, impact:e.target.value })} /></label>
          <label>Cost Impact<input type="number" min="0" value={form.costImpact} onChange={(e) => setForm({ ...form, costImpact:e.target.value })} /></label>
          <label className="span-3">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description:e.target.value })} /></label>
          <label>Mitigation<input value={form.mitigationPlan} onChange={(e) => setForm({ ...form, mitigationPlan:e.target.value })} placeholder="How can we avoid it?" /></label>
          <label>Monitoring<input value={form.monitoringApproach} onChange={(e) => setForm({ ...form, monitoringApproach:e.target.value })} placeholder="What factors will we track?" /></label>
          <label>Management<input value={form.managementPlan} onChange={(e) => setForm({ ...form, managementPlan:e.target.value })} placeholder="What is the contingency plan?" /></label>
          <button className="button primary" type="submit">＋ Add Risk</button>
        </form>
      </Panel>
      <Panel title="Register" className="wide">
        <RiskTable risks={risks} onStatus={updateStatus} onDelete={deleteRisk} />
      </Panel>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
