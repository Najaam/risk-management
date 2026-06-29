import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ value = 0, tone = 'teal' }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return <div className="progress" aria-label={`${safeValue}%`}><span className={tone} style={{ width: `${safeValue}%` }} /></div>;
}
