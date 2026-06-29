import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import MetricCard from '../../components/MetricCard/MetricCard.jsx';
import Panel from '../../components/Panel/Panel.jsx';
import RiskTable from '../../components/RiskTable/RiskTable.jsx';
import Toast from '../../components/Toast/Toast.jsx';
import './Reports.css';

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

export default function Reports() {
  const { projectId } = useParams();
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);

  async function load() { const { data } = await api.get(`/reports/project/${projectId}`); setReport(data); }
  useEffect(() => { load().catch((error) => setToast({ type:'error', message:error.response?.data?.message || 'Report load failed' })); }, [projectId]);

  function exportJson() { download(`${report.project.name}-risk-report.json`, JSON.stringify(report, null, 2), 'application/json'); }
  function exportCsv() {
    const rows = [['Title','Category','Probability','Impact','Exposure','Priority','Status','Mitigation']];
    report.risks.forEach((r) => rows.push([r.title,r.category,r.probability,r.impact,r.exposure,r.priority,r.status,r.mitigationPlan]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    download(`${report.project.name}-risk-register.csv`, csv, 'text/csv');
  }

  if (!report) return <p className="empty">Loading report...</p>;

  return (
    <div className="page reports-page">
      <div className="page-title"><div><h1>Project Report</h1><p>Management summary for project risks, exposure and mitigation.</p></div><div className="actions"><button className="button secondary" onClick={exportJson} type="button">Download JSON</button><button className="button primary" onClick={exportCsv} type="button">Download CSV</button></div></div>
      <div className="report-header"><h2>{report.project.name}</h2><p>{report.project.description}</p></div>
      <div className="metrics-grid">
        <MetricCard icon="▤" label="Tasks" value={report.summary.tasks} detail={`${report.summary.done} completed`} tone="info" />
        <MetricCard icon="✓" label="Done" value={report.summary.done} detail="Completed backlog items" tone="success" />
        <MetricCard icon="◇" label="Open Risks" value={report.summary.openRisks} detail="Not closed yet" tone="danger" />
        <MetricCard icon="$" label="Exposure" value={Number(report.summary.totalRiskExposure || 0).toFixed(1)} detail="Total risk exposure" tone="warning" />
      </div>
      <Panel title="Risk Register Snapshot" className="wide"><RiskTable risks={report.risks || []} compact /></Panel>
      <Panel title="Conclusion" className="wide"><p className="report-conclusion">This report supports proactive risk management by connecting Agile sprint data with risk identification, projection, RMMM planning and stakeholder visibility.</p></Panel>
      <Toast {...(toast || {})} onClose={() => setToast(null)} />
    </div>
  );
}
