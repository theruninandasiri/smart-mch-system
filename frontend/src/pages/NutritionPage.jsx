import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function NutritionPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const motherId = searchParams.get('motherId');
  const navigate = useNavigate();

  const isStaff = user?.role === 'moh_officer' || user?.role === 'midwife';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    motherId: motherId || '',
    month: currentMonth,
    year: currentYear,
    isEligible: true,
    thriposhaSent: false,
    thriposhaSentDate: '',
    thriposhaQuantity: '',
    notes: '',
  });

  useEffect(() => {
    if (motherId) fetchRecords();
    else setLoading(false);
  }, [motherId]);

  const fetchRecords = async () => {
    try {
      const { data } = await api.get(`/nutrition/mother/${motherId}`);
      setRecords(data);
    } catch (err) {
      toast.error('Failed to load nutrition records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.motherId) { toast.error('Mother ID is required'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/nutrition', form);
      setRecords([data, ...records]);
      toast.success('Nutrition record saved');
      setForm(prev => ({ ...prev, thriposhaSent: false, thriposhaSentDate: '', thriposhaQuantity: '', notes: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    }
    setSubmitting(false);
  };

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
              {t('nutritionManagement')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {t('thriposhTracker')}
            </h2>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px', padding: '0.5rem 1rem',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem',
        }}>
          {months[currentMonth - 1]} {currentYear}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Add Record Form — only for MOH officers and midwives */}
          {isStaff && (
            <div style={{
              backgroundColor: 'white', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden', marginBottom: '1.25rem',
            }}>
              <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                  {t('addRecord')}
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Mother ID *</label>
                    <input
                      style={{ ...inputStyle, backgroundColor: motherId ? '#f0f4f7' : '#f7fbfd', color: motherId ? '#7f9caa' : '#1a3a4a' }}
                      type="text" value={form.motherId}
                      onChange={e => setForm({...form, motherId: e.target.value})}
                      placeholder="Mother's system ID"
                      readOnly={!!motherId} required
                    />
                    {motherId && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: '#27ae60' }}>
                        {t('motherIdLinked')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={labelStyle}>{t('month')} *</label>
                      <select style={inputStyle} value={form.month}
                        onChange={e => setForm({...form, month: Number(e.target.value)})}
                        onFocus={focus} onBlur={blur}>
                        {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>{t('year')} *</label>
                      <input style={inputStyle} type="number" value={form.year}
                        onChange={e => setForm({...form, year: Number(e.target.value)})}
                        min="2020" max="2035" onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('quantity')} (kg)</label>
                      <input style={inputStyle} type="number" step="0.1"
                        value={form.thriposhaQuantity}
                        onChange={e => setForm({...form, thriposhaQuantity: e.target.value})}
                        placeholder="e.g. 1.5" onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={labelStyle}>{t('dateSent')}</label>
                      <input style={inputStyle} type="date"
                        value={form.thriposhaSentDate}
                        onChange={e => setForm({...form, thriposhaSentDate: e.target.value})}
                        onFocus={focus} onBlur={blur} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>{t('notes')}</label>
                      <input style={inputStyle} type="text" value={form.notes}
                        onChange={e => setForm({...form, notes: e.target.value})}
                        placeholder="Optional notes" onFocus={focus} onBlur={blur} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.25rem', justifyContent: 'center' }}>
                    {[
                      { label: t('eligibleForThriposha'), key: 'isEligible',    checked: form.isEligible },
                      { label: t('thriposhaSent'),         key: 'thriposhaSent', checked: form.thriposhaSent },
                    ].map(c => (
                      <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#344a5a', fontWeight: '500' }}>
                        <input type="checkbox" checked={c.checked}
                          onChange={e => setForm({...form, [c.key]: e.target.checked})}
                          style={{ width: '16px', height: '16px', accentColor: '#1a6b8a' }} />
                        {c.label}
                      </label>
                    ))}
                  </div>

                  <button type="submit" disabled={submitting} style={{
                    padding: '0.7rem 1.5rem',
                    background: submitting ? '#9ab0bc' : 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '0.875rem', fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: submitting ? 'none' : '0 4px 12px rgba(26,107,138,0.3)',
                  }}>
                    {submitting ? t('loading') : t('addRecord')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Records Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
              padding: '0.875rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('distributionHistory')}
              </h3>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{records.length} records</span>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('loading')}</p>
              ) : records.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noNutritionYet')}</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f4f9fc' }}>
                      {[t('month')+' / '+t('year'), t('eligible'), t('status'), t('quantity'), t('dateSent'), t('notes')].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#7f9caa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r._id} style={{ borderTop: '1px solid #eef4f7' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fbfd'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1a3a4a' }}>{months[r.month - 1]} {r.year}</td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                            backgroundColor: r.isEligible ? '#eafaf1' : '#fdecea',
                            color: r.isEligible ? '#27ae60' : '#c0392b',
                            border: `1px solid ${r.isEligible ? '#a8e6c2' : '#f5c6c2'}`,
                          }}>
                            {r.isEligible ? t('eligible') : t('notEligible')}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                            backgroundColor: r.thriposhaSent ? '#e8f6f9' : '#f0f4f7',
                            color: r.thriposhaSent ? '#1a6b8a' : '#7f9caa',
                            border: `1px solid ${r.thriposhaSent ? '#b2d8e0' : '#d0dde5'}`,
                          }}>
                            {r.thriposhaSent ? t('sent') : t('pending')}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{r.thriposhaQuantity ? `${r.thriposhaQuantity} kg` : '—'}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#4a6a7a' }}>{r.thriposhaSentDate ? new Date(r.thriposhaSentDate).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '0.875rem 1rem', color: '#9ab0bc', fontStyle: 'italic' }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}