import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { ArrowUpRight } from 'lucide-react';

export default function AlertsView({ onSelectAlert }) {
  const [alerts, setAlerts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAlerts = () => {
    setLoading(true);
    api.getAlerts({
      status: statusFilter,
      severity: severityFilter,
      limit: 100,
    })
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const statuses = [
    { label: 'All Alerts', val: '' },
    { label: 'Pending Review', val: 'PENDING' },
    { label: 'Under Investigation', val: 'UNDER_INVESTIGATION' },
    { label: 'Confirmed Fraud', val: 'CONFIRMED_FRAUD' },
    { label: 'False Positives', val: 'FALSE_POSITIVE' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Compliance Alert Workbench</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Triage suspicious activity detections, inspect explainability attributions, and document enforcement actions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
        {/* Status Pill Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', paddingBottom: '2px' }}>
          {statuses.map(st => (
            <button
              key={st.val}
              onClick={() => setStatusFilter(st.val)}
              className="btn"
              style={{
                fontSize: '13px',
                padding: '6px 14px',
                background: statusFilter === st.val ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                color: statusFilter === st.val ? '#000' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                fontWeight: statusFilter === st.val ? '700' : '500',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Severity:</span>
          <select
            className="select"
            style={{ width: '140px' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Sender (Originator)</th>
                <th>Beneficiary (Recipient)</th>
                <th>Status</th>
                <th>Assigned Officer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>Loading alerts...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>No matching alerts found.</td></tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>#{a.id}</td>
                    <td>
                      <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono', color: a.risk_score >= 0.7 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                        {(a.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td><RiskBadge level={a.severity} /></td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{a.transaction?.type || 'TRANSFER'}</td>
                    <td style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>
                      ₹{a.transaction?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{a.transaction?.name_orig || 'N/A'}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{a.transaction?.name_dest || 'N/A'}</td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        background:
                          a.status === 'CONFIRMED_FRAUD' ? 'rgba(239, 68, 68, 0.2)' :
                          a.status === 'FALSE_POSITIVE' ? 'rgba(16, 185, 129, 0.2)' :
                          a.status === 'UNDER_INVESTIGATION' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                        color:
                          a.status === 'CONFIRMED_FRAUD' ? '#FCA5A5' :
                          a.status === 'FALSE_POSITIVE' ? '#6EE7B7' :
                          a.status === 'UNDER_INVESTIGATION' ? '#FDE68A' : 'var(--text-muted)',
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{a.assigned_to || 'Unassigned'}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => onSelectAlert(a)}
                      >
                        Investigate <ArrowUpRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
