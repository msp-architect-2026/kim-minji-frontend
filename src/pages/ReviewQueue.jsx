import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage, fetchPendingReviews, reviewInspection } from '../api/lotApi';
import { DEFECT_COLORS } from '../utils/defectColors';

const PAGE_SIZE = 20;
const DEFECT_LABELS = Object.keys(DEFECT_COLORS);
const cardStyle = { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const fieldStyle = { padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d0d5', fontSize: 13, background: '#fff' };
const cellStyle = { padding: '12px 16px' };
const headers = ['Lot', 'Slot', 'AI Prediction', 'Confidence', 'Final', ''];

function ReviewRow({ row, reviewer, onReviewed, onError }) {
  const [finalPrediction, setFinalPrediction] = useState(row.prediction);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await reviewInspection(row.inspectionId, { finalPrediction, reviewer });
      await onReviewed();
    } catch (error) {
      onError(apiErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid #f5f5f7' }}>
      <td style={{ ...cellStyle, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {row.lotId ? <Link to={`/lots/${row.lotId}`} style={{ color: '#0071e3', textDecoration: 'none' }}>{row.lotNo}</Link> : '-'}
      </td>
      <td style={cellStyle}>{row.slotNo ?? '-'}</td>
      <td style={cellStyle}>{row.prediction}</td>
      <td style={cellStyle}>{(row.confidence * 100).toFixed(1)}%</td>
      <td style={cellStyle}>
        <select aria-label={`Final prediction for inspection ${row.inspectionId}`} value={finalPrediction} onChange={e => setFinalPrediction(e.target.value)} style={fieldStyle}>
          {DEFECT_LABELS.map(label => <option key={label} value={label}>{label}</option>)}
        </select>
      </td>
      <td style={cellStyle}>
        <button disabled={busy || !reviewer.trim()} onClick={submit} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: busy || !reviewer.trim() ? '#e0e0e0' : '#0071e3', color: busy || !reviewer.trim() ? '#a0a0a0' : '#fff', fontSize: 13, fontWeight: 600, cursor: busy || !reviewer.trim() ? 'not-allowed' : 'pointer' }}>Confirm</button>
      </td>
    </tr>
  );
}

export default function ReviewQueue() {
  const [reviews, setReviews] = useState(null);
  const [reviewer, setReviewer] = useState('');
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    return fetchPendingReviews(page, PAGE_SIZE).then(setReviews).catch(e => setMessage(apiErrorMessage(e)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Reviews</h1>
          <p style={{ fontSize: 15, color: '#6e6e73', margin: 0 }}>{reviews ? `${reviews.totalElements} low-confidence inspections waiting for a decision` : 'Loading...'}</p>
        </div>
        <input aria-label="Reviewer" maxLength={50} placeholder="Reviewer name" value={reviewer} onChange={e => setReviewer(e.target.value)} style={{ ...fieldStyle, fontSize: 14, padding: '10px 12px' }} />
      </div>

      {message && <p role="alert" style={{ fontSize: 13, color: '#c62828', marginBottom: 16, overflowWrap: 'anywhere' }}>{message}</p>}

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 12, color: '#6e6e73', borderBottom: '1px solid #f0f0f2' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {reviews?.content.map(row => <ReviewRow key={row.inspectionId} row={row} reviewer={reviewer} onReviewed={load} onError={setMessage} />)}
          </tbody>
        </table>
        {reviews?.content.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: '#6e6e73', fontSize: 14, margin: 0 }}>No inspections waiting for review</p>}
      </div>

      {reviews && reviews.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <button disabled={reviews.first} onClick={() => setPage(page - 1)} style={fieldStyle}>Previous</button>
          <span style={{ fontSize: 13, color: '#6e6e73' }}>{page + 1} / {reviews.totalPages}</span>
          <button disabled={reviews.last} onClick={() => setPage(page + 1)} style={fieldStyle}>Next</button>
        </div>
      )}
    </div>
  );
}
