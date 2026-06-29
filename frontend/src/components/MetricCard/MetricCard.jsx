import React from 'react';
import './MetricCard.css';

export default function MetricCard({ icon = '●', label, value, detail, tone = 'neutral' }) {
  return (
    <div className={`metric ${tone}`}>
      <div className="metric-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </div>
  );
}
