import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import LoginPage from './pages/LoginPage';
import RegisterMotherPage from './pages/RegisterMotherPage';
import Messages from './pages/Messages';
import RiskAssessment from './pages/RiskAssessment';
import Dashboard from './pages/Dashboard';
import MotherHistory from './pages/MotherHistory';
import RegisterChildPage from './pages/RegisterChildPage';
import ChildProfile from './pages/ChildProfile';
import NutritionPage from './pages/NutritionPage';
import VaccinationTracker from './pages/VaccinationTracker';
import MidwifeDashboard from './pages/MidwifeDashboard';
import MotherPortal from './pages/MotherPortal';
import ReportsPage from './pages/ReportsPage';
import PublicScan from './pages/PublicScan';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  return children;
}

function GlobalFooter() {
  const location = useLocation();
  if (location.pathname === '/') return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 8000,
      fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        padding: '0.35rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.62rem' }}>
          Copyright © 2026 - All Rights Reserved.
        </span>
      </div>
    </div>
  );
}

function App() {
  const { i18n } = useTranslation();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/register-mother" element={<ProtectedRoute><RegisterMotherPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/risk-assessment/:motherId" element={<ProtectedRoute><RiskAssessment /></ProtectedRoute>} />
        <Route path="/mother-history/:id" element={<ProtectedRoute><MotherHistory /></ProtectedRoute>} />
        <Route path="/register-child" element={<ProtectedRoute><RegisterChildPage /></ProtectedRoute>} />
        <Route path="/child/:id" element={<ProtectedRoute><ChildProfile /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
        <Route path="/vaccination" element={<ProtectedRoute><VaccinationTracker /></ProtectedRoute>} />
        <Route path="/midwife" element={<ProtectedRoute><MidwifeDashboard /></ProtectedRoute>} />
        <Route path="/mother" element={<ProtectedRoute><MotherPortal /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/scan/:barcodeId" element={<PublicScan />} />
      </Routes>
      <GlobalFooter />
    </Router>
  );
}

export default App;