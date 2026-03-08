import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStats, fetchPagedRecords } from '../api/recordApi';

function KpiCard({ label, value, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '28px 32px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 180
    }}>
      <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 8, fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-1px', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#6e6e73', marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
    fetchPagedRecords('', 0, 8).then(d => setRecords(d.content)).catch(console.error);
  }, []);

  const defectBadgeColor = (prediction) => {
    if (!prediction || prediction === 'none') return { bg: '#e8f5e9', color: '#2e7d32' };
    return { bg: '#fff3e0', color: '#e65100' };
  };

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Dashboard</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 36 }}>Wafer defect inspection overview</p>

      {stats ? (
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <KpiCard label="Total Inspected" value={stats.totalCount.toLocaleString()} />
          <KpiCard label="Defects Found" value={stats.defectCount.toLocaleString()} sub={`${stats.defectRate.toFixed(1)}% defect rate`} />
          <KpiCard label="Normal" value={(stats.totalCount - stats.defectCount).toLocaleString()} />
          <KpiCard label="Avg Confidence" value={`${(stats.avgConfidence * 100).toFixed(1)}%`} />
        </div>
      ) : (
        <div style={{ height: 120, display: 'flex', alignItems: 'center', color: '#6e6e73' }}>Loading...</div>
      )}

      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Recent Inspections</h2>
          <Link to="/records" style={{ fontSize: 14, color: '#1d1d1f', textDecoration: 'none' }}>View all →</Link>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Filename', 'Prediction', 'Confidence', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6e6e73', letterSpacing: '0.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const badge = defectBadgeColor(r.prediction);
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #f5f5f7' }}>
                  <td style={{ padding: '14px 24px', fontSize: 14, color: '#1d1d1f' }}>
                    <Link to={`/records/${r.id}`} style={{ color: '#0071e3', textDecoration: 'none' }}>{r.filename}</Link>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>
                      {r.prediction}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: 14, color: '#1d1d1f' }}>{(r.confidence * 100).toFixed(1)}%</td>
                  <td style={{ padding: '14px 24px', fontSize: 13, color: '#6e6e73' }}>{r.createdAt?.slice(0, 16).replace('T', ' ')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}