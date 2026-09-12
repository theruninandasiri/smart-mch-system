import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function RiskAssessment() {
  const { motherId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mother, setMother] = useState(null);
  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    weight: '',
    hemoglobin: '',
    fetalHeartRates: [{ fetusNumber: 1, heartRate: '' }],
    epdsScore: '',
    notes: '',
  });
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (motherId) {
      api.get(`/mothers/${motherId}`)
        .then(res => setMother(res.data))
        .catch(() => {});
    }
  }, [motherId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new fetus heart rate entry
  const addFetus = () => {
    setFormData({
      ...formData,
      fetalHeartRates: [
        ...formData.fetalHeartRates,
        { fetusNumber: formData.fetalHeartRates.length + 1, heartRate: '' }
      ]
    });
  };

  // Remove a fetus entry
  const removeFetus = (index) => {
    if (formData.fetalHeartRates.length === 1) return;
    const updated = formData.fetalHeartRates
      .filter((_, i) => i !== index)
      .map((f, i) => ({ ...f, fetusNumber: i + 1 }));
    setFormData({ ...formData, fetalHeartRates: updated });
  };

  // Update a specific fetus heart rate
  const updateFetalHeartRate = (index, value) => {
    const updated = formData.fetalHeartRates.map((f, i) =>
      i === index ? { ...f, heartRate: value } : f
    );
    setFormData({ ...formData, fetalHeartRates: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter out empty heart rates before submitting
      const payload = {
        ...formData,
        motherId,
        fetalHeartRates: formData.fetalHeartRates.filter(f => f.heartRate !== ''),
      };
      const res = await api.post('/risk', payload);
      setAlerts(res.data.alerts);
      toast.success('Risk assessment completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assessment failed');
    } finally {
      setLoading(false);
    }
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

  const riskColor = alerts?.riskLevel === 'high'
    ? { bg: '#fdecea', color: '#c0392b', border: '#f5c6c2' }
    : alerts?.riskLevel === 'medium'
    ? { bg: '#fef9e7', color: '#d68910', border: '#f5e6b2' }
    : { bg: '#eafaf1', color: '#27ae60', border: '#a8e6c2' };

  // Check if any fetal heart rate is abnormal
  const getHeartRateStatus = (rate) => {
    if (!rate) return null;
    const r = Number(rate);
    if (r < 110) return { label: 'Bradycardia', color: '#c0392b', bg: '#fdecea' };
    if (r > 160) return { label: 'Tachycardia', color: '#d68910', bg: '#fef9e7' };
    return { label: 'Normal', color: '#27ae60', bg: '#eafaf1' };
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
              {t('automatedRiskEngine')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {t('riskAssessment')}
            </h2>
          </div>
        </div>
        {mother && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '10px', padding: '0.5rem 1rem',
            color: 'white', fontSize: '0.82rem',
          }}>
            <span style={{ opacity: 0.65, fontSize: '0.72rem' }}>Patient: </span>
            <strong>{mother.nic}</strong>
            <span style={{ marginLeft: '0.75rem', opacity: 0.65, fontSize: '0.72rem' }}>{t('mohArea')}: </span>
            <strong>{mother.mohArea}</strong>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>

            {/* Vitals Section */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden', marginBottom: '1.25rem',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                padding: '0.875rem 1.5rem',
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                  {t('clinicalVitals')}
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

                  {/* Blood Pressure */}
                  <div style={{ backgroundColor: '#f7fbfd', borderRadius: '12px', padding: '1rem', border: '1px solid #e8f0f5' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                      {t('bloodPressure')}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Systolic (mmHg) *</label>
                        <input style={inputStyle} type="number" name="bloodPressureSystolic"
                          value={formData.bloodPressureSystolic} onChange={handleChange}
                          required placeholder="e.g. 120" onFocus={focus} onBlur={blur} />
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>High: ≥140 | Medium: ≥130</p>
                      </div>
                      <div>
                        <label style={labelStyle}>Diastolic (mmHg) *</label>
                        <input style={inputStyle} type="number" name="bloodPressureDiastolic"
                          value={formData.bloodPressureDiastolic} onChange={handleChange}
                          required placeholder="e.g. 80" onFocus={focus} onBlur={blur} />
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>High: ≥90 | Medium: ≥80</p>
                      </div>
                    </div>
                  </div>

                  {/* Hemoglobin */}
                  <div style={{ backgroundColor: '#f7fbfd', borderRadius: '12px', padding: '1rem', border: '1px solid #e8f0f5' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                      {t('hemoglobin')}
                    </p>
                    <label style={labelStyle}>{t('hemoglobin')} (g/dL) *</label>
                    <input style={inputStyle} type="number" step="0.1" name="hemoglobin"
                      value={formData.hemoglobin} onChange={handleChange}
                      required placeholder="e.g. 11.5" onFocus={focus} onBlur={blur} />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Severe anemia: &lt;7 | Anemia: &lt;11</p>
                  </div>

                  {/* Weight */}
                  <div style={{ backgroundColor: '#f7fbfd', borderRadius: '12px', padding: '1rem', border: '1px solid #e8f0f5' }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                      {t('weight')}
                    </p>
                    <label style={labelStyle}>{t('weight')} (kg) *</label>
                    <input style={inputStyle} type="number" step="0.1" name="weight"
                      value={formData.weight} onChange={handleChange}
                      required placeholder="e.g. 58.5" onFocus={focus} onBlur={blur} />
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Recorded at time of visit</p>
                  </div>

                  {/* Fetal Heart Rates — Multiple Fetuses */}
                  <div style={{
                    backgroundColor: '#f7fbfd', borderRadius: '12px', padding: '1rem',
                    border: '1px solid #e8f0f5', gridColumn: 'span 2',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                        {t('fetalHeartRate')}
                      </p>
                      <button
                        type="button"
                        onClick={addFetus}
                        style={{
                          padding: '0.3rem 0.875rem',
                          background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                          color: 'white', border: 'none', borderRadius: '6px',
                          fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        + Add Fetus
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {formData.fetalHeartRates.map((fetus, index) => {
                        const status = getHeartRateStatus(fetus.heartRate);
                        return (
                          <div key={index} style={{
                            backgroundColor: 'white', borderRadius: '10px',
                            padding: '0.875rem', border: '1px solid #e8f0f5',
                            position: 'relative',
                          }}>
                            {/* Remove button — only show if more than 1 fetus */}
                            {formData.fetalHeartRates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFetus(index)}
                                style={{
                                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                                  background: '#fdecea', border: 'none', borderRadius: '50%',
                                  width: '20px', height: '20px', cursor: 'pointer',
                                  color: '#c0392b', fontSize: '0.75rem', fontWeight: '700',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </button>
                            )}

                            <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>
                              Fetus {fetus.fetusNumber} (bpm)
                            </label>
                            <input
                              style={inputStyle}
                              type="number"
                              value={fetus.heartRate}
                              onChange={(e) => updateFetalHeartRate(index, e.target.value)}
                              placeholder="e.g. 140"
                              onFocus={focus}
                              onBlur={blur}
                            />

                            {/* Status badge */}
                            {fetus.heartRate && status && (
                              <span style={{
                                display: 'inline-block', marginTop: '0.4rem',
                                padding: '0.15rem 0.6rem', borderRadius: '20px',
                                fontSize: '0.7rem', fontWeight: '600',
                                backgroundColor: status.bg, color: status.color,
                              }}>
                                {status.label}
                              </span>
                            )}

                            {!fetus.heartRate && (
                              <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>
                                Normal: 110–160 bpm
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* EPDS */}
                  <div style={{
                    backgroundColor: '#f7fbfd', borderRadius: '12px', padding: '1rem',
                    border: '1px solid #e8f0f5',
                  }}>
                    <p style={{ margin: '0 0 0.75rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                      Edinburgh Postnatal Depression Scale (EPDS)
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                      <div>
                        <label style={labelStyle}>EPDS Score (0–30)</label>
                        <input style={inputStyle} type="number" name="epdsScore"
                          value={formData.epdsScore} onChange={handleChange}
                          placeholder="e.g. 8" min="0" max="30" onFocus={focus} onBlur={blur} />
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Depression risk: ≥13</p>
                      </div>
                      <div style={{
                        backgroundColor: '#eef4f7', borderRadius: '8px', padding: '0.75rem',
                        fontSize: '0.75rem', color: '#4a6a7a', lineHeight: 1.6,
                      }}>
                        <strong>EPDS Guide:</strong><br />
                        0–9: Low risk — routine monitoring<br />
                        10–12: Borderline — follow up recommended<br />
                        13+: Possible depression — refer for support
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden', marginBottom: '1.25rem',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #2d9cad, #4db6ac)',
                padding: '0.875rem 1.5rem',
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                  {t('clinicalNotes')}
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <textarea name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Enter any additional clinical observations, concerns, or notes..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                  onFocus={focus} onBlur={blur} />
              </div>
            </div>

            {/* Alerts Result */}
            {alerts && (
              <div style={{
                backgroundColor: 'white', borderRadius: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden', marginBottom: '1.25rem',
              }}>
                <div style={{
                  background: alerts.riskLevel === 'high'
                    ? 'linear-gradient(135deg, #c0392b, #e74c3c)'
                    : alerts.riskLevel === 'medium'
                    ? 'linear-gradient(135deg, #d68910, #f39c12)'
                    : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  padding: '0.875rem 1.5rem',
                }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                    {t('assessmentResult')} — {t(alerts.riskLevel)?.toUpperCase()} {t('riskLevel')}
                  </h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                    {[
                      { labelKey: 'hypertension',  flag: alerts.hypertension },
                      { labelKey: 'anemia',         flag: alerts.anemia },
                      { labelKey: 'depressionRisk', flag: alerts.depression },
                    ].map(a => (
                      <div key={a.labelKey} style={{
                        padding: '1rem', borderRadius: '10px', textAlign: 'center',
                        backgroundColor: a.flag ? '#fdecea' : '#eafaf1',
                        border: `1px solid ${a.flag ? '#f5c6c2' : '#a8e6c2'}`,
                      }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.875rem', color: a.flag ? '#c0392b' : '#27ae60' }}>
                          {t(a.labelKey)}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: a.flag ? '#c0392b' : '#27ae60' }}>
                          {a.flag ? t('detected') : t('normalStatus')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Fetal Heart Rate Summary in Results */}
                  {alerts.fetalHeartRates && alerts.fetalHeartRates.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                        Fetal Heart Rate Summary
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                        {alerts.fetalHeartRates.map((f) => {
                          const status = getHeartRateStatus(f.heartRate);
                          return (
                            <div key={f.fetusNumber} style={{
                              padding: '0.75rem', borderRadius: '10px', textAlign: 'center',
                              backgroundColor: status?.bg || '#f7fbfd',
                              border: `1px solid ${status?.color || '#e8f0f5'}22`,
                            }}>
                              <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ab0bc', fontWeight: '500' }}>
                                Fetus {f.fetusNumber}
                              </p>
                              <p style={{ margin: '0.2rem 0', fontSize: '1.1rem', fontWeight: '700', color: status?.color || '#1a3a4a' }}>
                                {f.heartRate} bpm
                              </p>
                              <span style={{
                                padding: '0.15rem 0.6rem', borderRadius: '20px',
                                fontSize: '0.7rem', fontWeight: '600',
                                backgroundColor: status?.color + '22', color: status?.color,
                              }}>
                                {status?.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{
                    padding: '1rem 1.25rem', borderRadius: '10px', textAlign: 'center',
                    backgroundColor: riskColor.bg, border: `2px solid ${riskColor.border}`,
                  }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: riskColor.color }}>
                      {t('overallRiskLevel')}: {t(alerts.riskLevel)?.toUpperCase()}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: riskColor.color, opacity: 0.8 }}>
                      {alerts.riskLevel === 'high'
                        ? t('immediateAttention')
                        : alerts.riskLevel === 'medium'
                        ? t('closeMonitoring')
                        : t('routineMonitoring')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button type="button" onClick={() => navigate(`/mother-history/${motherId}`)} style={{
                      flex: 1, padding: '0.7rem',
                      background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                      color: 'white', border: 'none', borderRadius: '8px',
                      fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                    }}>
                      {t('viewFullHistory')}
                    </button>
                    <button type="button" onClick={() => navigate('/dashboard')} style={{
                      flex: 1, padding: '0.7rem',
                      backgroundColor: 'white', color: '#1a3a4a',
                      border: '2px solid #e8f0f5', borderRadius: '8px',
                      fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                    }}>
                      {t('backToDashboard')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!alerts && (
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '1rem',
                background: loading ? '#9ab0bc' : 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(26,107,138,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                {loading ? (
                  <>
                    <div style={{
                      width: '18px', height: '18px', border: '2px solid white',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    {t('analyzing')}
                  </>
                ) : t('runAssessment')}
              </button>
            )}

          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}