import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchRecordById } from '../api/recordApi';

const defectBadge = (prediction) => {
  if (!prediction || prediction === 'none') return { bg: '#e8f5e9', color: '#2e7d32' };
  return { bg: '#fff3e0', color: '#e65100' };
};

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetchRecordById(id).then(setRecord).catch(console.error);
  }, [id]);

  if (!record) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: '#6e6e73', fontSize: 15 }}>
      Loading...
    </div>
  );

  const badge = defectBadge(record.prediction);

  return (
    <div style={{ maxWidth: 640 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: 14, cursor: 'pointer', marginBottom: 24, padding: 0 }}
      >← Back</button>

      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 32 }}>Inspection Detail</h1>

      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ padding: '28px 32px', borderBottom: '1px solid #f5f5f7' }}>
          <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>FILENAME</p>
          <p style={{ fontSize: 17, color: '#1d1d1f', fontWeight: 500, margin: 0 }}>{record.filename}</p>
        </div>

        <div style={{ padding: '28px 32px', borderBottom: '1px solid #f5f5f7', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>PREDICTION</p>
            <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '5px 16px', fontSize: 14, fontWeight: 600 }}>
              {record.prediction}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>CONFIDENCE</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', margin: 0 }}>
              {(record.confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>

        <div style={{ padding: '28px 32px', borderBottom: '1px solid #f5f5f7' }}>
          <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>CONFIDENCE BAR</p>
          <div style={{ background: '#f5f5f7', borderRadius: 8, height: 10 }}>
            <div style={{
              background: record.confidence > 0.8 ? '#34c759' : record.confidence > 0.5 ? '#ff9f0a' : '#ff3b30',
              borderRadius: 8, height: 10, width: `${record.confidence * 100}%`,
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        <div style={{ padding: '28px 32px', borderBottom: '1px solid #f5f5f7' }}>
          <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>FILE PATH</p>
          <p style={{ fontSize: 13, color: '#6e6e73', fontFamily: 'monospace', margin: 0 }}>{record.filepath}</p>
        </div>

        <div style={{ padding: '28px 32px' }}>
          <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 6 }}>CREATED AT</p>
          <p style={{ fontSize: 15, color: '#1d1d1f', margin: 0 }}>{record.createdAt?.slice(0, 16).replace('T', ' ')}</p>
        </div>
      </div>
    </div>
  );
}