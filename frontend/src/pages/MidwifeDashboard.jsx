import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function MidwifeDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mothers, setMothers] = useState([]);
  const [stats, setStats] = useState({
    totalMothers: 0, highRisk: 0, pregnant: 0, postnatal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activePath, setActivePath] = useState(window.location.pathname);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, mothersRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/mothers'),
      ]);
      setStats(statsRes.data);
      setMothers(mothersRes.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

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
    messages: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
    logout: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };

  const sidebarItems = [
    { label: t('dashboard'),      path: '/midwife',         icon: icons.dashboard },
    { label: t('registerMother'), path: '/register-mother', icon: icons.registerMother },
    { label: t('messages'),       path: '/messages',        icon: icons.messages },
    { label: t('nutrition'),      path: '/nutrition',       icon: icons.nutrition },
    { label: t('vaccination'),    path: '/vaccination',     icon: icons.vaccination },
  ];

  const statCards = [
    { label: t('totalMothers'), value: stats.totalMothers, color: '#1a3a4a', bg: '#f0f4f7' },
    { label: t('highRisk'),     value: stats.highRisk,     color: '#c0392b', bg: '#fdf0f0' },
    { label: t('pregnant'),     value: stats.pregnant,     color: '#1a3a4a', bg: '#f0f4f7' },
    { label: t('postnatal'),    value: stats.postnatal,    color: '#1a6b8a', bg: '#f0f4f7' },
  ];

  const statIcons = [
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><circle cx="12" cy="12" r="2"/></svg>,
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
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
              <p style={{ margin: 0, fontSize: '0.6rem', opacity: 0.55, letterSpacing: '0.05em', textTransform: 'uppercase' }}>සෞඛ්‍ය අමාත්‍යාංශය</p>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.6rem', opacity: 0.55 }}>சுகாதார அமைச்சு</p>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', fontWeight: '700' }}>Ministry of Health</h3>
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
                padding: '1.7rem 1rem', cursor: 'pointer', borderRadius: '10px',
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
            padding: '0.875rem 1rem', cursor: 'pointer', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '0.875rem', color: '#f1948a',
            backgroundColor: 'rgba(231,76,60,0.1)',
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
              {t('midwifeDashboard')}
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
          }}>
            {t('registerNewMother')}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
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

        {/* High Risk Mothers */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
            padding: '0.875rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
              {t('highRiskImmediate')}
            </h3>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
              {mothers.filter(m => m.riskLevel === 'high').length} {t('patients')}
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f9fc' }}>
                  {[t('nic'), t('mohArea'), t('midwifeArea'), t('status'), t('edd'), t('actions')].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ab0bc' }}>{t('loading')}</td></tr>
                ) : mothers.filter(m => m.riskLevel === 'high').length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ab0bc' }}>{t('noHighRisk')}</td></tr>
                ) : (
                  mothers.filter(m => m.riskLevel === 'high').map(mother => (
                    <tr key={mother._id} style={{ borderTop: '1px solid #eef4f7' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{mother.nic}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>{mother.mohArea}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>{mother.midwifeArea}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f0eeff', color: '#6c5ce7' }}>
                          {t(mother.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>
                        {mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                          fontSize: '0.8rem', padding: '0.4rem 0.875rem',
                          backgroundColor: '#fdecea', color: '#c0392b',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                        }}>
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

        {/* All Mothers Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
            padding: '0.875rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('allRegisteredMothers')}</h3>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{mothers.length} {t('total')}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f9fc' }}>
                  {[t('nic'), t('mohArea'), t('midwifeArea'), t('status'), t('riskLevel'), t('edd'), t('actions')].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ab0bc' }}>{t('loading')}</td></tr>
                ) : mothers.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ab0bc' }}>{t('noMothersRegistered')}</td></tr>
                ) : (
                  mothers.map(mother => (
                    <tr key={mother._id} style={{ borderTop: '1px solid #eef4f7' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{mother.nic}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>{mother.mohArea}</td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>{mother.midwifeArea}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                          backgroundColor: mother.status === 'pregnant' ? '#f0eeff' : mother.status === 'postnatal' ? '#e8f6f9' : '#eafaf1',
                          color: mother.status === 'pregnant' ? '#6c5ce7' : mother.status === 'postnatal' ? '#1a6b8a' : '#27ae60',
                        }}>
                          {t(mother.status)}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                          backgroundColor: mother.riskLevel === 'high' ? '#fdecea' : mother.riskLevel === 'medium' ? '#fef9e7' : '#eafaf1',
                          color: mother.riskLevel === 'high' ? '#c0392b' : mother.riskLevel === 'medium' ? '#d68910' : '#27ae60',
                        }}>
                          {t(mother.riskLevel)}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#4a6a7a' }}>
                        {mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                          fontSize: '0.8rem', padding: '0.4rem 0.875rem',
                          backgroundColor: '#e8f6f9', color: '#1a6b8a',
                          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                        }}>
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