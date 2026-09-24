const API_BASE = '/api/v1';

async function handleResponse(res) {
  if (!res.ok) {
    let errMessage = `HTTP error ${res.status}`;
    try {
      const errData = await res.json();
      errMessage = errData.message || errData.detail || errMessage;
    } catch (_) {}
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetch(`${API_BASE}/health`).then(handleResponse),
  getReadiness: () => fetch(`${API_BASE}/ready`).then(handleResponse),

  // KPIs
  getKPIs: () => fetch(`${API_BASE}/analytics/dashboard-kpis`).then(handleResponse),

  // Transactions
  getTransactions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    return fetch(`${API_BASE}/transactions/?${query.toString()}`).then(handleResponse);
  },

  getTransactionById: (id) => fetch(`${API_BASE}/transactions/${id}`).then(handleResponse),

  createTransaction: (data) =>
    fetch(`${API_BASE}/transactions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  uploadCSV: (file, maxRows = 500) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/transactions/upload-csv?max_rows=${maxRows}`, {
      method: 'POST',
      body: formData,
    }).then(handleResponse);
  },

  // Alerts
  getAlerts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return fetch(`${API_BASE}/alerts/?${query.toString()}`).then(handleResponse);
  },

  updateAlert: (id, payload) =>
    fetch(`${API_BASE}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Graph Analytics
  getAccountGraph: (accountId, hops = 2) =>
    fetch(`${API_BASE}/graph/account/${accountId}?hops=${hops}`).then(handleResponse),

  getCycles: () => fetch(`${API_BASE}/graph/cycles`).then(handleResponse),

  // ML Plugins
  getPlugins: () => fetch(`${API_BASE}/plugins/`).then(handleResponse),

  togglePlugin: (name, isEnabled) =>
    fetch(`${API_BASE}/plugins/${name}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: isEnabled }),
    }).then(handleResponse),

  updatePluginWeight: (name, weight) =>
    fetch(`${API_BASE}/plugins/${name}/weight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: parseFloat(weight) }),
    }).then(handleResponse),
};
