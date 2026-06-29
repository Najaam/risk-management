import React from 'react';
import './StatusPill.css';

function key(value) { return String(value || '').toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-'); }
export default function StatusPill({ value }) { return <span className={`pill ${key(value)}`}>{String(value || 'N/A').replace(/_/g, ' ')}</span>; }
