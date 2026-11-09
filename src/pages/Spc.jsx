import { useEffect, useState } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { apiErrorMessage } from '../api/lotApi';
import { fetchCommonality, fetchPChart } from '../api/spcApi';
import { DEFECT_COLORS } from '../utils/defectColors';

const SERIES_COLOR = '#0071e3';
const CRITICAL_COLOR = '#c62828';
const LIMIT_COLOR = '#86868b';
const DEFECT_OPTIONS = Object.keys(DEFECT_COLORS).filter(label => label !== 'none');
const VIOLATION_LABELS = { BEYOND_UCL: 'above UCL', RUN_ABOVE_CENTER: '8 points above center' };
const TABLE_HEADERS = ['Step', 'Equipment', 'Wafers', 'Defects', 'Defect Rate', 'Others', 'Lift', 'Z', 'Signal'];

const cardStyle = { background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };
const fieldStyle = { padding: '10px 12px', borderRadius: 10, border: '1px solid #d0d0d5', fontSize: 14, background: '#fff' };
const cellStyle = { padding: '12px 16px', color: '#1d1d1f', whiteSpace: 'nowrap' };
const percent = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', padding: '10px 14px', fontSize: 13, color: '#1d1d1f' }}>
      <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{point.date}</p>
      <p style={{ margin: 0 }}>Defect rate {percent(point.rate)} ({point.defects}/{point.inspected})</p>
      <p style={{ margin: 0, color: '#6e6e73' }}>UCL {percent(point.ucl)}</p>
      {point.violations.map(v => <p key={v} style={{ margin: '4px 0 0', fontWeight: 600 }}>⚠ {VIOLATION_LABELS[v]}</p>)}
    </div>
  );
}

function RateDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null;
  const violated = payload.violations.length > 0;
  return <circle cx={cx} cy={cy} r={violated ? 6 : 4} fill={violated ? CRITICAL_COLOR : SERIES_COLOR} stroke="#fff" strokeWidth={2} />;
}

