import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import MetricCard from '../../components/MetricCard/MetricCard.jsx';
import Panel from '../../components/Panel/Panel.jsx';
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx';
import StatusPill from '../../components/StatusPill/StatusPill.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './AiAnalyzer.css';

const initialForm = { overdueTasks:3, bugCount:5, overloadedMembers:1, velocityProgress:55, taskCompletion:48, blockerCount:2, wipCount:8, openTasks:15, storyPointsDone:24, storyPointsCommitted:58 };

export default function AiAnalyzer() {
  const { projectId } = useParams();
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  async function predict(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/predict', form);
      setPrediction(data);
      setToast({ type:'success', message:'Prediction completed' });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Prediction failed' }); }
    finally { setLoading(false); }
  }

  async function scanProject() {
    try {
      const { data } = await api.post(`/risks/analyze/${projectId}`);
      setToast({ type:'success', message:`Project scan created ${data.created?.length || 0} new risk(s)` });
    } catch (error) { setToast({ type:'error', message:error.response?.data?.message || 'Project scan failed' }); }
  }

  return (
    <div className="page ai-page">
      <div className="page-title"><div><h1>AI Risk Analyzer</h1><p>Rule-based intelligent prediction for schedule, quality, resource and delay risks.</p></div><div className="actions"><button className="button primary" onClick={scanProject} type="button">✦ Scan Current Project</button><Link className="button secondary" to={`/risks/${projectId}`}>Risk Register</Link></div></div>
      <div className="view-grid">
        <Panel title="Prediction Inputs" subtitle="Change values to simulate Agile risk indicators." className="wide">
          <form className="predict-grid" onSubmit={predict}>
            {Object.entries(form).map(([key, value]) => <label key={key}>{key.replace(/([A-Z])/g, ' $1')}<input type="number" value={value} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} /></label>)}
            <button className="button primary" disabled={loading} type="submit">{loading ? 'Analyzing...' : 'Predict Risk'}</button>
          </form>
        </Panel>
        {prediction ? <>
          <div className="metrics-grid wide">
            <MetricCard icon="✦" label="Predicted Category" value={prediction.category} detail={prediction.title} tone="purple" />
            <MetricCard icon="%" label="Probability" value={`${Math.round(prediction.probability * 100)}%`} detail="Estimated likelihood" tone="warning" />
            <MetricCard icon="!" label="Impact" value={`${prediction.impact}/5`} detail="Impact score" tone="danger" />
            <MetricCard icon="◇" label="Severity" value={prediction.severity} detail="Priority level" tone="info" />
          </div>
          <Panel title="Probability Distribution">
            <div className="probabilities">{Object.entries(prediction.probabilities || {}).sort((a,b)=>b[1]-a[1]).map(([label,value]) => <div className="bar-row" key={label}><div className="bar-label"><span>{label}</span><strong>{Math.round(value*100)}%</strong></div><ProgressBar value={value*100} tone={label === prediction.category ? 'amber' : 'blue'} /></div>)}</div>
          </Panel>
          <Panel title="Mitigation Recommendation" action={<StatusPill value={prediction.severity} />}>
            <div className="ai-recommendation"><h3>{prediction.title}</h3><p><b>Mitigation:</b> {prediction.mitigationPlan}</p><p><b>Monitoring:</b> {prediction.monitoringApproach}</p><p><b>Management:</b> {prediction.managementPlan}</p></div>
          </Panel>
        </> : <Panel title="Result" className="wide"><p className="empty">Enter indicators and press Predict Risk.</p></Panel>}
      </div>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
