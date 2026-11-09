/**
 * Enterprise AML Platform — Pure HTML/CSS/JS Diagram Engine
 * Interactive Controls, Live Simulations, Dynamic Inspections, & UML Renderers
 */

// Global State
const appState = {
  activeTab: 'architecture',
  activeUmlView: 'class',
  activeDfdView: 'level1',
  activeLitView: 'timeline',
  simulating: false,
  seqStep: 0,
};

// Component Specifications Registry for Inspect Modal
const componentRegistry = {
  'fastapi-gateway': {
    title: 'FastAPI High-Throughput Gateway',
    layer: 'Ingestion & API Layer',
    file: 'backend/app/main.py & app/api/v1/endpoints/transactions.py',
    latency: '8 - 14 ms',
    throughput: '3,800 req/sec',
    desc: 'Asynchronous ASGI application providing strict Pydantic v2 payload schema validation, Bearer JWT authentication, Prometheus latency middleware, and CORS dispatching.',
    features: ['Async event loop execution', 'Zero-copy JSON parsing with orjson', 'Rate-limiting & IP throttling', 'OpenAPI v3 auto-generation']
  },
  'feature-store': {
    title: 'PaySim Feature Store & Vectorizer',
    layer: 'Feature Engineering Layer',
    file: 'backend/app/ml_plugins/plugins/feature_extractor.py',
    latency: '4 - 6 ms',
    throughput: '12,000 vectors/sec',
    desc: 'Transforms raw banking transactions into an 18-dimensional numerical feature vector including delta balance differences, rolling velocity windows, and historical origin-destination ratios.',
    features: ['18 Tabular PaySim Features', 'StandardScaler Normalization', 'Zero-division robust epsilon handling', 'Sliding 1h, 24h, 7d velocity aggregates']
  },
  'xgboost-scorer': {
    title: 'Supervised XGBoost Gradient Booster',
    layer: 'Machine Learning Scoring Ensemble',
    file: 'backend/app/ml_plugins/plugins/xgb_plugin.py',
    latency: '3.2 ms',
    throughput: '9,500 evals/sec',
    desc: 'Extreme Gradient Boosting decision tree ensemble trained on calibrated PaySim synthetic financial datasets. Detects complex non-linear combinations of transfer anomalies.',
    features: ['Trained model: xgb_aml.joblib', 'Max depth: 6, N_estimators: 150', 'Tree-based SHAP explainability', 'Precision: 98.4%, Recall: 91.2%']
  },
  'isolation-forest': {
    title: 'Spatial Isolation Forest Engine',
    layer: 'Machine Learning Scoring Ensemble',
    file: 'backend/app/ml_plugins/plugins/isolation_forest_plugin.py',
    latency: '2.8 ms',
    throughput: '11,000 evals/sec',
    desc: 'Unsupervised spatial partitioning algorithm that isolates zero-day transaction anomalies without requiring historical fraud labels.',
    features: ['Trained model: isolation_forest.joblib', 'Contamination parameter: 0.01', 'Multi-dimensional hyperplanes', 'Unsupervised novelty detection']
  },
  'autoencoder': {
    title: 'PyTorch Deep Autoencoder Neural Network',
    layer: 'Machine Learning Scoring Ensemble',
    file: 'backend/app/ml_plugins/plugins/autoencoder_plugin.py',
    latency: '5.1 ms',
    throughput: '6,200 evals/sec',
    desc: 'Deep symmetrical bottleneck neural network (18 -> 12 -> 6 -> 2 -> 6 -> 12 -> 18). Calculates reconstruction Mean Squared Error (MSE) to flag structural deviations.',
    features: ['Trained model: autoencoder.joblib', 'Bottleneck compression: 2 latent dimensions', 'ReLU activations + Dropout regularizer', 'MSE Loss Reconstruction threshold: 0.042']
  },
  'networkx-graph': {
    title: 'NetworkX Graph Cycle & Mule Ring Forensics',
    layer: 'Forensics & Graph Intelligence',
    file: 'backend/app/ml_plugins/plugins/graph_forensics_plugin.py',
    latency: '4.5 ms',
    throughput: '4,000 traversals/sec',
    desc: 'Maintains an in-memory directed multi-graph of sender-receiver accounts. Runs Tarjan\'s Strongly Connected Components and simple cycles algorithms to detect circular money laundering rings.',
    features: ['Cycles detection (length 3 to 5 nodes)', 'In-degree / out-degree anomaly scoring', 'PageRank centrality calculation', 'Vis-network dynamic export format']
  },
  'rule-engine': {
    title: 'Deterministic BSA / FinCEN Rule Engine',
    layer: 'Rule & Compliance Layer',
    file: 'backend/app/ml_plugins/plugins/rule_engine.py',
    latency: '0.8 ms',
    throughput: '45,000 evals/sec',
    desc: 'Evaluates statutory requirements including the $10,000 Currency Transaction Reporting (CTR) threshold, structuring smurfing patterns, and blacklisted accounts.',
    features: ['Structuring detection (<$10k clustering)', 'Rapid velocity account draining', 'High-risk jurisdiction flags', 'Zero false-negative on mandatory statutory rules']
  },
  'meta-ensemble': {
    title: 'Calibrated Meta-Scorer Ensemble',
    layer: 'Ensemble & Decisioning Layer',
    file: 'backend/app/ml_plugins/plugin_manager.py',
    latency: '1.2 ms',
    throughput: '25,000 scores/sec',
    desc: 'Computes a weighted blending of all 5 detection engines (Rules + XGBoost + Isolation Forest + Autoencoder + Graph Forensics). Applies Platt scaling to output a calibrated 0-100 AML Risk Score.',
    features: ['Configurable engine weights (alpha, beta, gamma)', 'Dynamic plugin enable/disable at runtime', 'Sigmoidal probability calibration', 'Automatic SAR trigger threshold (>= 70)']
  },
  'sqlite-db': {
    title: 'Relational Persistence & Audit Ledger',
    layer: 'Data Storage Layer',
    file: 'backend/app/core/database.py & app/models/',
    latency: '3.5 ms',
    throughput: '8,000 writes/sec',
    desc: 'SQLAlchemy ORM connected to SQLite (development) and PostgreSQL (production). Stores immutable transaction ledgers, alerts, and immutable audit logs.',
    features: ['Tables: transactions, alerts, audit_logs', 'Indexes on account_id, timestamp, risk_score', 'ACID transaction guarantees', 'Zero-downtime schema migrations']
  }
};

