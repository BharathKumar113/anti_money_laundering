import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldX, UserCheck } from 'lucide-react';
import RiskBadge from './RiskBadge';
import ShapChart from './ShapChart';
import { api } from '../services/api';

export default function AlertModal({ alert, onClose, onUpdated }) {
  const [notes, setNotes] = useState(alert.investigator_notes || '');
  const [assignedTo, setAssignedTo] = useState(alert.assigned_to || 'compliance_officer');
  const [loading, setLoading] = useState(false);

  if (!alert) return null;
  const tx = alert.transaction;

  const handleAction = async (newStatus) => {
    setLoading(true);
    try {
      await api.updateAlert(alert.id, {
        status: newStatus,
        investigator_notes: notes,
        assigned_to: assignedTo,
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Case Assessment #{alert.id}</h3>
              <RiskBadge level={alert.severity} score={alert.risk_score} />
              <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Status: {alert.status}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Transaction ID: <span style={{ fontFamily: 'JetBrains Mono' }}>{alert.transaction_id}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Transaction Summary Card */}
        {tx && (
          <div style={{ marginTop: '16px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
              TRANSACTION PARAMETERS
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>Type</span>
                <span style={{ fontWeight: '700', color: 'var(--accent-cyan)' }}>{tx.type}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>Amount</span>
                <span style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'JetBrains Mono' }}>
                  ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>Originator</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{tx.name_orig}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '11px' }}>Recipient</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>{tx.name_dest}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Originator Balance: </span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>₹{tx.old_balance_orig.toLocaleString('en-IN')} → ₹{tx.new_balance_orig.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Recipient Balance: </span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>₹{tx.old_balance_dest.toLocaleString('en-IN')} → ₹{tx.new_balance_dest.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Flag Reasons */}
        {tx?.flag_reasons && tx.flag_reasons.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>
              <AlertTriangle size={15} /> Suspicious Indicators Detected ({tx.flag_reasons.length})
            </h4>
            <ul style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '10px 20px', listStyleType: 'disc', fontSize: '12px' }}>
              {tx.flag_reasons.map((r, i) => (
                <li key={i} style={{ marginBottom: '3px', color: '#FCA5A5' }}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* SHAP Feature Explainability Chart */}
        {tx?.shap_values && (
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              SHAP Feature Attribution (Explainable AI)
            </h4>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px' }}>
              <ShapChart shapValues={tx.shap_values} />
            </div>
          </div>
        )}

        {/* Investigator Triage Form */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Enforcement & Compliance Determination
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Assigned Compliance Officer</label>
              <input
                className="input"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Case Notes / Justification</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Enter justification or SAR reference..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleAction('UNDER_INVESTIGATION')}
              disabled={loading}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <UserCheck size={14} /> Mark Under Review
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleAction('CONFIRMED_FRAUD')}
              disabled={loading}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <ShieldX size={14} /> Confirm Money Laundering
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleAction('FALSE_POSITIVE')}
              disabled={loading}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <CheckCircle2 size={14} /> Clear as False Positive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
