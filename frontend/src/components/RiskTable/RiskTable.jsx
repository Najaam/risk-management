import React from 'react';
import StatusPill from '../StatusPill/StatusPill.jsx';
import './RiskTable.css';

function pct(value) { return `${Math.round(Number(value || 0) * 100)}%`; }

export default function RiskTable({ risks = [], compact = false, onStatus, onDelete }) {
  if (!risks.length) return <p className="empty">No risks found. Run AI Scan or create a manual risk.</p>;
  return (
    <div className="table-wrap risk-table-wrap">
      <table className="risk-table">
        <thead>
          <tr>
            <th>Risk</th><th>Category</th><th>Probability</th><th>Impact</th><th>Exposure</th><th>Priority</th>{!compact && <th>RMMM</th>}{!compact && <th>Status</th>}{!compact && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk._id}>
              <td className="risk-main"><b>{risk.title}</b>{risk.description && <p>{risk.description}</p>}</td>
              <td><StatusPill value={risk.category} /></td>
              <td>{pct(risk.probability)}</td>
              <td>{risk.impact}/5</td>
              <td>{Number(risk.exposure || 0).toLocaleString()}</td>
              <td><StatusPill value={risk.priority} /></td>
              {!compact && <td className="rmmm"><b>Mitigate:</b> {risk.mitigationPlan || 'Not set'}<br/><b>Monitor:</b> {risk.monitoringApproach || 'Not set'}<br/><b>Manage:</b> {risk.managementPlan || 'Not set'}</td>}
              {!compact && <td><StatusPill value={risk.status} /></td>}
              {!compact && <td><div className="risk-actions"><button className="button secondary" onClick={() => onStatus?.(risk._id, 'MITIGATING')} type="button">Mitigate</button><button className="button secondary" onClick={() => onStatus?.(risk._id, 'CLOSED')} type="button">Close</button><button className="button danger" onClick={() => onDelete?.(risk._id)} type="button">Delete</button></div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
