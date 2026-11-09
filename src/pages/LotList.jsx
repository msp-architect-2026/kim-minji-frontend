import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiErrorMessage, createLot, fetchLots, simulate } from '../api/lotApi';
import { LOT_STATUS } from '../utils/waferStatus';

const PAGE_SIZE = 20;
const cardStyle = { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const inputStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #d0d0d5', fontSize: 14, minWidth: 0, flex: 1 };
const primaryButton = { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#0071e3', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' };
const secondaryButton = { padding: '10px 20px', borderRadius: 10, border: '1px solid #0071e3', background: 'transparent', color: '#0071e3', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
const headers = ['Lot No', 'Product', 'Status', 'Wafers', 'Pass', 'Defect', 'Review', 'Failed', 'Created'];

export default function LotList() {
  const [lots, setLots] = useState(null);
  const [page, setPage] = useState(0);
  const [form, setForm] = useState({ lotNo: '', product: '', waferCount: 25 });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const load = useCallback(() => {
    return fetchLots(page, PAGE_SIZE).then(setLots).catch(e => setMessage(apiErrorMessage(e)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const lot = await createLot({ ...form, waferCount: Number(form.waferCount) });
      navigate(`/lots/${lot.id}`);
    } catch (error) {
      setMessage(apiErrorMessage(error));
    }
  };

  const handleSimulate = async () => {
    try {
      const result = await simulate();
      setMessage(`Simulated ${result.lots} lots (${result.excursionLots} through ${result.excursionEquipment}).`);
      await load();
    } catch (error) {
      setMessage(apiErrorMessage(error));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Lots</h1>
          <p style={{ fontSize: 15, color: '#6e6e73', margin: 0 }}>Track wafer lots and inspection progress</p>
        </div>
        {import.meta.env.DEV && <button onClick={handleSimulate} style={secondaryButton}>Simulate</button>}
      </div>

      <form onSubmit={handleCreate} style={{ ...cardStyle, padding: 20, display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input required maxLength={50} placeholder="Lot No" value={form.lotNo} onChange={e => setForm({ ...form, lotNo: e.target.value })} style={inputStyle} />
        <input required maxLength={50} placeholder="Product" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} style={inputStyle} />
        <input required type="number" min={1} max={25} aria-label="Wafer count" value={form.waferCount} onChange={e => setForm({ ...form, waferCount: e.target.value })} style={{ ...inputStyle, flex: '0 0 90px' }} />
        <button type="submit" style={primaryButton}>Create Lot</button>
      </form>

      {message && <p role="status" style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16 }}>{message}</p>}

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              {headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 12, color: '#6e6e73', borderBottom: '1px solid #f0f0f2', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lots?.content.map(lot => {
              const status = LOT_STATUS[lot.status];
              return (
                <tr key={lot.id} onClick={() => navigate(`/lots/${lot.id}`)} style={{ cursor: 'pointer', borderBottom: '1px solid #f5f5f7' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#1d1d1f', whiteSpace: 'nowrap' }}>{lot.lotNo}</td>
                  <td style={{ padding: '14px 16px', color: '#6e6e73' }}>{lot.product}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: status.bg, color: status.color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{status.label}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{lot.waferCount}</td>
                  <td style={{ padding: '14px 16px', color: '#2e7d32' }}>{lot.passCount}</td>
                  <td style={{ padding: '14px 16px', color: '#e65100' }}>{lot.defectCount}</td>
                  <td style={{ padding: '14px 16px', color: '#b26a00' }}>{lot.reviewCount}</td>
                  <td style={{ padding: '14px 16px', color: '#c62828' }}>{lot.failedCount}</td>
                  <td style={{ padding: '14px 16px', color: '#6e6e73', whiteSpace: 'nowrap' }}>{new Date(lot.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lots?.content.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: '#6e6e73', fontSize: 14, margin: 0 }}>No lots yet</p>}
      </div>

      {lots && lots.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 20 }}>
          <button disabled={lots.first} onClick={() => setPage(page - 1)} style={secondaryButton}>Previous</button>
          <span style={{ fontSize: 13, color: '#6e6e73' }}>{page + 1} / {lots.totalPages}</span>
          <button disabled={lots.last} onClick={() => setPage(page + 1)} style={secondaryButton}>Next</button>
        </div>
      )}
    </div>
  );
}
