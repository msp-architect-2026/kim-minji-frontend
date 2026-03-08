import { Routes, Route, Link, useLocation } from 'react-router-dom';
import RecordList from './pages/RecordList';
import RecordDetail from './pages/RecordDetail';
import UploadAndAnalyze from './pages/UploadAndAnalyze';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';

function Nav() {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/analyze', label: 'Upload' },
    { to: '/records', label: 'Records' },
    { to: '/analytics', label: 'Analytics' },
  ];
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #e5e5e7', height: 52,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px'
    }}>
      <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.3px', color: '#1d1d1f' }}>
        Wafer AI
      </span>
      <nav style={{ display: 'flex', gap: 32 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            fontSize: 14, fontWeight: 400,
            color: location.pathname === l.to ? '#0071e3' : '#1d1d1f',
            textDecoration: 'none',
            borderBottom: location.pathname === l.to ? '2px solid #0071e3' : '2px solid transparent',
            paddingBottom: 2
          }}>{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}

function App() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif', background: '#f5f5f7', minHeight: '100vh' }}>
      <Nav />
      <main style={{ paddingTop: 72, maxWidth: 1080, margin: '0 auto', padding: '72px 24px 48px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyze" element={<UploadAndAnalyze />} />
          <Route path="/records" element={<RecordList />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;