import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  apiErrorMessage, fetchInspectionEvents, fetchLot, fetchProcessHistory, inspectWafer, retryInspection,
} from '../api/lotApi';
import { LOT_STATUS, WAFER_STATUS } from '../utils/waferStatus';

const cardStyle = { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const labelStyle = { fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', margin: '0 0 8px' };
const actionButton = { padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0071e3', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' };

function StatusBadge({ status }) {
  return <span style={{ background: status.bg, color: status.color, borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>{status.label}</span>;
}

function SlotPanel({ lot, wafer, onChanged }) {
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const inspection = wafer.latestInspection;
  const inspectionId = inspection?.id;
  const canInspect = lot.status === 'IN_PROGRESS' && wafer.status !== 'INSPECTING';

  useEffect(() => {
    fetchProcessHistory(wafer.waferId).then(setHistory).catch(e => setMessage(apiErrorMessage(e)));
  }, [wafer.waferId]);

  useEffect(() => {
    if (!inspectionId) {
      setEvents([]);
      return;
    }
    fetchInspectionEvents(inspectionId).then(setEvents).catch(e => setMessage(apiErrorMessage(e)));
  }, [inspectionId, inspection?.updatedAt]);

  const run = async (action) => {
    setBusy(true);
    setMessage('');
    try {
      await action();
    } catch (error) {
      setMessage(apiErrorMessage(error));
    } finally {
      setBusy(false);
      await onChanged();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) run(() => inspectWafer(lot.id, wafer.slotNo, file));
  };

  return (
    <div style={{ ...cardStyle, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Slot {wafer.slotNo}</h2>
        <StatusBadge status={WAFER_STATUS[wafer.status]} />
      </div>

      {inspection && (
        <div style={{ marginBottom: 20, fontSize: 14, color: '#1d1d1f' }}>
          <p style={{ margin: '0 0 4px' }}>Prediction: <strong>{inspection.prediction ?? '-'}</strong></p>
          <p style={{ margin: '0 0 4px' }}>Confidence: <strong>{inspection.confidence == null ? '-' : `${(inspection.confidence * 100).toFixed(1)}%`}</strong></p>
          <p style={{ margin: '0 0 4px' }}>Attempt: <strong>{inspection.attempt}</strong></p>
          {inspection.errorCode && <p style={{ margin: '0 0 4px', color: '#c62828' }}>Error: <strong>{inspection.errorCode}</strong></p>}
          <p style={{ margin: 0, fontSize: 12, color: '#6e6e73', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>trace {inspection.traceId ?? '-'}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {inspection?.retryable && <button disabled={busy} onClick={() => run(() => retryInspection(inspection.id))} style={actionButton}>Retry</button>}
        {canInspect && (
          <label style={{ ...actionButton, background: busy ? '#a0a0a0' : '#0071e3', cursor: busy ? 'not-allowed' : 'pointer' }}>
            {busy ? 'Analyzing...' : 'Inspect Image'}
            <input type="file" accept="image/*" disabled={busy} onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}
      </div>
      {message && <p role="alert" style={{ fontSize: 13, color: '#c62828', overflowWrap: 'anywhere' }}>{message}</p>}

      <p style={labelStyle}>INSPECTION TIMELINE</p>
      {events.length === 0 && <p style={{ fontSize: 13, color: '#6e6e73' }}>Not inspected yet</p>}
      <ol style={{ listStyle: 'none', margin: '0 0 20px', padding: 0 }}>
        {events.map(event => (
          <li key={event.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f7', fontSize: 13 }}>
            <span style={{ fontWeight: 500, color: event.toStatus === 'FAILED' ? '#c62828' : '#1d1d1f' }}>
              {event.toStatus}{event.errorCode ? ` · ${event.errorCode}` : ''}
            </span>
            <span style={{ color: '#6e6e73', whiteSpace: 'nowrap' }}>{new Date(event.occurredAt).toLocaleTimeString()}</span>
          </li>
        ))}
      </ol>

      <p style={labelStyle}>PROCESS HISTORY</p>
      {history.length === 0 && <p style={{ fontSize: 13, color: '#6e6e73', margin: 0 }}>No process history</p>}
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {history.map(step => (
          <li key={step.stepCode} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f7', fontSize: 13 }}>
            <span style={{ color: '#1d1d1f' }}>{step.stepCode}</span>
            <span style={{ fontWeight: 500, color: '#1d1d1f' }}>{step.equipmentCode}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    return fetchLot(id).then(setLot).catch(e => setError(apiErrorMessage(e)));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (error) return <p role="alert" style={{ color: '#c62828', fontSize: 15 }}>{error}</p>;
  if (!lot) return <p style={{ color: '#6e6e73', fontSize: 15, textAlign: 'center', marginTop: 100 }}>Loading...</p>;

  const selected = lot.wafers.find(w => w.slotNo === selectedSlot);

  return (
    <div>
      <button onClick={() => navigate('/lots')} style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: 14, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Lots</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', margin: 0 }}>{lot.lotNo}</h1>
        <StatusBadge status={LOT_STATUS[lot.status]} />
      </div>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 28 }}>{lot.product}</p>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ ...cardStyle, padding: 24, flex: '1 1 420px', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {lot.wafers.map(wafer => {
              const status = WAFER_STATUS[wafer.status];
              const isSelected = wafer.slotNo === selectedSlot;
              return (
                <button
                  key={wafer.waferId}
                  onClick={() => setSelectedSlot(wafer.slotNo)}
                  aria-pressed={isSelected}
                  title={`Slot ${wafer.slotNo}: ${status.label}`}
                  style={{
                    aspectRatio: '1', borderRadius: 12, cursor: 'pointer', background: status.bg, color: status.color,
                    border: isSelected ? '2px solid #1d1d1f' : '2px solid transparent', padding: 4,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{wafer.slotNo}</span>
                  <span style={{ fontSize: 11, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wafer.latestInspection?.prediction ?? status.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          {selected
            ? <SlotPanel key={selected.waferId} lot={lot} wafer={selected} onChanged={load} />
            : <div style={{ ...cardStyle, padding: 32, textAlign: 'center', color: '#6e6e73', fontSize: 14 }}>Select a slot to see its inspection and process history</div>}
        </div>
      </div>
    </div>
  );
}
