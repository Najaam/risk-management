import React from 'react';
import './StatCard.css';
export default function StatCard({label,value}){return <div className='stat-card'><span>{label}</span><strong>{value}</strong></div>}