/**
 * Switch primary navigation tab
 */
function switchTab(tabId) {
  appState.activeTab = tabId;

  // 1. Update Sidebar Nav Items
  document.querySelectorAll('.sidebar-nav .nav-item[data-tab]').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  // 2. Update Tab Panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  // 3. Update Title
  const titles = {
    architecture: 'System Architecture — Interactive Topology',
    dfd: 'Data Flow Diagrams (DFD) — Levels 0, 1 & 2',
    uml: 'UML Diagrams — Native Object & Sequence Models',
    literature: 'Literature Survey — Evolution & Comparative Matrix'
  };
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle && titles[tabId]) pageTitle.textContent = titles[tabId];

  // Close mobile sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

/**
 * Switch sub-views in UML section
 */
function switchUmlView(viewName, btn) {
  appState.activeUmlView = viewName;
  document.querySelectorAll('#uml-subnav .subnav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.uml-view-panel').forEach(panel => {
    panel.style.display = (panel.id === `uml-${viewName}`) ? 'block' : 'none';
  });
}

/**
 * Switch sub-views in DFD section
 */
function switchDfdView(viewName, btn) {
  appState.activeDfdView = viewName;
  document.querySelectorAll('#dfd-subnav .subnav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.dfd-view-panel').forEach(panel => {
    panel.style.display = (panel.id === `dfd-${viewName}`) ? 'block' : 'none';
  });
}

/**
 * Switch sub-views in Literature section
 */
