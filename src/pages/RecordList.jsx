import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchPagedRecords, exportRecords } from '../api/recordApi';
import { getDefectColor } from '../utils/defectColors';

const DEFECT_TYPES = ['All', 'Center', 'Donut', 'Edge-Loc', 'Edge-Ring', 'Loc', 'Near-full', 'Random', 'Scratch', 'none'];

const downloadCSV = (records, filename) => {
  const header = ['ID', 'Filename', 'Prediction', 'Confidence(%)', 'Date'];
  const rows = records.map(r => [
    r.id,
    r.filename,
    r.prediction,
    (r.confidence * 100).toFixed(1),
    r.createdAt?.slice(0, 16).replace('T', ' ')
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState('All');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const search = selected === 'All' ? '' : selected;
    fetchPagedRecords(search, page, 10).then(d => {
      setRecords(d.content);
      setTotalPages(d.totalPages);
    }).catch(console.error);
  }, [selected, page]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (type) => {
    setDownloading(true);
    setShowExportMenu(false);
    try {
      let data, filename;
      const today = new Date().toISOString().slice(0, 10);

      if (type === 'all') {
        data = await exportRecords();
        filename = `wafer_inspection_all_${today}.csv`;
      } else if (type === 'filter') {
        const prediction = selected === 'All' ? null : selected;
        data = await exportRecords(prediction);
        filename = `wafer_inspection_${selected}_${today}.csv`;
      } else if (type === 'date') {
        data = await exportRecords(null, startDate, endDate);
        filename = `wafer_inspection_${startDate}_${endDate}.csv`;
      }
      downloadCSV(data, filename);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Records</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 36 }}>All inspection results</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DEFECT_TYPES.map(type => {
            const c = type === 'All' ? null : getDefectColor(type);
            const isSelected = selected === type;
            return (
              <button
                key={type}
                onClick={() => { setSelected(type); setPage(0); }}
                style={{
                  padding: '7px 16px', borderRadius: 20,
                  border: isSelected ? 'none' : `1px solid ${c ? c.color : '#e0e0e0'}`,
                  background: isSelected ? (c ? c.color : '#1d1d1f') : (c ? c.bg : '#fff'),
                  color: isSelected ? '#fff' : (c ? c.color : '#1d1d1f'),
                  fontSize: 13, fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >{type}</button>
            );
          })}
        </div>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowExportMenu(v => !v)}
            disabled={downloading}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: downloading ? '#e0e0e0' : '#1d1d1f',
              color: '#fff', fontSize: 14, fontWeight: 600,
              border: 'none', cursor: downloading ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', whiteSpace: 'nowrap'
            }}
          >
            {downloading ? 'Downloading...' : '⬇ Export CSV ▾'}
          </button>

          {showExportMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '110%', background: '#fff',
              borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              padding: '8px', zIndex: 100, minWidth: 240
            }}>
              <button onClick={() => handleExport('all')} style={menuItemStyle}>
                전체 내보내기
              </button>
              <button onClick={() => handleExport('filter')} style={menuItemStyle}>
                현재 필터 내보내기 ({selected})
              </button>
              <div style={{ padding: '8px 12px', borderTop: '1px solid #f5f5f7', marginTop: 4 }}>
                <p style={{ fontSize: 12, color: '#6e6e73', marginBottom: 8 }}>날짜 범위 내보내기</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12 }}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 12 }}
                  />
                </div>
                <button
                  onClick={() => handleExport('date')}
                  disabled={!startDate || !endDate}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 8,
                    background: (!startDate || !endDate) ? '#f5f5f7' : '#1d1d1f',
                    color: (!startDate || !endDate) ? '#c0c0c0' : '#fff',
                    border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: (!startDate || !endDate) ? 'not-allowed' : 'pointer'
                  }}
                >내보내기</button>
              </div>
            </div>
          )}
        </div>
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
              const badge = getDefectColor(r.prediction);
              return (
                <tr key={r.id} style={{ borderTop: '1px solid #f5f5f7' }}>
                  <td style={{ padding: '14px 24px', fontSize: 14 }}>
                    <Link to={`/records/${r.id}`} style={{ color: '#1d1d1f', textDecoration: 'none' }}>{r.filename}</Link>
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

const menuItemStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  background: 'transparent', border: 'none',
  textAlign: 'left', fontSize: 13, color: '#1d1d1f',
  cursor: 'pointer', display: 'block'
};
