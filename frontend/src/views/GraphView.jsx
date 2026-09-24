import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { api } from '../services/api';
import { Search, ShieldAlert, GitBranch } from 'lucide-react';

export default function GraphView() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  const [accountId, setAccountId] = useState('C_RING_ACC_A');
  const [hops, setHops] = useState(2);
  const [graphData, setGraphData] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const loadGraph = (targetId = accountId) => {
    setLoading(true);
    api.getAccountGraph(targetId, hops)
      .then(data => {
        setGraphData(data);
        renderVisNetwork(data.nodes, data.edges);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadCycles = () => {
    api.getCycles()
      .then(setCycles)
      .catch(console.error);
  };

  useEffect(() => {
    loadGraph();
    loadCycles();
  }, [hops]);

  const renderVisNetwork = (nodesData, edgesData) => {
    if (!containerRef.current) return;

    // Convert nodes to vis format
    const visNodes = new DataSet(
      nodesData.map(n => {
        const isHighRisk = n.risk_level === 'CRITICAL' || n.risk_level === 'HIGH';
        return {
          id: n.id,
          label: `${n.id}\n(₹${(n.total_volume_out + n.total_volume_in).toLocaleString('en-IN')})`,
          shape: n.account_type === 'Merchant' ? 'box' : 'dot',
          size: isHighRisk ? 28 : 20,
          color: {
            background: isHighRisk ? '#EF4444' : (n.risk_level === 'MEDIUM' ? '#F59E0B' : '#06B6D4'),
            border: '#FFFFFF',
            highlight: { background: '#3B82F6', border: '#60A5FA' }
          },
          font: { color: '#FFFFFF', face: 'Plus Jakarta Sans', size: 12 },
          raw: n,
        };
      })
    );

    // Convert edges to vis format
    const visEdges = new DataSet(
      edgesData.map((e, idx) => ({
        id: `edge_${idx}`,
        from: e.source,
        to: e.target,
        arrows: 'to',
        label: `₹${e.amount.toLocaleString('en-IN')}`,
        font: { color: e.is_suspicious ? '#F87171' : '#94A3B8', size: 10, align: 'middle' },
        color: { color: e.is_suspicious ? '#EF4444' : 'rgba(255,255,255,0.25)', highlight: '#3B82F6' },
        width: e.is_suspicious ? 2.5 : 1.2,
      }))
    );

    const options = {
      physics: {
        stabilization: true,
        barnesHut: { gravitationalConstant: -3500, springLength: 120 },
      },
      interaction: { hover: true, tooltipDelay: 200 },
      nodes: { borderWidth: 2 },
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, { nodes: visNodes, edges: visEdges }, options);
    networkRef.current = network;

    network.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const found = nodesData.find(n => n.id === params.nodes[0]);
        setSelectedNode(found || null);
      }
    });

    network.on('deselectNode', () => setSelectedNode(null));
  };

  const handleSelectCycle = (cycle) => {
    if (cycle.accounts && cycle.accounts.length > 0) {
      setAccountId(cycle.accounts[0]);
      loadGraph(cycle.accounts[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
          Transaction Network Topology & Laundering Rings
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Graph-based link analysis detecting circular routing, smurfing hubs, and multi-layered money mule structures.
        </p>
      </div>

      {/* Graph Toolbar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ width: '220px' }}
            placeholder="Account ID (e.g. C_RING_ACC_A)"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <select className="select" style={{ width: '130px' }} value={hops} onChange={(e) => setHops(Number(e.target.value))}>
            <option value={1}>1 Hop Depth</option>
            <option value={2}>2 Hops Depth</option>
            <option value={3}>3 Hops Depth</option>
          </select>
          <button className="btn btn-primary" onClick={() => loadGraph()}>
            <Search size={15} /> Trace Flows
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => { setAccountId('C_RING_ACC_A'); loadGraph('C_RING_ACC_A'); }}>
            Load Circular Ring
          </button>
          <button className="btn btn-secondary" onClick={() => { setAccountId('C_SMURF_BOSS'); loadGraph('C_SMURF_BOSS'); }}>
            Load Smurfing Network
          </button>
        </div>
      </div>

      {/* Main Graph Grid (Responsive stack on tablet/mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Graph Canvas Card */}
        <div className="card" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '560px', gridColumn: 'span 2' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#080C15' }} />

          {/* Canvas Floating Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(14, 22, 38, 0.88)',
            backdropFilter: 'blur(6px)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
              <span>High Risk / Flagged Account</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#06B6D4' }} />
              <span>Standard Customer Account</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '2px', background: '#EF4444' }} />
              <span>Suspicious Flow with Amount (₹)</span>
            </div>
          </div>
        </div>

        {/* Selected Account Node Details */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            SELECTED ACCOUNT TOPOLOGY
          </h3>
          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Account ID:</span>
                <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>{selectedNode.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>In-Degree (Inflows):</span>
                <span>{selectedNode.in_degree} transactions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Out-Degree (Outflows):</span>
                <span>{selectedNode.out_degree} transactions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Inflow Volume:</span>
                <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>₹{selectedNode.total_volume_in.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Outflow Volume:</span>
                <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>₹{selectedNode.total_volume_out.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic' }}>
              Click any account node on the canvas to inspect degree centrality and volume.
            </div>
          )}
        </div>

        {/* Detected Laundering Cycles */}
        <div className="card">
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <ShieldAlert size={16} /> DETECTED CIRCULAR LAUNDERING RINGS ({cycles.length})
          </h3>
          {cycles.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>No circular loops detected.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {cycles.map((c, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectCycle(c)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                    <span style={{ color: '#F87171' }}>Cycle #{i + 1} ({c.cycle_length} Accounts)</span>
                    <span style={{ color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>₹{c.total_flow_amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
                    {c.accounts?.join(' → ')} → {c.accounts?.[0]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
