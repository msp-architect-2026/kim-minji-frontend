import { useEffect, useState } from 'react';
import { fetchStats, fetchDailyStats, fetchDefectDistribution } from '../api/recordApi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0071e3', '#34c759', '#ff9f0a', '#ff3b30', '#af52de', '#5ac8fa', '#ff2d55', '#a2845e', '#8e8e93'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
    fetchDailyStats(7).then(setDaily).catch(console.error);
    fetchDefectDistribution().then(setDistribution).catch(console.error);
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Analytics</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 36 }}>Defect trends and distribution analysis</p>

      {/* KPI 요약 */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Inspected', value: stats.totalCount },
            { label: 'Defect Rate', value: `${stats.defectRate.toFixed(1)}%` },
            { label: 'Avg Confidence', value: `${(stats.avgConfidence * 100).toFixed(1)}%` },
          ].map(k => (
            <div key={k.label} style={{
              background: '#fff', borderRadius: 18, padding: '24px 32px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', flex: 1, minWidth: 160
            }}>
              <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 6, fontWeight: 500 }}>{k.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* 일별 추이 */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', marginBottom: 24 }}>Daily Inspections (7d)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6e6e73' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#6e6e73' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(v, n) => [v, n === 'totalCount' ? 'Total' : 'Defects']}
              />
              <Line type="monotone" dataKey="totalCount" stroke="#0071e3" strokeWidth={2} dot={{ r: 4 }} name="totalCount" />
              <Line type="monotone" dataKey="defectCount" stroke="#ff3b30" strokeWidth={2} dot={{ r: 4 }} name="defectCount" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 결함 분포 파이차트 */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', marginBottom: 24 }}>Defect Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="count" nameKey="prediction" cx="50%" cy="50%" outerRadius={80} label={({ prediction, ratio }) => `${prediction} ${ratio.toFixed(0)}%`} labelLine={false}>
                {distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 결함 유형 테이블 */}
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Defect Type Breakdown</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Type', 'Count', 'Ratio', ''].map(h => (
                <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6e6e73', letterSpacing: '0.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {distribution.map((d, i) => (
              <tr key={d.prediction} style={{ borderTop: '1px solid #f5f5f7' }}>
                <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{d.prediction}</td>
                <td style={{ padding: '14px 24px', fontSize: 14, color: '#1d1d1f' }}>{d.count}</td>
                <td style={{ padding: '14px 24px', fontSize: 14, color: '#1d1d1f' }}>{d.ratio.toFixed(1)}%</td>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ background: '#f5f5f7', borderRadius: 4, height: 6, width: 120 }}>
                    <div style={{ background: COLORS[i % COLORS.length], borderRadius: 4, height: 6, width: `${d.ratio}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}