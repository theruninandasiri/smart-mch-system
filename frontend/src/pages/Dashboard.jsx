import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMothers: 0, highRisk: 0, mediumRisk: 0,
    lowRisk: 0, pregnant: 0, delivered: 0, postnatal: 0, totalChildren: 0,
  });
  const [mothers, setMothers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePath, setActivePath] = useState(window.location.pathname);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, mothersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/mothers'),
      ]);
      const childrenRes = await Promise.all(
        mothersRes.data.map(m => api.get(`/children/mother/${m._id}`))
      );
      const totalChildren = childrenRes.reduce((sum, r) => sum + r.data.length, 0);
      setStats({ ...statsRes.data, totalChildren });
      setMothers(mothersRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = async () => {
    if (!searchId.trim()) { toast.error('Please enter a patient ID'); return; }
    setSearchLoading(true);
    try {
      const res = await api.get(`/mothers/barcode/${searchId.trim()}`);
      setSearchResult(res.data);
      toast.success('Patient found!');
    } catch {
      toast.error('Patient not found. Check the ID.');
      setSearchResult(null);
    }
    setSearchLoading(false);
  };

  const icons = {
    dashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    registerMother: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <line x1="12" y1="11" x2="12" y2="17"/>
        <line x1="9" y1="14" x2="15" y2="14"/>
      </svg>
    ),
    nutrition: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        <line x1="12" y1="9" x2="12" y2="15"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
      </svg>
    ),
    vaccination: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
        <path d="m14.5 5.5 4 4"/>
        <path d="M3 22l3-3"/>
      </svg>
    ),
    messages: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    reports: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    logout: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };

  const sidebarItems = [
    { label: t('dashboard'),      path: '/dashboard',       icon: icons.dashboard },
    { label: t('registerMother'), path: '/register-mother', icon: icons.registerMother },
    { label: t('nutrition'),      path: '/nutrition',       icon: icons.nutrition },
    { label: t('vaccination'),    path: '/vaccination',     icon: icons.vaccination },
    { label: t('messages'),       path: '/messages',        icon: icons.messages },
    { label: t('reports'),        path: '/reports',         icon: icons.reports },
  ];

  const statCards = [
    { label: t('totalMothers'), value: stats.totalMothers,  color: '#1a3a4a', bg: '#f0f4f7' },
    { label: t('highRisk'),     value: stats.highRisk,      color: '#c0392b', bg: '#fdf0f0' },
    { label: t('pregnant'),     value: stats.pregnant,      color: '#1a3a4a', bg: '#f0f4f7' },
    { label: t('delivered'),    value: stats.delivered,     color: '#1a6b8a', bg: '#f0f4f7' },
    { label: t('postnatal'),    value: stats.postnatal,     color: '#1a3a4a', bg: '#f0f4f7' },
    { label: t('children05'),   value: stats.totalChildren, color: '#1a6b8a', bg: '#f0f4f7' },
  ];

  const statIcons = [
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><circle cx="12" cy="12" r="2"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif", backgroundColor: '#f4f9fc' }}>

      {/* Sidebar */}
      <div style={{
        width: '240px', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh',
        background: 'linear-gradient(180deg, #1a3a4a 0%, #1a6b8a 100%)',
        color: 'white', display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="MOH Logo" style={{ height: '48px', objectFit: 'contain',borderRadius:'50px' }} />
            <div>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', fontWeight: '700' }}>Smart MCH System</h3>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.65rem 0.875rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>{user?.name}</p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', opacity: 0.55, textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 0.5rem 0.25rem', fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
            {t('mainMenu')}
          </p>
          {sidebarItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <div key={item.path} onClick={() => { setActivePath(item.path); navigate(item.path); }} style={{
                padding: '1.3rem 1rem', cursor: 'pointer', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'all 0.2s',
                backgroundColor: isActive ? 'rgba(77,182,172,0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #4db6ac' : '3px solid transparent',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#4db6ac' : 'rgba(255,255,255,0.8)',
              }}>
                <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 0.75rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div onClick={handleLogout} style={{
            padding: '0.7rem 1rem', cursor: 'pointer', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '0.875rem', color: '#f1948a',
            backgroundColor: 'rgba(231,76,60,0.1)', transition: 'background 0.2s',
          }}>
            <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icons.logout}
            </span>
            <span>{t('logout')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '240px', padding: '2rem 2.5rem', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#1a3a4a' }}>
              {t('clinicDashboard')}
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#7f9caa', fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={() => navigate('/register-mother')} style={{
            background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
            color: 'white', border: 'none', borderRadius: '10px',
            padding: '0.7rem 1.25rem', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: '600',
            boxShadow: '0 4px 12px rgba(26,107,138,0.3)',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            {t('registerNewMother')}
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((stat, i) => (
            <div key={stat.label} style={{
              backgroundColor: 'white', padding: '1.25rem 1.5rem', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: '1rem',
              borderLeft: `4px solid ${stat.color}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)'; }}
            >
              <div style={{
                width: '50px', height: '50px', backgroundColor: stat.bg,
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                color: stat.color, border: `1px solid ${stat.color}22`,
              }}>
                {statIcons[i]}
              </div>
              <div>
                <p style={{ margin: 0, color: '#7f9caa', fontSize: '0.78rem', fontWeight: '500' }}>{stat.label}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: '700', color: stat.color, lineHeight: 1 }}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Patient Lookup */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: '700' }}>Patient Lookup</h3>
              <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Enter patient ID to retrieve mother's record</p>
            </div>
          </div>
          <div style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter patient ID (e.g. MCH1748234567890)"
                style={{
                  flex: 1, padding: '0.7rem 1rem', borderRadius: '8px',
                  border: '2px solid #e8f0f5', fontSize: '0.875rem',
                  fontFamily: 'monospace', outline: 'none', color: '#1a3a4a',
                  backgroundColor: '#f7fbfd',
                }}
                onFocus={e => e.target.style.borderColor = '#1a6b8a'}
                onBlur={e => e.target.style.borderColor = '#e8f0f5'}
              />
              <button onClick={handleSearch} disabled={searchLoading} style={{
                padding: '0.7rem 1.25rem',
                background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: '600',
                cursor: searchLoading ? 'not-allowed' : 'pointer',
                opacity: searchLoading ? 0.7 : 1, whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(26,107,138,0.3)',
              }}>
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p style={{ color: '#9ab0bc', fontSize: '0.75rem', margin: '0 0 1rem' }}>
              Tip: Find the patient ID on the printed health card or in the mothers table below
            </p>

            {searchResult && (
              <div style={{ border: '2px solid #b2d8e0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#f0fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: '#1a3a4a', fontSize: '0.95rem', fontWeight: '700' }}>Patient Found</h4>
                      <p style={{ margin: '0.1rem 0 0', fontFamily: 'monospace', fontSize: '0.78rem', color: '#7f9caa' }}>{searchResult.barcodeId}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.875rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                    backgroundColor: searchResult.riskLevel === 'high' ? '#fdecea' : searchResult.riskLevel === 'medium' ? '#fef9e7' : '#eafaf1',
                    color: searchResult.riskLevel === 'high' ? '#c0392b' : searchResult.riskLevel === 'medium' ? '#d68910' : '#27ae60',
                    border: `1px solid ${searchResult.riskLevel === 'high' ? '#f5c6c2' : searchResult.riskLevel === 'medium' ? '#f5e6b2' : '#a8e6c2'}`,
                  }}>
                    {searchResult.riskLevel?.toUpperCase()} RISK
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'NIC',         value: searchResult.nic },
                    { label: 'MOH Area',    value: searchResult.mohArea },
                    { label: 'Blood Group', value: searchResult.bloodGroup },
                    { label: 'Status',      value: searchResult.status },
                    { label: 'EDD',         value: searchResult.edd ? new Date(searchResult.edd).toLocaleDateString() : 'N/A' },
                    { label: 'Pregnancy',   value: `No. ${searchResult.pregnancyNumber}` },
                  ].map(d => (
                    <div key={d.label} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '0.5rem 0.75rem', border: '1px solid #e8f0f5' }}>
                      <p style={{ margin: 0, fontSize: '0.68rem', color: '#7f9caa', fontWeight: '500' }}>{d.label}</p>
                      <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => navigate(`/mother-history/${searchResult._id}`)} style={{ flex: 1, padding: '0.65rem', background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                    ⏱ Full History
                  </button>
                  <button onClick={() => navigate(`/risk-assessment/${searchResult._id}`)} style={{ flex: 1, padding: '0.65rem', background: searchResult.riskLevel === 'high' ? '#c0392b' : '#1a6b8a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                    ⚠︎ Risk Assessment
                  </button>
                  <button onClick={() => navigate(`/register-child?motherId=${searchResult._id}`)} style={{ flex: 1, padding: '0.65rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                    𖠋 Register Child
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mothers Table - UPDATED STYLES */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
          overflow: 'hidden',
          border: '1px solid #eef4f7'
        }}>
          <div style={{ 
            padding: '1.25rem 1.5rem', 
            borderBottom: '1px solid #eef4f7', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <h3 style={{ margin: 0, color: '#1a3a4a', fontWeight: '700', fontSize: '1.05rem' }}>
                {t('registeredMothers')}
              </h3>
              <p style={{ margin: '0.15rem 0 0', color: '#9ab0bc', fontSize: '0.8rem' }}>
                {mothers.length} {t('totalRecords')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                padding: '0.4rem 1rem',
                background: 'transparent',
                border: '1px solid #e8f0f5',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#4a6a7a',
                cursor: 'pointer',
              }}>
                Export
              </button>
              <button style={{
                padding: '0.4rem 1rem',
                background: '#1a6b8a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
              }}>
                + Add
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto', padding: '0 0.25rem 0.25rem 0.25rem' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: '0 4px'
            }}>
              <thead>
                <tr>
                  {[t('nic'), t('mohArea'), t('midwifeArea'), t('status'), t('riskLevel'), t('edd'), t('barcodeId'), t('actions')].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.7rem',
                      color: '#5a7a8a',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      backgroundColor: '#f7fbfd',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#9ab0bc' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        <span>{t('loading')}</span>
                      </div>
                    </td>
                  </tr>
                ) : mothers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: '#9ab0bc' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>♀</div>
                      <p style={{ margin: 0, fontWeight: '500', color: '#4a6a7a' }}>{t('noMothersYet')}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{t('clickToGetStarted')}</p>
                    </td>
                  </tr>
                ) : (
                  mothers.map((mother) => (
                    <tr key={mother._id} style={{
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                      borderRadius: '8px',
                    }}>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        color: '#1a3a4a',
                        borderRadius: '8px 0 0 8px',
                      }}>
                        {mother.nic}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        color: '#4a6a7a',
                      }}>
                        <span style={{
                          background: '#f0f6fa',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.78rem',
                        }}>
                          {mother.mohArea}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        color: '#4a6a7a',
                      }}>
                        {mother.midwifeArea}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: '600',
                          backgroundColor: mother.status === 'pregnant' ? '#e8eaf6' : mother.status === 'postnatal' ? '#e0f2f1' : '#e8f5e9',
                          color: mother.status === 'pregnant' ? '#5c6bc0' : mother.status === 'postnatal' ? '#00897b' : '#43a047',
                          border: '1px solid',
                          borderColor: mother.status === 'pregnant' ? '#c5cae9' : mother.status === 'postnatal' ? '#b2dfdb' : '#c8e6c9',
                        }}>
                          {t(mother.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          backgroundColor: mother.riskLevel === 'high' ? '#ffebee' : mother.riskLevel === 'medium' ? '#fff8e1' : '#e8f5e9',
                          color: mother.riskLevel === 'high' ? '#c62828' : mother.riskLevel === 'medium' ? '#ef6c00' : '#2e7d32',
                          border: '1px solid',
                          borderColor: mother.riskLevel === 'high' ? '#ffcdd2' : mother.riskLevel === 'medium' ? '#ffecb3' : '#c8e6c9',
                        }}>
                          {t(mother.riskLevel)}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        color: '#4a6a7a',
                      }}>
                        {mother.edd ? new Date(mother.edd).toLocaleDateString() : '—'}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.7rem',
                        color: '#9ab0bc',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                      }}>
                        {mother.barcodeId}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0 8px 8px 0',
                      }}>
                        <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                          fontSize: '0.75rem',
                          padding: '0.35rem 1rem',
                          background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(26,107,138,0.2)',
                        }}
                          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 4px 12px rgba(26,107,138,0.3)'; }}
                          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 2px 8px rgba(26,107,138,0.2)'; }}
                        >
                          {t('view')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;