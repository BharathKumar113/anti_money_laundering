import React from 'react';

export default function RiskBadge({ level, score }) {
  const normalizedLevel = (level || 'LOW').toUpperCase();
  
  let className = 'badge badge-low';
  if (normalizedLevel === 'CRITICAL') className = 'badge badge-critical';
  else if (normalizedLevel === 'HIGH') className = 'badge badge-high';
  else if (normalizedLevel === 'MEDIUM') className = 'badge badge-medium';

  return (
    <span className={className}>
      {normalizedLevel}
      {score !== undefined && score !== null && ` (${(score * 100).toFixed(0)}%)`}
    </span>
  );
}
