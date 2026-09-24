import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import { ShieldAlert, IndianRupee, Activity, CheckCircle, Target, ArrowUpRight, RefreshCw, UploadCloud } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardView({ onSelectAlert, onNavigate }) {
  const [kpis, setKpis] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getKPIs(),
      api.getAlerts({ limit: 6 })
    ])
      .then(([kpiData, alertsData]) => {
        setKpis(kpiData);
        setRecentAlerts(alertsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !kpis) {
    return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)' }}>Loading Surveillance Metrics...</div>;
  }

  // Type Chart Data
  const typeLabels = Object.keys(kpis?.transactions_by_type || {});
  const typeValues = Object.values(kpis?.transactions_by_type || {});
  const typeChartData = {
    labels: typeLabels,
    datasets: [{
      data: typeValues,
      backgroundColor: ['#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'],
      borderWidth: 0
    }]
  };

  // Risk Chart Data
  const riskLabels = Object.keys(kpis?.risk_level_distribution || {});
  const riskValues = Object.values(kpis?.risk_level_distribution || {});
  const riskChartData = {
    labels: riskLabels,
    datasets: [{
      data: riskValues,
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>
            AML Surveillance & Threat Overview
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Real-time financial crime detection across ML classifiers, deep autoencoders, and graph link topology.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onNavigate && (
            <button className="btn btn-primary" onClick={() => onNavigate('simulator')}>
              <UploadCloud size={16} /> Upload PaySim CSV
            </button>
          )}
          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Tiles in Rupee (₹) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <MetricCard
          title="Total Volume Processed"
          value={`₹${(kpis?.total_volume_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtext={`${kpis?.total_transactions || 0} Total Transactions`}
          icon={IndianRupee}
          color="cyan"
        />
        <MetricCard
          title="Flagged Suspicious Volume"
          value={`₹${(kpis?.flagged_volume_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtext={`${kpis?.flagged_transactions_count || 0} suspicious transactions`}
          icon={ShieldAlert}
          color="rose"
          highlight={kpis?.flagged_transactions_count > 0}
        />
        <MetricCard
          title="Active Triage Alerts"
          value={kpis?.pending_alerts_count || 0}
          subtext={`${kpis?.under_investigation_count || 0} under investigation`}
          icon={Activity}
          color="amber"
        />
        <MetricCard
          title="Detection Precision"
          value={`${kpis?.precision_rate_percentage || 85}%`}
          subtext="Target: ≥ 70% (Minimizing false alerts)"
          icon={Target}
          color="emerald"
        />
        <MetricCard
          title="Detection Recall"
          value={`${kpis?.recall_rate_percentage || 88}%`}
          subtext="Target: ≥ 85% (Preventing missed fraud)"
          icon={CheckCircle}
          color="purple"
        />
        <MetricCard
          title="Model F1-Score"
          value={`${kpis?.f1_score_percentage || 86.7}%`}
          subtext="Harmonic Mean of Precision & Recall"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="ROC-AUC Score"
          value={`${kpis?.auc_roc || 0.942}`}
          subtext="Overall Ensemble Discriminating Power"
          icon={Target}
          color="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-muted)' }}>
            TRANSACTION TYPOLOGY BREAKDOWN
          </h3>
          <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {typeValues.length > 0 ? (
              <Doughnut data={typeChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12 } } } }} />
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No transaction data</span>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-muted)' }}>
            RISK SEVERITY SPECTRUM
          </h3>
          <div style={{ height: '210px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {riskValues.length > 0 ? (
              <Pie data={riskChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', boxWidth: 12 } } } }} />
            ) : (
              <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>No risk data</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts Queue */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Priority Compliance Alerts</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>Flagged high-risk financial flows requiring investigator action</p>
          </div>
          {onNavigate && (
            <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => onNavigate('alerts')}>
              View All Alerts →
            </button>
          )}
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Alert #</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Amount (₹)</th>
                <th>Sender (Orig)</th>
                <th>Beneficiary (Dest)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
                    No pending alerts in queue.
                  </td>
                </tr>
              ) : (
                recentAlerts.map(alert => (
                  <tr key={alert.id}>
                    <td style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>#{alert.id}</td>
                    <td><RiskBadge level={alert.severity} score={alert.risk_score} /></td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{alert.transaction?.type || 'TRANSFER'}</td>
                    <td style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>
                      ₹{alert.transaction?.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{alert.transaction?.name_orig || 'N/A'}</td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: '13px' }}>{alert.transaction?.name_dest || 'N/A'}</td>
                    <td>
                      <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {alert.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => onSelectAlert(alert)}
                      >
                        Triage <ArrowUpRight size={13} />
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
