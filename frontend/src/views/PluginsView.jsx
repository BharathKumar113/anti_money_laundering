import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Sliders, Cpu, Activity, Clock, Power, ShieldCheck } from 'lucide-react';

export default function PluginsView() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  const loadPlugins = () => {
    setLoading(true);
    api.getPlugins()
      .then(setPlugins)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleToggle = async (plugin) => {
    const newStatus = !plugin.is_enabled;
    setUpdating(prev => ({ ...prev, [plugin.name]: true }));
    try {
      await api.togglePlugin(plugin.name, newStatus);
      setPlugins(prev =>
        prev.map(p => (p.name === plugin.name ? { ...p, is_enabled: newStatus } : p))
      );
    } catch (err) {
      alert(`Error updating plugin status: ${err.message}`);
    } finally {
      setUpdating(prev => ({ ...prev, [plugin.name]: false }));
    }
  };

  const handleWeightChange = async (plugin, newWeight) => {
    setPlugins(prev =>
      prev.map(p => (p.name === plugin.name ? { ...p, weight: parseFloat(newWeight) } : p))
    );
    try {
      await api.updatePluginWeight(plugin.name, newWeight);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
          ML Model Plugin Architecture & Ensemble Controller
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Hot-swappable detection engines. Dynamically toggle models, calibrate voting weights, and audit inference latencies in real time.
        </p>
      </div>

      {/* Plugins Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {loading ? (
          <div style={{ color: 'var(--text-dim)', padding: '40px' }}>Loading detection plugins...</div>
        ) : (
          plugins.map(plugin => (
            <div key={plugin.name} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: plugin.is_enabled ? '4px solid var(--accent-cyan)' : '4px solid var(--border-color)' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'JetBrains Mono', margin: 0 }}>{plugin.name}</h3>
                      <span style={{ fontSize: '11px', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                        v{plugin.version}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                      {plugin.model_type}
                    </span>
                  </div>

                  {/* Enable / Disable Toggle Button */}
                  <button
                    onClick={() => handleToggle(plugin)}
                    disabled={updating[plugin.name]}
                    className="btn"
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      background: plugin.is_enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                      color: plugin.is_enabled ? '#6EE7B7' : '#FCA5A5',
                      border: `1px solid ${plugin.is_enabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                    }}
                  >
                    <Power size={13} /> {plugin.is_enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.4 }}>
                  {plugin.description}
                </p>

                {/* Telemetry Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px', marginTop: '14px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Engine</span>
                    <span style={{ fontWeight: '600' }}>Active</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Evaluations</span>
                    <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>{plugin.execution_count}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block' }}>Avg Latency</span>
                    <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>
                      {plugin.avg_latency_ms} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Ensemble Weight Slider */}
              <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Ensemble Calibration Weight:</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    {(plugin.weight * 100).toFixed(0)}% ({plugin.weight})
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={plugin.weight}
                  disabled={!plugin.is_enabled}
                  onChange={(e) => handleWeightChange(plugin, e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enterprise Extensible Guide */}
      <div className="card">
        <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="var(--accent-cyan)" /> Pluggable ML Engine Integration
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          New models (such as PyTorch Deep Autoencoders, XGBoost, or Graph Neural Networks) are implemented by inheriting from <code>BaseAMLModelPlugin</code> in <code>app/ml_plugins/plugins/</code>. Registered plugins dynamically appear on this console with automatic weighted risk scoring and SHAP explainability.
        </p>
      </div>
    </div>
  );
}
