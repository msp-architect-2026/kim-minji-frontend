import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPagedRecords } from '../api/recordApi';

const defectBadge = (prediction) => {
  if (!prediction || prediction === 'none') return { bg: '#e8f5e9', color: '#2e7d32' };
  return { bg: '#fff3e0', color: '#e65100' };
};

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPagedRecords(search, page, 10).then(d => {
      setRecords(d.content);
      setTotalPages(d.totalPages);
    }).catch(console.error);
  }, [search, page]);

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Records</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 36 }}>All inspection results</p>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by prediction type..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            width: 280, padding: '10px 16px', borderRadius: 10,
            border: '1px solid #e0e0e0', fontSize: 14, outline: 'none',
            background: '#fff', color: '#1d1d1f',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}
        />
      </div>

      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              {['Filename', 'Prediction', 'Confidence', 'Date'].map(h => (
                <th key={h} style={{ padding: '14px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6e6e73', letterSpacing: '0.3px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e73', fontSize: 14 }}>No records found</td></tr>
            ) : records.map(r => {
              const badge = defectBadge(r.prediction);
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #f5f5f7' }}>
                  <td style={{ padding: '14px 24px', fontSize: 14 }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #e0e0e0',
            background: page === 0 ? '#fafafa' : '#fff', color: page === 0 ? '#c0c0c0' : '#1d1d1f',
            fontSize: 14, cursor: page === 0 ? 'not-allowed' : 'pointer'
          }}
        >Previous</button>
        <span style={{ fontSize: 14, color: '#6e6e73' }}>{page + 1} / {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #e0e0e0',
            background: page >= totalPages - 1 ? '#fafafa' : '#fff', color: page >= totalPages - 1 ? '#c0c0c0' : '#1d1d1f',
            fontSize: 14, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
          }}
        >Next</button>
      </div>
    </div>
  );
}