import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Activity, GitBranch, Database, Sliders, UploadCloud } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    const checkStatus = () => {
      api.getReadiness()
        .then(setReadiness)
        .catch(() => setReadiness({ status: 'offline', database_connected: false, active_plugins_count: 0 }));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'alerts', label: 'Alerts Triage', icon: ShieldCheck },
    { id: 'transactions', label: 'Transactions', icon: Database },
    { id: 'graph', label: 'Network Graph', icon: GitBranch },
    { id: 'plugins', label: 'ML Plugins', icon: Sliders },
    { id: 'simulator', label: 'CSV Ingest & Test', icon: UploadCloud },
  ];

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 24px'
    }}>
      <div className="navbar-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '72px',
        maxWidth: '1440px',
        margin: '0 auto',
        gap: '16px'
      }}>
        {/* Brand & Requested Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 auto', minWidth: 0 }}>
          <div style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={24} color="#FFF" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              fontWeight: '700',
              letterSpacing: '-0.01em',
              color: 'var(--text-main)',
              lineHeight: 1.3,
              margin: 0
            }}>
              Enhancing Anti-Money Laundering Detection through Machine Learning and Graph-Based Analytics
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>Enterprise AML Intelligence</span>
              <span>•</span>
              <span>Multi-Model Detection & Graph Link Topology</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Production Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-card)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: readiness?.database_connected ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              boxShadow: readiness?.database_connected ? '0 0 8px var(--accent-emerald)' : '0 0 8px var(--accent-rose)'
            }} />
            <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              {readiness?.database_connected ? `Live Monitoring (${readiness.active_plugins_count} Engines)` : 'Engine Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
