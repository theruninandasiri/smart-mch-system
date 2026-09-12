import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

function SVGChart({ data, yKey, yLabel, color }) {
  const width = 800;
  const height = 280;
  const padL = 50, padR = 20, padT = 20, padB = 40;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const validData = data.filter(d => d.month !== undefined);
  const months = validData.map(d => d.month);
  const allVals = validData.flatMap(d => [d.low, d.high, d[yKey]].filter(v => v != null));
  if (allVals.length === 0) return null;
  const minVal = Math.floor(Math.min(...allVals) * 0.95);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.05);
  const minMonth = Math.min(...months);
  const maxMonth = Math.max(...months);

  const xScale = m => padL + ((m - minMonth) / (maxMonth - minMonth)) * chartW;
  const yScale = v => padT + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const makePath = (key) => {
    const pts = validData.filter(d => d[key] != null);
    if (pts.length === 0) return '';
    return pts.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.month)} ${yScale(d[key])}`).join(' ');
  };

  const makeArea = () => {
    const pts = validData.filter(d => d.low != null && d.high != null);
    if (pts.length === 0) return '';
    const top = pts.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.month)} ${yScale(d.high)}`).join(' ');
    const bottom = [...pts].reverse().map(d => `L ${xScale(d.month)} ${yScale(d.low)}`).join(' ');
    return `${top} ${bottom} Z`;
  };

  const yTicks = Array.from({ length: 6 }, (_, i) => minVal + Math.round((maxVal - minVal) * i / 5));
  const xTicks = [0, 6, 12, 18, 24, 36, 48, 60].filter(m => m >= minMonth && m <= maxMonth);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '400px', fontFamily: 'Segoe UI, sans-serif' }}>
        {yTicks.map(v => (
          <line key={v} x1={padL} y1={yScale(v)} x2={width - padR} y2={yScale(v)} stroke="#f0f4f7" strokeWidth="1" />
        ))}
        <path d={makeArea()} fill="#27ae6015" />
        <path d={makePath('low')} fill="none" stroke="#27ae60" strokeWidth="1.5" strokeDasharray="6 4" />
        <path d={makePath('high')} fill="none" stroke="#27ae60" strokeWidth="1.5" strokeDasharray="6 4" />
        <path d={makePath('median')} fill="none" stroke="#1a6b8a" strokeWidth="2" strokeDasharray="4 3" />
        <path d={makePath(yKey)} fill="none" stroke={color} strokeWidth="3" />
        {validData.filter(d => d[yKey] != null).map(d => (
          <circle key={d.month} cx={xScale(d.month)} cy={yScale(d[yKey])} r="5" fill={color} stroke="white" strokeWidth="2" />
        ))}
        <line x1={padL} y1={padT + chartH} x2={width - padR} y2={padT + chartH} stroke="#d0dde5" strokeWidth="1" />
        {xTicks.map(m => (
          <g key={m}>
            <line x1={xScale(m)} y1={padT + chartH} x2={xScale(m)} y2={padT + chartH + 5} stroke="#d0dde5" />
            <text x={xScale(m)} y={padT + chartH + 18} textAnchor="middle" fontSize="11" fill="#7f9caa">{m}</text>
          </g>
        ))}
        <text x={padL + chartW / 2} y={height - 2} textAnchor="middle" fontSize="11" fill="#9ab0bc">Age (months)</text>
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#d0dde5" strokeWidth="1" />
        {yTicks.map(v => (
          <g key={v}>
            <line x1={padL - 5} y1={yScale(v)} x2={padL} y2={yScale(v)} stroke="#d0dde5" />
            <text x={padL - 8} y={yScale(v) + 4} textAnchor="end" fontSize="11" fill="#7f9caa">{v}</text>
          </g>
        ))}
        <text x={12} y={padT + chartH / 2} textAnchor="middle" fontSize="11" fill="#9ab0bc" transform={`rotate(-90, 12, ${padT + chartH / 2})`}>{yLabel}</text>
      </svg>
    </div>
  );
}

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isStaff = user?.role === 'moh_officer' || user?.role === 'midwife';

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [growthForm, setGrowthForm] = useState({ ageInMonths: '', weight: '', height: '', headCircumference: '', notes: '' });
  const [visitForm, setVisitForm] = useState({ visitDate: '', weight: '', height: '', notes: '', nextVisitDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchChild(); }, [id]);

  const fetchChild = async () => {
    try {
      const { data } = await api.get(`/children/${id}`);
      setChild(data);
    } catch (err) {
      toast.error('Failed to load child profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrowth = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/children/${id}/growth`, growthForm);
      setChild(data);
      setGrowthForm({ ageInMonths: '', weight: '', height: '', headCircumference: '', notes: '' });
      toast.success('Growth record added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add growth record');
    }
    setSubmitting(false);
  };

  const handleAddVisit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/children/${id}/visit`, visitForm);
      setChild(data);
      setVisitForm({ visitDate: '', weight: '', height: '', notes: '', nextVisitDate: '' });
      toast.success('Clinic visit logged');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log visit');
    }
    setSubmitting(false);
  };

  const getAgeDisplay = (dob) => {
    const birth = new Date(dob);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return t('newborn');
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m` : `${years} year${years > 1 ? 's' : ''}`;
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.875rem', borderRadius: '8px',
    border: '2px solid #e8f0f5', fontSize: '0.875rem', boxSizing: 'border-box',
    outline: 'none', color: '#1a3a4a', backgroundColor: '#f7fbfd',
    transition: 'border-color 0.2s',
    fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.3rem', color: '#344a5a',
    fontWeight: '600', fontSize: '0.78rem',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  };

  const focus = (e) => e.target.style.borderColor = '#1a6b8a';
  const blur  = (e) => e.target.style.borderColor = '#e8f0f5';

  const whoWeight = [
    { month: 0,  median: 3.3,  low: 2.5,  high: 4.3  },
    { month: 1,  median: 4.5,  low: 3.4,  high: 5.7  },
    { month: 2,  median: 5.6,  low: 4.3,  high: 7.1  },
    { month: 3,  median: 6.4,  low: 4.9,  high: 8.0  },
    { month: 4,  median: 7.0,  low: 5.4,  high: 8.7  },
    { month: 5,  median: 7.5,  low: 5.8,  high: 9.3  },
    { month: 6,  median: 7.9,  low: 6.1,  high: 9.8  },
    { month: 9,  median: 8.9,  low: 6.9,  high: 11.0 },
    { month: 12, median: 9.6,  low: 7.5,  high: 11.9 },
    { month: 18, median: 10.9, low: 8.4,  high: 13.6 },
    { month: 24, median: 12.2, low: 9.3,  high: 15.3 },
    { month: 36, median: 14.3, low: 10.8, high: 18.1 },
    { month: 48, median: 16.3, low: 12.1, high: 20.9 },
    { month: 60, median: 18.3, low: 13.4, high: 23.9 },
  ];

  const whoHeight = [
    { month: 0,  median: 49.9,  low: 46.3,  high: 53.4  },
    { month: 1,  median: 54.7,  low: 51.1,  high: 58.4  },
    { month: 2,  median: 58.4,  low: 54.7,  high: 62.2  },
    { month: 3,  median: 61.4,  low: 57.6,  high: 65.3  },
    { month: 4,  median: 63.9,  low: 60.0,  high: 67.8  },
    { month: 5,  median: 65.9,  low: 61.9,  high: 69.9  },
    { month: 6,  median: 67.6,  low: 63.6,  high: 71.6  },
    { month: 9,  median: 71.5,  low: 67.3,  high: 75.8  },
    { month: 12, median: 75.0,  low: 70.6,  high: 79.4  },
    { month: 18, median: 81.8,  low: 76.9,  high: 86.7  },
    { month: 24, median: 87.8,  low: 82.3,  high: 93.2  },
    { month: 36, median: 96.5,  low: 90.7,  high: 102.7 },
    { month: 48, median: 103.3, low: 96.7,  high: 110.3 },
    { month: 60, median: 110.0, low: 103.2, high: 116.4 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7f9caa', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif" }}>
      {t('loading')}
    </div>
  );

  if (!child) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7f9caa', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif" }}>
      Child not found
    </div>
  );

  const tabs = [
    { key: 'overview', label: t('overview') },
    { key: 'growth',   label: t('growthRecords') },
    { key: 'chart',    label: t('growthChart') },
    { key: 'visits',   label: t('clinicVisits') },
  ];

  const getChildWeightData = () => {
    const data = whoWeight.map(ref => {
      const record = child.growthRecords.find(r => Number(r.ageInMonths) === ref.month);
      return { ...ref, childWeight: record ? Number(record.weight) : null };
    });
    child.growthRecords.forEach(r => {
      if (!data.find(d => d.month === Number(r.ageInMonths))) {
        data.push({ month: Number(r.ageInMonths), childWeight: Number(r.weight), median: null, low: null, high: null });
      }
    });
    return data.sort((a, b) => a.month - b.month);
  };

  const getChildHeightData = () => {
    const data = whoHeight.map(ref => {
      const record = child.growthRecords.find(r => Number(r.ageInMonths) === ref.month);
      return { ...ref, childHeight: record ? Number(record.height) : null };
    });
    child.growthRecords.forEach(r => {
      if (!data.find(d => d.month === Number(r.ageInMonths))) {
        data.push({ month: Number(r.ageInMonths), childHeight: Number(r.height), median: null, low: null, high: null });
      }
    });
    return data.sort((a, b) => a.month - b.month);
  };

  const latestRecord = child.growthRecords.length > 0
    ? child.growthRecords[child.growthRecords.length - 1]
    : null;

  const getWeightStatus = () => {
    if (!latestRecord) return null;
    const ref = whoWeight.find(r => r.month === Number(latestRecord.ageInMonths))
      || whoWeight.reduce((prev, curr) => Math.abs(curr.month - latestRecord.ageInMonths) < Math.abs(prev.month - latestRecord.ageInMonths) ? curr : prev);
    if (Number(latestRecord.weight) < ref.low) return { status: t('underweight'), color: '#c0392b', bg: '#fdecea', border: '#f5c6c2' };
    if (Number(latestRecord.weight) > ref.high) return { status: t('overweight'), color: '#d68910', bg: '#fef9e7', border: '#f5e6b2' };
    return { status: t('normalWeight'), color: '#27ae60', bg: '#eafaf1', border: '#a8e6c2' };
  };

  const getHeightStatus = () => {
    if (!latestRecord) return null;
    const ref = whoHeight.find(r => r.month === Number(latestRecord.ageInMonths))
      || whoHeight.reduce((prev, curr) => Math.abs(curr.month - latestRecord.ageInMonths) < Math.abs(prev.month - latestRecord.ageInMonths) ? curr : prev);
    if (Number(latestRecord.height) < ref.low) return { status: t('stunted'), color: '#c0392b', bg: '#fdecea', border: '#f5c6c2' };
    if (Number(latestRecord.height) > ref.high) return { status: t('tall'), color: '#1a6b8a', bg: '#e8f6f9', border: '#b2d8e0' };
    return { status: t('normalHeight'), color: '#27ae60', bg: '#eafaf1', border: '#a8e6c2' };
  };

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
              {t('childHealthRecord')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700', textTransform: 'capitalize' }}>
              {t(child.gender)} · {getAgeDisplay(child.dateOfBirth)}
            </h2>
          </div>
        </div>
        {child.mother && (
          <Link to={`/mother-history/${child.mother._id}`} style={{
            backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: '8px', padding: '0.4rem 0.875rem',
            fontSize: '0.82rem', fontWeight: '500', textDecoration: 'none',
          }}>
            View Mother →
          </Link>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Birth Info */}
          <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('birthInfo')}</h3>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: t('gender'),      value: t(child.gender) },
                  { label: t('dateOfBirth'), value: new Date(child.dateOfBirth).toLocaleDateString() },
                  { label: t('age'),         value: getAgeDisplay(child.dateOfBirth) },
                  { label: t('bloodGroup'),  value: child.bloodGroup || 'N/A' },
                  { label: t('birthWeight'), value: `${child.birthWeight} kg` },
                  { label: t('birthHeight'), value: child.birthHeight ? `${child.birthHeight} cm` : 'N/A' },
                  ...(child.mother ? [
                    { label: t('motherNIC'), value: child.mother.nic },
                    { label: t('mohArea'),   value: child.mother.mohArea },
                  ] : []),
                ].map(d => (
                  <div key={d.label} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f4f7' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button onClick={() => navigate(`/vaccination?childId=${child._id}`)} style={{
                  flex: 1, padding: '0.7rem', background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                  color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                }}>{t('vaccinationTracker')}</button>
                {child.mother && (
                  <button onClick={() => navigate(`/nutrition?motherId=${child.mother._id}`)} style={{
                    flex: 1, padding: '0.7rem', background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                    color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  }}>{t('nutritionTracker')}</button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '0.6rem 1.25rem', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                border: 'none', transition: 'all 0.2s',
                backgroundColor: activeTab === tab.key ? '#1a6b8a' : 'white',
                color: activeTab === tab.key ? 'white' : '#4a6a7a',
                boxShadow: activeTab === tab.key ? '0 4px 12px rgba(26,107,138,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('latestGrowth')}</h3>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {child.growthRecords.length === 0 ? (
                    <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noGrowthYet')}</p>
                  ) : (() => {
                    const latest = child.growthRecords[child.growthRecords.length - 1];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                          { label: t('age'),         value: `${latest.ageInMonths} months` },
                          { label: t('weight'),      value: `${latest.weight} kg` },
                          { label: t('birthHeight'), value: `${latest.height} cm` },
                          ...(latest.headCircumference ? [{ label: 'Head Circ.', value: `${latest.headCircumference} cm` }] : []),
                        ].map(d => (
                          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f7', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#9ab0bc' }}>{d.label}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {/* Only show for staff */}
                  {isStaff && (
                    <button onClick={() => setActiveTab('growth')} style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#1a6b8a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                      {t('addGrowthRecord')}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('lastClinicVisit')}</h3>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {child.clinicVisits.length === 0 ? (
                    <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noVisitsYet')}</p>
                  ) : (() => {
                    const latest = child.clinicVisits[child.clinicVisits.length - 1];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f7', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', color: '#9ab0bc' }}>Date</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{new Date(latest.visitDate).toLocaleDateString()}</span>
                        </div>
                        {latest.weight && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f7', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#9ab0bc' }}>{t('weight')}</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{latest.weight} kg</span>
                          </div>
                        )}
                        {latest.nextVisitDate && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f4f7', paddingBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#9ab0bc' }}>Next Visit</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a6b8a' }}>{new Date(latest.nextVisitDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {latest.notes && <p style={{ fontSize: '0.78rem', color: '#9ab0bc', fontStyle: 'italic', margin: 0 }}>"{latest.notes}"</p>}
                      </div>
                    );
                  })()}
                  {/* Only show for staff */}
                  {isStaff && (
                    <button onClick={() => setActiveTab('visits')} style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#27ae60', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                      {t('logClinicVisit')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Growth Tab */}
          {activeTab === 'growth' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Add Growth Form — staff only */}
              {isStaff && (
                <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('addGrowthRecord')}</h3>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleAddGrowth}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                          { label: `${t('age')} (months) *`,     key: 'ageInMonths',       type: 'number', placeholder: 'e.g. 3' },
                          { label: `${t('weight')} (kg) *`,       key: 'weight',            type: 'number', placeholder: 'e.g. 5.5', step: '0.01' },
                          { label: `Height (cm) *`,  key: 'height',            type: 'number', placeholder: 'e.g. 58',  step: '0.1' },
                          { label: 'Head Circ. (cm)',              key: 'headCircumference', type: 'number', placeholder: 'e.g. 38',  step: '0.1' },
                          { label: t('notes'),                    key: 'notes',             type: 'text',   placeholder: 'Optional notes', span: 2 },
                        ].map(f => (
                          <div key={f.key} style={{ gridColumn: f.span ? `span ${f.span}` : 'span 1' }}>
                            <label style={labelStyle}>{f.label}</label>
                            <input style={inputStyle} type={f.type} step={f.step} value={growthForm[f.key]} placeholder={f.placeholder}
                              onChange={e => setGrowthForm({...growthForm, [f.key]: e.target.value})}
                              required={f.label.includes('*')} onFocus={focus} onBlur={blur} />
                          </div>
                        ))}
                      </div>
                      <button type="submit" disabled={submitting} style={{
                        padding: '0.7rem 1.5rem',
                        background: submitting ? '#9ab0bc' : 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.875rem', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
                      }}>
                        {submitting ? t('loading') : t('addRecord')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Growth Records Table */}
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('growthRecords')}</h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{child.growthRecords.length} records</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
                  {child.growthRecords.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noGrowthYet')}</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f4f9fc' }}>
                          {['Date', `${t('age')} (months)`, `${t('weight')} (kg)`, `Height (cm)`, 'Head Circ. (cm)', t('notes')].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...child.growthRecords].reverse().map((r, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #eef4f7' }}>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a3a4a', fontWeight: '500' }}>{new Date(r.date).toLocaleDateString()}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{r.ageInMonths}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{r.weight}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{r.height}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{r.headCircumference || '—'}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#9ab0bc', fontStyle: 'italic' }}>{r.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chart Tab */}
          {activeTab === 'chart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {latestRecord && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: t('weightStatus'), detail: `${latestRecord.weight} kg at ${latestRecord.ageInMonths} months`, status: getWeightStatus() },
                    { label: t('heightStatus'), detail: `${latestRecord.height} cm at ${latestRecord.ageInMonths} months`, status: getHeightStatus() },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: s.status?.bg || '#f7fbfd', border: `1px solid ${s.status?.border || '#e8f0f5'}`, borderRadius: '14px', padding: '1.25rem 1.5rem' }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', color: '#7f9caa', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: '800', color: s.status?.color || '#1a3a4a' }}>{s.status?.status || 'N/A'}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#7f9caa' }}>{s.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>Weight-for-Age (WHO Standard)</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                    <span>— {t('normalWeight')}</span><span>--- Median</span><span style={{ color: '#f5a5a5' }}>— Child</span>
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {child.growthRecords.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noGrowthYet')}</p>
                  ) : <SVGChart data={getChildWeightData()} yKey="childWeight" yLabel="Weight (kg)" color="#c0392b" />}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>Height-for-Age (WHO Standard)</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                    <span>— {t('normalHeight')}</span><span>--- Median</span><span style={{ color: '#f5a5a5' }}>— Child</span>
                  </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {child.growthRecords.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noGrowthYet')}</p>
                  ) : <SVGChart data={getChildHeightData()} yKey="childHeight" yLabel="Height (cm)" color="#c0392b" />}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>WHO Growth Reference Table</h3>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f4f9fc' }}>
                        {[`${t('age')} (months)`, `Min ${t('weight')}`, `Median ${t('weight')}`, `Max ${t('weight')}`, `Min ${t('birthHeight')}`, `Median ${t('birthHeight')}`, `Max ${t('birthHeight')}`].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {whoWeight.map((w, i) => {
                        const h = whoHeight[i];
                        const childRecord = child.growthRecords.find(r => Number(r.ageInMonths) === w.month);
                        const weightOk = childRecord ? (Number(childRecord.weight) >= w.low && Number(childRecord.weight) <= w.high) : null;
                        const heightOk = childRecord ? (Number(childRecord.height) >= h.low && Number(childRecord.height) <= h.high) : null;
                        return (
                          <tr key={w.month} style={{ borderTop: '1px solid #eef4f7', backgroundColor: childRecord ? '#f0fafc' : 'transparent' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: childRecord ? '700' : '400', color: '#1a3a4a' }}>
                              {w.month} {childRecord && <span style={{ fontSize: '0.7rem', color: '#1a6b8a', marginLeft: '0.5rem' }}>← recorded</span>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{w.low} kg</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#1a6b8a', fontWeight: '600' }}>{w.median} kg</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>
                              {w.high} kg
                              {childRecord && <span style={{ marginLeft: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: weightOk ? '#eafaf1' : '#fdecea', color: weightOk ? '#27ae60' : '#c0392b' }}>{childRecord.weight} kg</span>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>{h.low} cm</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#27ae60', fontWeight: '600' }}>{h.median} cm</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#4a6a7a' }}>
                              {h.high} cm
                              {childRecord && childRecord.height && <span style={{ marginLeft: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700', backgroundColor: heightOk ? '#eafaf1' : '#fdecea', color: heightOk ? '#27ae60' : '#c0392b' }}>{childRecord.height} cm</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Log Visit Form — staff only */}
              {isStaff && (
                <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('logClinicVisit')}</h3>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <form onSubmit={handleAddVisit}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                          { label: 'Visit Date *',              key: 'visitDate',     type: 'date' },
                          { label: `${t('weight')} (kg)`,       key: 'weight',        type: 'number', step: '0.01', placeholder: 'e.g. 6.2' },
                          { label: `Height (cm)`,  key: 'height',        type: 'number', step: '0.1',  placeholder: 'e.g. 62' },
                          { label: 'Next Visit Date',            key: 'nextVisitDate', type: 'date' },
                          { label: t('notes'),                  key: 'notes',         type: 'text',   placeholder: 'Observations...', span: 2 },
                        ].map(f => (
                          <div key={f.key} style={{ gridColumn: f.span ? `span ${f.span}` : 'span 1' }}>
                            <label style={labelStyle}>{f.label}</label>
                            <input style={inputStyle} type={f.type} step={f.step} value={visitForm[f.key]} placeholder={f.placeholder}
                              onChange={e => setVisitForm({...visitForm, [f.key]: e.target.value})}
                              required={f.label.includes('*')} onFocus={focus} onBlur={blur} />
                          </div>
                        ))}
                      </div>
                      <button type="submit" disabled={submitting} style={{
                        padding: '0.7rem 1.5rem',
                        background: submitting ? '#9ab0bc' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                        color: 'white', border: 'none', borderRadius: '8px',
                        fontSize: '0.875rem', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer',
                      }}>
                        {submitting ? t('loading') : t('logClinicVisit')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Visits List */}
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('clinicVisits')}</h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{child.clinicVisits.length} visits</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {child.clinicVisits.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noVisitsYet')}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[...child.clinicVisits].reverse().map((visit, i) => (
                        <div key={i} style={{ border: '1px solid #eef4f7', borderRadius: '10px', padding: '1rem', backgroundColor: '#f7fbfd' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '600', color: '#1a3a4a', fontSize: '0.875rem' }}>{new Date(visit.visitDate).toLocaleDateString()}</span>
                            {visit.nextVisitDate && (
                              <span style={{ fontSize: '0.75rem', color: '#1a6b8a', backgroundColor: '#e8f6f9', padding: '0.2rem 0.75rem', borderRadius: '20px', fontWeight: '600' }}>
                                Next: {new Date(visit.nextVisitDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#4a6a7a' }}>
                            {visit.weight && <span>{t('weight')}: <strong>{visit.weight} kg</strong></span>}
                            {visit.height && <span>{t('birthHeight')}: <strong>{visit.height} cm</strong></span>}
                          </div>
                          {visit.notes && <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#9ab0bc', fontStyle: 'italic' }}>"{visit.notes}"</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}