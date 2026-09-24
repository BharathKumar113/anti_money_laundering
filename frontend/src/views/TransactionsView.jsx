import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import ShapChart from '../components/ShapChart';

export default function TransactionsView() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [accountQuery, setAccountQuery] = useState('');
  const [suspiciousFilter, setSuspiciousFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchTxs = () => {
    setLoading(true);
    api.getTransactions({
      page,
      page_size: 15,
      tx_type: typeFilter,
      risk_level: riskFilter,
      account_id: accountQuery,
      is_suspicious: suspiciousFilter === '' ? undefined : suspiciousFilter === 'true',
    })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTxs();
  }, [page, typeFilter, riskFilter, suspiciousFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTxs();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Transaction Surveillance Ledger</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Query, filter, and inspect scored transactions processed through the multi-plugin AML pipeline.
        </p>
      </div>

      {/* Filter Toolbar */}
      <form onSubmit={handleSearchSubmit} className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr)) 110px', gap: '12px', alignItems: 'end', padding: '14px 18px' }}>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Account ID</label>
          <input
            className="input"
            placeholder="e.g. C_SMURF_BOSS"
            value={accountQuery}
            onChange={(e) => setAccountQuery(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Type</label>
          <select className="select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="TRANSFER">TRANSFER</option>
            <option value="CASH_OUT">CASH_OUT</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="CASH_IN">CASH_IN</option>
            <option value="DEBIT">DEBIT</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Risk Level</label>
          <select className="select" value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}>
            <option value="">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Status Flag</label>
          <select className="select" value={suspiciousFilter} onChange={(e) => { setSuspiciousFilter(e.target.value); setPage(1); }}>
            <option value="">All Transactions</option>
            <option value="true">Suspicious Only</option>
            <option value="false">Legitimate Only</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
          <Search size={15} /> Filter
        </button>
      </form>

      {/* Transactions Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Step</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Sender (Originator)</th>
                <th>Origin Balance (₹)</th>
                <th>Beneficiary (Recipient)</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>Loading transactions...</td></tr>
              ) : data.items.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>No transactions found.</td></tr>
              ) : (
                data.items.map(tx => (
                  <tr key={tx.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedTx(tx)}>
                    <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-dim)' }}>{tx.step}</td>
                    <td style={{ fontWeight: '700', color: tx.type === 'TRANSFER' || tx.type === 'CASH_OUT' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{tx.type}</td>
                    <td style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{tx.name_orig}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>
                      ₹{tx.old_balance_orig.toLocaleString('en-IN')} → ₹{tx.new_balance_orig.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{tx.name_dest}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', color: tx.risk_score >= 0.5 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                        {(tx.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td><RiskBadge level={tx.risk_level} /></td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            Page <strong>{page}</strong> of <strong>{data.pages || 1}</strong> ({data.total} total transactions)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              <ChevronLeft size={15} /> Prev
            </button>
            <button className="btn btn-secondary" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="modal-backdrop" onClick={() => setSelectedTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Transaction Analysis</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>{selectedTx.id}</div>
              </div>
              <RiskBadge level={selectedTx.risk_level} score={selectedTx.risk_score} />
            </div>

            {/* Per-Plugin Breakdown */}
            {selectedTx.plugin_scores && (
              <div style={{ marginTop: '18px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Multi-Model Detection Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {Object.entries(selectedTx.plugin_scores).map(([name, p]) => (
                    <div key={name} style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-cyan)' }}>{name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Type: {p.model_type} • v{p.version}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px', fontWeight: '700' }}>
                        <span>Risk:</span>
                        <span style={{ color: p.is_suspicious ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>
                          {(p.risk_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHAP Chart */}
            {selectedTx.shap_values && (
              <div style={{ marginTop: '18px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  SHAP Explainability Attributions
                </h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px' }}>
                  <ShapChart shapValues={selectedTx.shap_values} />
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
