import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadAndAnalyze } from '../api/recordApi';

const defectBadge = (prediction) => {
  if (!prediction || prediction === 'none') return { bg: '#e8f5e9', color: '#2e7d32' };
  return { bg: '#fff3e0', color: '#e65100' };
};

export default function UploadAndAnalyze() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadAndAnalyze(file);
      setResult(data);
    } catch (e) {
      console.error('분석 실패:', e);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const badge = result ? defectBadge(result.prediction) : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 34, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', marginBottom: 8 }}>Upload</h1>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 36 }}>Upload a wafer image for AI defect analysis</p>

      {/* 드래그앤드롭 영역 */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput').click()}
        style={{
          border: `2px dashed ${dragging ? '#0071e3' : '#d0d0d5'}`,
          borderRadius: 18, padding: '48px 32px', textAlign: 'center',
          background: dragging ? '#f0f7ff' : '#fff',
          cursor: 'pointer', transition: 'all 0.2s ease',
          marginBottom: 24
        }}
      >
        <input id="fileInput" type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
        {previewUrl ? (
          <img src={previewUrl} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 12, objectFit: 'contain' }} />
        ) : (
          <>
            <p style={{ fontSize: 32, marginBottom: 8 }}>⬆️</p>
            <p style={{ fontSize: 15, color: '#1d1d1f', fontWeight: 500, marginBottom: 4 }}>Drop image here or click to upload</p>
            <p style={{ fontSize: 13, color: '#6e6e73' }}>PNG, JPG supported</p>
          </>
        )}
      </div>

      {file && (
        <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16 }}>
          Selected: <span style={{ color: '#1d1d1f', fontWeight: 500 }}>{file.name}</span>
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: loading || !file ? '#e0e0e0' : '#0071e3',
          color: loading || !file ? '#a0a0a0' : '#fff',
          fontSize: 16, fontWeight: 600, cursor: loading || !file ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s ease', marginBottom: 32
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && badge && (
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f5f5f7' }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1d1d1f', margin: 0 }}>Analysis Result</h2>
          </div>
          <div style={{ padding: '28px 32px', display: 'flex', gap: 32, alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 8 }}>PREDICTION</p>
              <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '5px 16px', fontSize: 15, fontWeight: 600 }}>
                {result.prediction}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#6e6e73', fontWeight: 600, letterSpacing: '0.3px', marginBottom: 8 }}>CONFIDENCE</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.5px', margin: 0 }}>
                {(result.confidence * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <div style={{ padding: '0 32px 28px' }}>
            <div style={{ background: '#f5f5f7', borderRadius: 8, height: 8 }}>
              <div style={{
                background: result.confidence > 0.8 ? '#34c759' : result.confidence > 0.5 ? '#ff9f0a' : '#ff3b30',
                borderRadius: 8, height: 8, width: `${result.confidence * 100}%`,
                transition: 'width 0.8s ease'
              }} />
            </div>
          </div>
          <div style={{ padding: '0 32px 28px' }}>
            <button
              onClick={() => navigate(`/records/${result.id}`)}
              style={{
                padding: '10px 24px', borderRadius: 10, border: '1px solid #0071e3',
                background: 'transparent', color: '#0071e3', fontSize: 14,
                fontWeight: 500, cursor: 'pointer'
              }}
            >View Detail →</button>
          </div>
        </div>
      )}
    </div>
  );
}