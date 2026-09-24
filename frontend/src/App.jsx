import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import AlertsView from './views/AlertsView';
import TransactionsView from './views/TransactionsView';
import GraphView from './views/GraphView';
import PluginsView from './views/PluginsView';
import SimulatorView from './views/SimulatorView';
import AlertModal from './components/AlertModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const handleAlertUpdated = () => {
    // Triggers auto-refresh when alert status is updated
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView onSelectAlert={setSelectedAlert} onNavigate={setActiveTab} />}
        {activeTab === 'alerts' && <AlertsView onSelectAlert={setSelectedAlert} />}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'graph' && <GraphView />}
        {activeTab === 'plugins' && <PluginsView />}
        {activeTab === 'simulator' && <SimulatorView />}
      </main>

      {/* Global Alert Investigation Modal */}
      {selectedAlert && (
        <AlertModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onUpdated={handleAlertUpdated}
        />
      )}

      {/* Clean Production Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        marginTop: 'auto',
        fontSize: '12px',
        color: 'var(--text-dim)',
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <strong>Enhancing Anti-Money Laundering Detection through Machine Learning and Graph-Based Analytics</strong>
          </div>
          <div>
            Enterprise FinTech Fraud & Financial Crime Surveillance Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