function switchLitView(viewName, btn) {
  appState.activeLitView = viewName;
  document.querySelectorAll('#lit-subnav .subnav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.lit-view-panel').forEach(panel => {
    panel.style.display = (panel.id === `lit-${viewName}`) ? 'block' : 'none';
  });
}

/**
 * Show component details modal drawer
 */
function inspectComponent(componentId) {
  const comp = componentRegistry[componentId];
  if (!comp) return;

  const modal = document.getElementById('detailModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.textContent = comp.title;
  body.innerHTML = `
    <div style="margin-bottom: 14px;">
      <span class="badge badge-blue">${comp.layer}</span>
      <span class="badge badge-green">Latency: ${comp.latency}</span>
      <span class="badge badge-purple">Throughput: ${comp.throughput}</span>
    </div>
    <p style="margin-bottom: 12px; font-size: 13.5px; line-height: 1.6;">${comp.desc}</p>
    
    <div style="font-weight: 700; font-size: 12.5px; margin: 16px 0 8px; color: var(--slate-900);">KEY CAPABILITIES &amp; ALGORITHMS:</div>
    <ul style="padding-left: 20px; font-size: 13px; line-height: 1.7; color: var(--slate-700);">
      ${comp.features.map(f => `<li>${f}</li>`).join('')}
    </ul>

    <div style="font-weight: 700; font-size: 12.5px; margin: 18px 0 6px; color: var(--slate-900);">SOURCE CODE LOCATION:</div>
    <div class="code-snippet">${comp.file}</div>
  `;

  modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('detailModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Interactive DFD Live Transaction Simulation
 */
const simulationScenarios = {
  legit: {
    type: 'PAYMENT',
    amount: 142.50,
    orig: 'C10492819',
    dest: 'M98127391',
    ruleScore: 0,
    xgbScore: 4.2,
    ifScore: 3.1,
    aeScore: 2.5,
    graphScore: 0,
    finalScore: 3.2,
    action: 'APPROVED',
    reason: 'Routine Merchant Payment. Balances consistent.'
  },
  structuring: {
    type: 'TRANSFER',
    amount: 9850.00,
    orig: 'C99281726',
    dest: 'C88192837',
    ruleScore: 85,
    xgbScore: 92.4,
    ifScore: 88.0,
    aeScore: 78.5,
    graphScore: 40,
    finalScore: 86.8,
    action: 'FLAGGED_SAR',
    reason: 'Smurfing Pattern: Repeat transfers just under the $10,000 BSA threshold.'
  },
  mule_ring: {
    type: 'TRANSFER',
    amount: 250000.00,
    orig: 'C33819284',
    dest: 'C44918273',
    ruleScore: 95,
    xgbScore: 97.1,
    ifScore: 94.6,
    aeScore: 91.0,
    graphScore: 100,
    finalScore: 96.5,
    action: 'FLAGGED_SAR',
    reason: 'Circular Layering Detected: 4-Node Money Mule Cycle C1->C2->C3->C4->C1.'
  }
};

function runDfdSimulation() {
  if (appState.simulating) return;
  appState.simulating = true;

  const selector = document.getElementById('simScenarioSelect');
  const scenarioKey = selector ? selector.value : 'structuring';
  const data = simulationScenarios[scenarioKey];

  const steps = [
    { id: 'sim-step-ingest', text: '1. Ingestion Validated', note: `Payload Parsed (${data.type} $${data.amount.toLocaleString()})` },
    { id: 'sim-step-feature', text: '2. 18 Features Extracted', note: 'Delta balances, velocity computed' },
    { id: 'sim-step-scoring', text: '3. 5 Engines Scored', note: `XGB: ${data.xgbScore}% | AE: ${data.aeScore}% | Cycle: ${data.graphScore}%` },
    { id: 'sim-step-meta', text: '4. Calibrated Score', note: `Final AML Risk: ${data.finalScore}/100` },
    { id: 'sim-step-decision', text: `5. Outcome: ${data.action}`, note: data.reason }
  ];

  // Reset steps
  steps.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.className = 'pipeline-step';
      const noteEl = el.querySelector('.step-note');
      if (noteEl) noteEl.textContent = 'Waiting...';
    }
  });

  // Animate step by step
  let index = 0;
  const interval = setInterval(() => {
    if (index < steps.length) {
      const s = steps[index];
      const el = document.getElementById(s.id);
      if (el) {
        el.classList.add('active');
        if (index === steps.length - 1) {
          el.classList.add(data.action === 'APPROVED' ? 'success' : 'danger');
        }
        const noteEl = el.querySelector('.step-note');
        if (noteEl) noteEl.textContent = s.note;
      }
      index++;
    } else {
      clearInterval(interval);
      appState.simulating = false;
    }
  }, 450);
}

