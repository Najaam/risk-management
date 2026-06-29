import React from 'react';
import './RiskBadge.css';
export default function RiskBadge({value}){return <span className={`risk-badge ${String(value).toLowerCase()}`}>{value}</span>}
