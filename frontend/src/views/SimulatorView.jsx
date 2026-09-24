import React, { useState } from 'react';
import { api } from '../services/api';
import { PlayCircle, UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet, ArrowRight } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import ShapChart from '../components/ShapChart';

export default function SimulatorView() {
  const [formData, setFormData] = useState({
    step: 1,
    type: 'TRANSFER',
    amount: 350000.0,
    name_orig: 'C_SIM_SENDER',
    old_balance_orig: 350000.0,
    new_balance_orig: 0.0,
    name_dest: 'C_SIM_MULE',
    old_balance_dest: 0.0,
    new_balance_dest: 350000.0,
  });

  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // CSV upload state
  const [csvFile, setCsvFile] = useState(null);
  const [maxRows, setMaxRows] = useState(500);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const applyPreset = (preset) => {
    if (preset === 'drain') {
      setFormData({
        step: 3,
        type: 'TRANSFER',
        amount: 450000.0,
        name_orig: 'C_VICTIM_ACCOUNT',
        old_balance_orig: 450000.0,
        new_balance_orig: 0.0,
        name_dest: 'C_MULE_CASHOUT',
        old_balance_dest: 0.0,
        new_balance_dest: 450000.0,
      });
    } else if (preset === 'smurfing') {
      setFormData({
        step: 4,
        type: 'TRANSFER',
        amount: 9850.0,
        name_orig: 'C_SMURF_MASTER',
        old_balance_orig: 80000.0,
        new_balance_orig: 70150.0,
        name_dest: 'C_SMURF_MULE_1',
        old_balance_dest: 20.0,
        new_balance_dest: 9870.0,
      });
    } else if (preset === 'normal') {
      setFormData({
        step: 1,
        type: 'PAYMENT',
        amount: 1500.0,
        name_orig: 'C_REGULAR_USER',
        old_balance_orig: 15000.0,
        new_balance_orig: 13500.0,
        name_dest: 'M_SUPERMARKET',
        old_balance_dest: 0.0,
        new_balance_dest: 0.0,
      });
    }
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await api.createTransaction(formData);
      setSimResult(res);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setUploading(true);
    try {
      const res = await api.uploadCSV(csvFile, maxRows);
      setUploadResult(res);
    } catch (err) {
      alert(`CSV Ingestion error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
          PaySim Dataset Ingestion & Live Transaction Simulator
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Batch-ingest PaySim CSV financial records or execute real-time inference on arbitrary transaction inputs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* CSV Batch Uploader Card */}
        <div className="card" style={{ borderTop: '3px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Batch PaySim CSV Ingestion</h3>
              <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: '600' }}>Direct Streaming Pipeline</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
            Upload raw PaySim CSV datasets (with standard columns: <code>step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, nameDest, oldbalanceDest, newbalanceDest</code>).
          </p>

          <form onSubmit={handleUploadCSV} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '10px', padding: '16px', textAlign: 'center', background: 'var(--bg-secondary)' }}>
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                style={{ display: 'none' }}
                onChange={(e) => setCsvFile(e.target.files[0] || null)}
              />
              <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={32} color="var(--accent-cyan)" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {csvFile ? csvFile.name : 'Select or drop PaySim CSV file'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Supports .csv files up to thousands of financial rows
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Max rows to stream:</label>
              <input
                type="number"
                className="input"
                style={{ width: '120px' }}
                value={maxRows}
                onChange={(e) => setMaxRows(Number(e.target.value))}
                min={10}
                max={5000}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading || !csvFile} style={{ width: '100%', height: '40px' }}>
              <UploadCloud size={16} /> {uploading ? 'Processing & Scoring Transactions...' : 'Upload & Ingest CSV'}
            </button>
          </form>

          {uploadResult && (
            <div style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#6EE7B7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                <CheckCircle2 size={16} /> Batch Ingestion Complete
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Ingested and evaluated <strong>{uploadResult.processed_rows}</strong> transactions across all active ML plugins.
              </div>
            </div>
          )}
        </div>

        {/* Live Transaction Simulator Form */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Manual Transaction Simulator</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0 }}>Test live ensemble reaction to specific parameters</p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => applyPreset('drain')}>
                Drain Fraud
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => applyPreset('smurfing')}>
                Smurfing
              </button>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => applyPreset('normal')}>
                Normal
              </button>
            </div>
          </div>

          <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Transaction Type</label>
                <select className="select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="CASH_OUT">CASH_OUT</option>
                  <option value="PAYMENT">PAYMENT</option>
                  <option value="CASH_IN">CASH_IN</option>
                  <option value="DEBIT">DEBIT</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Sender Account</label>
                <input className="input" value={formData.name_orig} onChange={(e) => setFormData({ ...formData, name_orig: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Old Balance (₹)</label>
                <input type="number" step="0.01" className="input" value={formData.old_balance_orig} onChange={(e) => setFormData({ ...formData, old_balance_orig: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>New Balance (₹)</label>
                <input type="number" step="0.01" className="input" value={formData.new_balance_orig} onChange={(e) => setFormData({ ...formData, new_balance_orig: parseFloat(e.target.value) || 0 })} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Recipient Account</label>
                <input className="input" value={formData.name_dest} onChange={(e) => setFormData({ ...formData, name_dest: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Old Balance (₹)</label>
                <input type="number" step="0.01" className="input" value={formData.old_balance_dest} onChange={(e) => setFormData({ ...formData, old_balance_dest: parseFloat(e.target.value) || 0 })} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>New Balance (₹)</label>
                <input type="number" step="0.01" className="input" value={formData.new_balance_dest} onChange={(e) => setFormData({ ...formData, new_balance_dest: parseFloat(e.target.value) || 0 })} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={simulating} style={{ marginTop: '6px', height: '40px' }}>
              <PlayCircle size={16} /> {simulating ? 'Evaluating Across 4 Models...' : 'Evaluate Transaction Risk'}
            </button>
          </form>
        </div>
      </div>

      {/* Simulation Live Output Box */}
      {simResult && (
        <div className="card" style={{ borderLeft: simResult.is_suspicious ? '4px solid var(--accent-rose)' : '4px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>Multi-Model Scoring Output</h3>
                <RiskBadge level={simResult.risk_level} score={simResult.risk_score} />
                <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  {simResult.is_suspicious ? 'ALERT CASE SPAWNED' : 'CLEARED NORMAL'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
                Transaction ID: {simResult.id} • Amount: ₹{simResult.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Model Breakdown */}
          {simResult.plugin_scores && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '14px' }}>
              {Object.entries(simResult.plugin_scores).map(([name, p]) => (
                <div key={name} style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{name}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: p.is_suspicious ? 'var(--accent-rose)' : 'var(--accent-emerald)', marginTop: '2px' }}>
                    {(p.risk_score * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    {p.is_suspicious ? 'Flagged Suspicious' : 'Legitimate'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reasons */}
          {simResult.flag_reasons && simResult.flag_reasons.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#FCA5A5', marginBottom: '6px', textTransform: 'uppercase' }}>
                Flagged Fraud Indicators:
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#FCA5A5' }}>
                {simResult.flag_reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* SHAP Chart */}
          {simResult.shap_values && Object.keys(simResult.shap_values).length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                SHAP Feature Attribution (Explainable AI):
              </h4>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                <ShapChart shapValues={simResult.shap_values} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
