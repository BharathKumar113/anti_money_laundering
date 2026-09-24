# AML Guardian — React + Vite Investigator Dashboard

Modern Single-Page Application (SPA) built for **Anti-Money Laundering (AML) Compliance Officers & Investigators**. Part of the IV B.Tech Major Project for **Team A-13** (D. Ajay Kumar - Frontend Owner).

Built with **React 18**, **Vite**, **Vis-Network** (interactive physics graph rendering), **Chart.js**, and **Lucide Icons**.

---

## 🚀 Key Modules & Views

1. **📊 Executive Overview (`DashboardView.jsx`):**
   - KPI tiles: Total volume processed, flagged suspicious transactions, pending alerts.
   - Precision ($\ge 85\%$) & Recall ($\ge 70\%$) performance gauges.
   - Transaction type distribution & risk severity doughnut charts.
   - Live high-priority alert queue.
2. **🚨 Alert Triage Workbench (`AlertsView.jsx` & `AlertModal.jsx`):**
   - Filter cases by status (`PENDING`, `UNDER_INVESTIGATION`, `CONFIRMED_FRAUD`, `FALSE_POSITIVE`) and severity.
   - Drill-down investigation modal with transaction parameters, flagged indicators, and regulatory decision recording with audit trail.
3. **🔍 SHAP Explainability Engine (`ShapChart.jsx`):**
   - Horizontal bar charts displaying feature attribution (pushing towards fraud vs. pushing towards legitimate).
4. **🕸️ NetworkX Force-Directed Topology (`GraphView.jsx`):**
   - Interactive canvas powered by `vis-network`.
   - Visualizes multi-hop money flows, accounts, and color-coded risk levels.
   - Built-in **Circular Laundering Ring Detector** highlighting round-tripping cycles ($A \to B \to C \to A$).
5. **⚙️ Pluggable ML Model Manager (`PluginsView.jsx`):**
   - Live control panel displaying all registered models (`heuristic_rules`, `xgboost_classifier`, `autoencoder_anomaly`, `graph_ring_detector`).
   - Dynamic hot-toggle switches and voting weight sliders with real-time API sync.
6. **🧪 Transaction Simulator & CSV Ingestion (`SimulatorView.jsx`):**
   - Form to simulate real-time scoring on custom transaction inputs with pre-configured fraud presets.
   - Batch drag-and-drop PaySim CSV file uploader.

---

## 🛠️ How to Run

### Development Mode (with Vite HMR)

```bash
cd /root/frontend
npm run dev
```
Access the development UI at: **`http://localhost:3000`** (requests to `/api` are automatically proxied to the FastAPI backend at `http://127.0.0.1:8000`).

---

### Production Build & Unified Serving

The production build has already been bundled into `frontend/dist/`. The FastAPI backend serves it directly:

```bash
cd /root/backend
./scripts/run_dev.sh
```
Open **`http://localhost:8000/dashboard`** to view the production dashboard.
