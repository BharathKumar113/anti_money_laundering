import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ShapChart({ shapValues = {} }) {
  const entries = Object.entries(shapValues || {});
  if (entries.length === 0) {
    return (
      <div style={{ color: 'var(--text-dim)', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
        No SHAP feature contributions available for this transaction.
      </div>
    );
  }

  // Sort by absolute importance
  entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  const labels = entries.map(([key]) => key.replace(/_/g, ' '));
  const dataValues = entries.map(([, val]) => val);

  // Red/Orange for risk-increasing features (> 0), Emerald/Blue for risk-decreasing (< 0)
  const backgroundColors = dataValues.map(v =>
    v >= 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'
  );
  const borderColors = dataValues.map(v =>
    v >= 0 ? '#EF4444' : '#10B981'
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'SHAP Feature Contribution',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Impact: ${context.parsed.x > 0 ? '+' : ''}${context.parsed.x.toFixed(4)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8' },
        title: {
          display: true,
          text: '← Pushes Legitimate | Pushes Fraud →',
          color: '#64748B',
          font: { size: 11 }
        }
      },
      y: {
        grid: { display: false },
        ticks: { color: '#F1F5F9', font: { size: 12, family: 'JetBrains Mono' } },
      },
    },
  };

  return (
    <div style={{ height: `${Math.max(160, entries.length * 36)}px`, width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