/**
 * UML Sequence Diagram Step-by-Step Player
 */
const sequenceSteps = [
  '1. Core Banking submits POST /api/v1/transactions with JSON payload.',
  '2. Gateway validates Bearer JWT token & parses Pydantic v2 schema.',
  '3. Gateway invokes TransactionEngine.score_transaction() asynchronously.',
  '4. TransactionEngine queries Feature Store for rolling 24h balances.',
  '5. TransactionEngine broadcasts vector to 5 ML Plugins in parallel.',
  '6. XGBoost, IsolationForest, Autoencoder & NetworkX return risk probabilities.',
  '7. MetaEnsemble blends outputs: Risk Score computed.',
  '8. If Risk >= 70: AlertEngine triggers Suspicious Activity Report (SAR).',
  '9. Transaction & Alert committed to SQLite database ledger.',
  '10. Response 201 Created returned to Client with risk breakdown in 12ms.'
];

function nextSeqStep() {
  const steps = document.querySelectorAll('.seq-message-step');
  if (appState.seqStep < steps.length) {
    steps[appState.seqStep].style.background = 'var(--primary-light)';
    steps[appState.seqStep].style.borderColor = 'var(--primary)';
    
    const banner = document.getElementById('seqStatusBanner');
    if (banner) banner.textContent = sequenceSteps[appState.seqStep];
    
    appState.seqStep++;
  } else {
    resetSeqSteps();
  }
}

function resetSeqSteps() {
  appState.seqStep = 0;
  const steps = document.querySelectorAll('.seq-message-step');
  steps.forEach(s => {
    s.style.background = '';
    s.style.borderColor = '';
  });
  const banner = document.getElementById('seqStatusBanner');
  if (banner) banner.textContent = 'Click "Next Step" to trace execution sequence.';
}

/**
 * Filter Literature Survey Table
 */
function filterLiteratureTable(filter) {
  const rows = document.querySelectorAll('#litTable tbody tr');
  rows.forEach(r => {
    if (filter === 'all') {
      r.style.display = '';
    } else {
      const match = r.getAttribute('data-type') === filter;
      r.style.display = match ? '' : 'none';
    }
  });

  document.querySelectorAll('#litFilterBtns button').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-filter') === filter);
  });
}

/**
 * Backend Health Poller
 */
async function checkBackendHealth() {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  try {
    const res = await fetch('/api/v1/health', { cache: 'no-cache' });
    if (res.ok) {
      if (statusDot) {
        statusDot.style.background = '#10b981';
        statusDot.style.boxShadow = '0 0 8px #10b981';
      }
      if (statusText) {
        statusText.textContent = 'Server Live (200 OK)';
        statusText.style.color = '#34d399';
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    if (statusDot) {
      statusDot.style.background = '#f59e0b';
      statusDot.style.boxShadow = '0 0 8px #f59e0b';
    }
    if (statusText) {
      statusText.textContent = 'Backend Reconnecting...';
      statusText.style.color = '#fbbf24';
    }
  }
}

// Global Event Listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('detailModal');
  if (e.target === modal) closeModal();
});

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash && ['architecture', 'dfd', 'uml', 'literature'].includes(hash)) {
    switchTab(hash);
  }
  checkBackendHealth();
  setInterval(checkBackendHealth, 12000);
});
