import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [mothers, setMothers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const riskBreakdown = {
    high:   mothers.filter(m => m.riskLevel === 'high').length,
    medium: mothers.filter(m => m.riskLevel === 'medium').length,
    low:    mothers.filter(m => m.riskLevel === 'low').length,
  };

  const statusBreakdown = {
    pregnant:  mothers.filter(m => m.status === 'pregnant').length,
    delivered: mothers.filter(m => m.status === 'delivered').length,
    postnatal: mothers.filter(m => m.status === 'postnatal').length,
  };

  const bloodGroupBreakdown = mothers.reduce((acc, m) => {
    if (m.bloodGroup) acc[m.bloodGroup] = (acc[m.bloodGroup] || 0) + 1;
    return acc;
  }, {});

  const mohAreaBreakdown = mothers.reduce((acc, m) => {
    if (m.mohArea) acc[m.mohArea] = (acc[m.mohArea] || 0) + 1;
    return acc;
  }, {});

  const total = mothers.length || 1;

  const BarChart = ({ data, colors }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
      <div>
        {Object.entries(data).map(([key, value], i) => (
          <div key={key} style={{ marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#344a5a', fontWeight: '600', textTransform: 'capitalize' }}>
                {t(key) || key}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#7f9caa', fontWeight: '500' }}>
                {value} ({Math.round((value / total) * 100)}%)
              </span>
            </div>
            <div style={{ backgroundColor: '#f0f4f7', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '20px',
                backgroundColor: colors[i % colors.length],
                width: `${(value / max) * 100}%`,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data, colors }) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    const size = 160;
    const cx = size / 2, cy = size / 2, r = 60, strokeW = 28;

    const slices = Object.entries(data).map(([key, value], i) => {
      const pct = value / total;
      const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      cumulative += pct;
      const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = pct > 0.5 ? 1 : 0;
      return { key, value, pct, x1, y1, x2, y2, largeArc, color: colors[i % colors.length] };
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f4f7" strokeWidth={strokeW} />
          {slices.filter(s => s.pct > 0).map(s => (
            <path key={s.key}
              d={`M ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.largeArc} 1 ${s.x2} ${s.y2}`}
              fill="none" stroke={s.color} strokeWidth={strokeW}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#1a3a4a">{total}</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#7f9caa">{t('total')}</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {slices.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: '#344a5a', textTransform: 'capitalize' }}>{t(s.key) || s.key}</span>
              <span style={{ fontSize: '0.78rem', color: '#7f9caa', marginLeft: 'auto' }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif", color: '#7f9caa' }}>
      {t('loading')}
    </div>
  );

  return (
    <div style={{
      height: '100vh', backgroundColor: '#f4f9fc',
      fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: '8px', padding: '0.4rem 0.875rem',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
          }}>{t('back')}</button>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('mohClinicAnalytics')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {t('reportsAnalytics')}
            </h2>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px', padding: '0.5rem 1rem',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem',
        }}>
          {new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: t('totalMothers'),  value: mothers.length,                color: '#1a3a4a', border: '#1a3a4a' },
              { label: t('highRisk'),      value: riskBreakdown.high,            color: '#c0392b', border: '#c0392b' },
              { label: t('totalChildren'), value: stats?.totalChildren || 0,     color: '#27ae60', border: '#27ae60' },
              { label: t('postnatal'),     value: statusBreakdown.postnatal,     color: '#1a6b8a', border: '#1a6b8a' },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: 'white', padding: '1.25rem 1.5rem', borderRadius: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.border}`,
              }}>
                <p style={{ margin: 0, color: '#7f9caa', fontSize: '0.78rem', fontWeight: '500' }}>{s.label}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '2rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Row 1 — Risk + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('riskLevelDistribution')}</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <DonutChart data={riskBreakdown} colors={['#c0392b', '#d68910', '#27ae60']} />
                <div style={{ marginTop: '1.25rem' }}>
                  <BarChart data={riskBreakdown} colors={['#c0392b', '#d68910', '#27ae60']} />
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('pregnancyStatus')}</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <DonutChart data={statusBreakdown} colors={['#6c5ce7', '#27ae60', '#1a6b8a']} />
                <div style={{ marginTop: '1.25rem' }}>
                  <BarChart data={statusBreakdown} colors={['#6c5ce7', '#27ae60', '#1a6b8a']} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 — Blood Groups + MOH Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('bloodGroupDistribution')}</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {Object.keys(bloodGroupBreakdown).length === 0 ? (
                  <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noDataYet')}</p>
                ) : (
                  <BarChart data={bloodGroupBreakdown} colors={['#1a6b8a', '#2d9cad', '#4db6ac', '#27ae60', '#6c5ce7', '#d68910', '#c0392b', '#e74c3c']} />
                )}
              </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('mothersByMohArea')}</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {Object.keys(mohAreaBreakdown).length === 0 ? (
                  <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noDataYet')}</p>
                ) : (
                  <BarChart data={mohAreaBreakdown} colors={['#27ae60', '#2ecc71', '#1a6b8a', '#2d9cad']} />
                )}
              </div>
            </div>
          </div>

          {/* High Risk Mothers Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
              padding: '0.875rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('highRiskActionRequired')}
              </h3>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                {riskBreakdown.high} {t('patients')}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {riskBreakdown.high === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>
                  {t('noHighRisk')}
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f4f9fc' }}>
                      {[t('nic'), t('mohArea'), t('midwifeArea'), t('status'), t('edd'), t('actions')].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mothers.filter(m => m.riskLevel === 'high').map(mother => (
                      <tr key={mother._id} style={{ borderTop: '1px solid #eef4f7' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1a3a4a' }}>{mother.nic}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{mother.mohArea}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{mother.midwifeArea}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#f0eeff', color: '#6c5ce7' }}>
                            {t(mother.status)}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>
                          {mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                            fontSize: '0.8rem', padding: '0.4rem 0.875rem',
                            backgroundColor: '#fdecea', color: '#c0392b',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                          }}>
                            {t('view')} →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Full Mothers Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
              padding: '0.875rem 1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('fullPatientRegistry')}
              </h3>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{mothers.length} {t('total')}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f9fc' }}>
                    {[t('nic'), t('fullName'), t('mohArea'), t('status'), t('riskLevel'), t('edd'), t('actions')].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mothers.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ab0bc' }}>{t('noMothersYet')}</td></tr>
                  ) : (
                    mothers.map(mother => (
                      <tr key={mother._id} style={{ borderTop: '1px solid #eef4f7' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1a3a4a' }}>{mother.nic}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{mother.fullName || 'N/A'}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{mother.mohArea}</td>
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
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>
                          {mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                            fontSize: '0.8rem', padding: '0.4rem 0.875rem',
                            backgroundColor: '#e8f6f9', color: '#1a6b8a',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
                          }}>
                            {t('view')} →
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
    </div>
  );
}