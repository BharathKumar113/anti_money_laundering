import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'cyan', highlight = false }) {
  const colorMap = {
    cyan: 'var(--accent-cyan)',
    rose: 'var(--accent-rose)',
    amber: 'var(--accent-amber)',
    emerald: 'var(--accent-emerald)',
    blue: 'var(--accent-blue)',
    purple: 'var(--accent-purple)'
  };

  const accent = colorMap[color] || 'var(--accent-cyan)';

  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      borderColor: highlight ? accent : 'var(--border-color)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {subtext}
          </div>
        )}
      </div>

      {Icon && (
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '10px',
          background: `${accent}1A`, // 10% opacity
          border: `1px solid ${accent}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent
        }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}