export default function Spc() {
  const [days, setDays] = useState(14);
  const [defect, setDefect] = useState('');
  const [equipment, setEquipment] = useState('');
  const [chart, setChart] = useState(null);
  const [commonality, setCommonality] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPChart({ days, defect, equipment }).then(setChart).catch(e => setError(apiErrorMessage(e)));
  }, [days, defect, equipment]);

  useEffect(() => {
    fetchCommonality({ days, defect }).then(setCommonality).catch(e => setError(apiErrorMessage(e)));
  }, [days, defect]);

  const outOfControl = chart?.points.filter(point => point.violations.length > 0) ?? [];
  const suspects = commonality?.filter(row => row.suspect) ?? [];
  const chartMax = chart?.points.length ? Math.min(1, Math.max(...chart.points.flatMap(p => [p.rate, p.ucl])) * 1.1) : 1;

  return (
    <div>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>SPC</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 24 }}>Defect control chart and equipment commonality, based on final judgements</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select aria-label="Period" value={days} onChange={e => setDays(Number(e.target.value))} style={fieldStyle}>
          {[7, 14, 30, 90].map(value => <option key={value} value={value}>Last {value} days</option>)}
        </select>
        <select aria-label="Defect type" value={defect} onChange={e => setDefect(e.target.value)} style={fieldStyle}>
          <option value="">All defects</option>
          {DEFECT_OPTIONS.map(label => <option key={label} value={label}>{label}</option>)}
        </select>
        {equipment && (
          <button onClick={() => setEquipment('')} style={{ ...fieldStyle, cursor: 'pointer', color: SERIES_COLOR }}>
            {equipment} ✕
          </button>
        )}
      </div>

      {error && <p role="alert" style={{ fontSize: 13, color: CRITICAL_COLOR, marginBottom: 16, overflowWrap: 'anywhere' }}>{error}</p>}

      {suspects.length > 0 && (
        <div role="status" style={{ ...cardStyle, padding: '16px 24px', marginBottom: 20, border: `1px solid ${CRITICAL_COLOR}` }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1d1d1f' }}>
            ⚠ Suspect equipment: {suspects.map(row => `${row.equipmentCode} (${percent(row.defectRate)} vs ${percent(row.otherDefectRate)})`).join(', ')}
          </p>
        </div>
      )}

      <div style={{ ...cardStyle, padding: '24px 28px', marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px' }}>
          {defect || 'Defect'} rate p-chart{equipment ? ` · ${equipment}` : ''}
        </h2>
        <p style={{ fontSize: 13, color: '#6e6e73', margin: '0 0 20px' }}>
          {chart ? `Center line ${percent(chart.centerLine)} · dashed line is the 3-sigma upper control limit` : 'Loading...'}
        </p>
        {chart?.points.length === 0 && <p style={{ fontSize: 14, color: '#6e6e73', textAlign: 'center', padding: 32 }}>No judged inspections in this period</p>}
        {chart?.points.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chart.points} margin={{ top: 12, right: 40, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#f0f0f2" />
              <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={{ stroke: '#e5e5e7' }} tickLine={false} />
              <YAxis domain={[0, chartMax]} tickFormatter={v => percent(v, 0)} tick={{ fontSize: 11, fill: '#6e6e73' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#d0d0d5' }} />
              <ReferenceLine y={chart.centerLine} stroke={LIMIT_COLOR} label={{ value: 'CL', position: 'right', fontSize: 11, fill: '#6e6e73' }} />
              <Line type="stepAfter" dataKey="ucl" stroke={LIMIT_COLOR} strokeWidth={1.5} strokeDasharray="5 4" dot={false} activeDot={false} isAnimationActive={false} />
              <Line type="linear" dataKey="rate" stroke={SERIES_COLOR} strokeWidth={2} dot={<RateDot />} activeDot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
        {outOfControl.length > 0 && (
          <p style={{ fontSize: 13, color: '#1d1d1f', margin: '16px 0 0' }}>
            <strong>{outOfControl.length} out-of-control {outOfControl.length === 1 ? 'point' : 'points'}:</strong>{' '}
            {outOfControl.map(p => `${p.date.slice(5)} (${p.violations.map(v => VIOLATION_LABELS[v]).join(', ')})`).join(' · ')}
          </p>
        )}
      </div>

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f2' }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Equipment commonality</h2>
          <p style={{ fontSize: 13, color: '#6e6e73', margin: '4px 0 0' }}>Each tool against the other tools in the same step. Select a tool to chart it.</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{TABLE_HEADERS.map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#6e6e73' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {commonality?.map(row => (
              <tr key={row.equipmentCode} style={{ borderTop: '1px solid #f5f5f7' }}>
                <td style={{ ...cellStyle, color: '#6e6e73' }}>{row.stepCode}</td>
                <td style={cellStyle}>
                  <button onClick={() => setEquipment(row.equipmentCode)} aria-pressed={equipment === row.equipmentCode} style={{ background: 'none', border: 'none', padding: 0, color: SERIES_COLOR, fontSize: 14, fontWeight: equipment === row.equipmentCode ? 700 : 500, cursor: 'pointer' }}>
                    {row.equipmentCode}
                  </button>
                </td>
                <td style={cellStyle}>{row.wafers}</td>
                <td style={cellStyle}>{row.defects}</td>
                <td style={{ ...cellStyle, fontWeight: 600 }}>{percent(row.defectRate)}</td>
                <td style={cellStyle}>{percent(row.otherDefectRate)}</td>
                <td style={cellStyle}>{row.lift == null ? '-' : `${row.lift.toFixed(1)}×`}</td>
                <td style={cellStyle}>{row.zScore.toFixed(1)}</td>
                <td style={cellStyle}>
                  {row.suspect
                    ? <span style={{ background: '#ffebee', color: CRITICAL_COLOR, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>⚠ Suspect</span>
                    : <span style={{ color: '#6e6e73', fontSize: 13 }}>{row.confoundedWith ? `Co-occurs with ${row.confoundedWith}` : 'Normal'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commonality?.length === 0 && <p style={{ padding: 32, textAlign: 'center', color: '#6e6e73', fontSize: 14, margin: 0 }}>No process history in this period</p>}
      </div>
    </div>
  );
}
