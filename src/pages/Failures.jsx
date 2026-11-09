import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiErrorMessage, retryInspection } from '../api/lotApi';
import { fetchFailures, fetchFailureSummary } from '../api/failureApi';

const PAGE_SIZE = 20;
const GRAFANA_URL = import.meta.env.VITE_GRAFANA_URL;
const PERIODS = [[1, 'Last hour'], [24, 'Last 24 hours'], [168, 'Last 7 days'], [720, 'Last 30 days']];
const cardStyle = { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const fieldStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #d0d0d5', fontSize: 14, background: '#fff' };
const cellStyle = { padding: '12px 16px', color: '#1d1d1f', whiteSpace: 'nowrap' };
const headStyle = { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#6e6e73' };
const linkButton = { background: 'none', border: 'none', padding: 0, color: '#0071e3', fontSize: 13, cursor: 'pointer' };

const logsUrl = (traceId) => {
  const left = {
    datasource: 'loki',
    queries: [{ refId: 'A', expr: `{namespace="application", container="backend"} |= "${traceId}"` }],
    range: { from: 'now-7d', to: 'now' },
  };
  return `${GRAFANA_URL}/explore?orgId=1&left=${encodeURIComponent(JSON.stringify(left))}`;
};

export default function Failures() {
  const [hours, setHours] = useState(24);
  const [errorCode, setErrorCode] = useState('');
  const [page, setPage] = useState(0);
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState(null);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    fetchFailureSummary(hours).then(setSummary).catch(e => setMessage(apiErrorMessage(e)));
    return fetchFailures({ hours, errorCode, page, size: PAGE_SIZE }).then(setItems).catch(e => setMessage(apiErrorMessage(e)));
  }, [hours, errorCode, page]);

  useEffect(() => { load(); }, [load]);

  const handleRetry = async (inspectionId) => {
    setMessage('');
    try {
      await retryInspection(inspectionId);
      setMessage(`Inspection ${inspectionId} retried successfully.`);
    } catch (error) {
      setMessage(apiErrorMessage(error));
    }
    await load();
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Failures</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 24 }}>Where inspections failed, why, and whether they are still unresolved</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select aria-label="Period" value={hours} onChange={e => changeFilter(setHours)(Number(e.target.value))} style={fieldStyle}>
          {PERIODS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {errorCode && <button onClick={() => changeFilter(setErrorCode)('')} style={{ ...fieldStyle, cursor: 'pointer', color: '#0071e3' }}>{errorCode} ✕</button>}
      </div>

      {message && <p role="status" style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16, overflowWrap: 'anywhere' }}>{message}</p>}

      {summary && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['Failures', summary.totalFailures], ['Unresolved', summary.unresolved]].map(([label, value]) => (
            <div key={label} style={{ ...cardStyle, padding: '20px 28px', flex: '1 1 160px' }}>
              <p style={{ fontSize: 13, color: '#6e6e73', margin: '0 0 6px', fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...cardStyle, overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead><tr>{['Stage', 'Error', 'Failures', 'Unresolved'].map(h => <th key={h} style={headStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {summary?.rows.map(row => (
              <tr key={`${row.stage}-${row.errorCode}`} style={{ borderTop: '1px solid #f5f5f7' }}>
                <td style={{ ...cellStyle, color: '#6e6e73' }}>{row.stage}</td>
                <td style={cellStyle}><button onClick={() => changeFilter(setErrorCode)(row.errorCode)} style={{ ...linkButton, fontSize: 14 }}>{row.errorCode}</button></td>
                <td style={cellStyle}>{row.total}</td>
                <td style={{ ...cellStyle, fontWeight: 600 }}>{row.unresolved}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {summary?.rows.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: '#6e6e73', fontSize: 14, margin: 0 }}>No failures in this period</p>}
      </div>

      {items?.content.length > 0 && (
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr>{['Time', 'Lot', 'Slot', 'Stage', 'Error', 'Status', 'Trace', ''].map(h => <th key={h} style={headStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {items.content.map(item => (
                <tr key={item.eventId} style={{ borderTop: '1px solid #f5f5f7' }}>
                  <td style={{ ...cellStyle, color: '#6e6e73' }}>{new Date(item.occurredAt).toLocaleString()}</td>
                  <td style={cellStyle}>{item.lotId ? <Link to={`/lots/${item.lotId}`} style={{ color: '#0071e3', textDecoration: 'none' }}>{item.lotNo}</Link> : '-'}</td>
                  <td style={cellStyle}>{item.slotNo ?? '-'}</td>
                  <td style={cellStyle}>{item.stage}</td>
                  <td style={cellStyle}>{item.errorCode}</td>
                  <td style={cellStyle}>{item.currentStatus}</td>
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 12 }}>
                    {item.traceId ? <>
                      {item.traceId.slice(0, 8)}…{' '}
                      <button onClick={() => navigator.clipboard.writeText(item.traceId)} style={linkButton}>Copy</button>{' '}
                      {GRAFANA_URL && <a href={logsUrl(item.traceId)} target="_blank" rel="noreferrer" style={{ color: '#0071e3', fontSize: 13, textDecoration: 'none' }}>Logs</a>}
                    </> : '-'}
                  </td>
                  <td style={cellStyle}>{item.retryable && <button onClick={() => handleRetry(item.inspectionId)} style={linkButton}>Retry</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items && items.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <button disabled={items.first} onClick={() => setPage(page - 1)} style={fieldStyle}>Previous</button>
          <span style={{ fontSize: 13, color: '#6e6e73' }}>{page + 1} / {items.totalPages}</span>
          <button disabled={items.last} onClick={() => setPage(page + 1)} style={fieldStyle}>Next</button>
        </div>
      )}
    </div>
  );
}
