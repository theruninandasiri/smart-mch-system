import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function VaccinationTracker() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const childId = searchParams.get('childId');
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (childId) fetchRecord();
    else setLoading(false);
  }, [childId]);

  const fetchRecord = async () => {
    try {
      const { data } = await api.get(`/vaccination/${childId}`);
      setRecord(data);
    } catch (err) {
      if (err.response?.status === 404) setRecord(null);
      else toast.error('Failed to load vaccination record');
    } finally {
      setLoading(false);
    }
  };

  const handleInit = async () => {
    if (!childId) { toast.error('Child ID is required'); return; }
    setInitializing(true);
    try {
      const { data } = await api.post(`/vaccination/init/${childId}`);
      setRecord(data);
      toast.success('Vaccination schedule initialized!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize schedule');
    }
    setInitializing(false);
  };

  const handleUpdateStatus = async (vaccineId, status) => {
    setUpdatingId(vaccineId);
    try {
      const givenDate = status === 'given' ? new Date().toISOString() : undefined;
      const { data } = await api.put(`/vaccination/${childId}/vaccine/${vaccineId}`, { status, givenDate });
      setRecord(data);
      toast.success(`Vaccine marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update vaccine status');
    }
    setUpdatingId(null);
  };

  const isOverdue = (scheduledDate, status) => {
    return status === 'scheduled' && new Date(scheduledDate) < new Date();
  };

  const statusConfig = {
    given:     { bg: '#eafaf1', color: '#27ae60', border: '#a8e6c2', label: t('given') },
    scheduled: { bg: '#e8f6f9', color: '#1a6b8a', border: '#b2d8e0', label: t('scheduled') },
    missed:    { bg: '#fdecea', color: '#c0392b', border: '#f5c6c2', label: t('missed') },
    deferred:  { bg: '#fef9e7', color: '#d68910', border: '#f5e6b2', label: t('deferred') },
  };

  if (!childId) return (
    <div style={{
      height: '100vh', backgroundColor: '#f4f9fc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '14px',
        padding: '3rem', textAlign: 'center', maxWidth: '400px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <p style={{ fontSize: '0.875rem', color: '#7f9caa', marginBottom: '1.5rem' }}>
          No child selected. Go to a child profile to open the vaccination tracker.
        </p>
        <button onClick={() => navigate(-1)} style={{
          background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
          color: 'white', border: 'none', borderRadius: '8px',
          padding: '0.7rem 1.5rem', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: '600',
        }}>
          {t('back')}
        </button>
      </div>
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
              {t('immunization')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {t('vaccinationTracker')} · Age 0–5
            </h2>
          </div>
        </div>

        {record && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {[
              { labelKey: 'given',     value: record.vaccines.filter(v => v.status === 'given').length,     color: '#27ae60' },
              { labelKey: 'scheduled', value: record.vaccines.filter(v => v.status === 'scheduled').length, color: '#b2d8e0' },
              { labelKey: 'missed',    value: record.vaccines.filter(v => v.status === 'missed').length,    color: '#f5c6c2' },
            ].map(s => (
              <div key={s.labelKey} style={{
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px', padding: '0.4rem 0.875rem', textAlign: 'center',
              }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)' }}>{t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ab0bc' }}>{t('loading')}</div>
          ) : !record ? (

            <div style={{
              backgroundColor: 'white', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              padding: '3rem', textAlign: 'center',
            }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                backgroundColor: '#e8f6f9', margin: '0 auto 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
              }}>+</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#1a3a4a', fontSize: '1.1rem', fontWeight: '700' }}>
                {t('noScheduleFound')}
              </h3>
              <p style={{ margin: '0 0 2rem', color: '#7f9caa', fontSize: '0.875rem', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                {t('initializeDesc')}
              </p>
              <button onClick={handleInit} disabled={initializing} style={{
                padding: '0.875rem 2rem',
                background: initializing ? '#9ab0bc' : 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '0.95rem', fontWeight: '700',
                cursor: initializing ? 'not-allowed' : 'pointer',
                boxShadow: initializing ? 'none' : '0 4px 15px rgba(26,107,138,0.35)',
              }}>
                {initializing ? t('loading') : t('initializeSchedule')}
              </button>
            </div>

          ) : (

            <div>
              <div style={{
                backgroundColor: 'white', borderRadius: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                    {t('immunizationProgress')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f9caa' }}>
                    {record.vaccines.filter(v => v.status === 'given').length} of {record.vaccines.length} vaccines given
                  </p>
                </div>
                <div style={{ backgroundColor: '#eef4f7', borderRadius: '20px', height: '10px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '20px',
                    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                    width: `${(record.vaccines.filter(v => v.status === 'given').length / record.vaccines.length) * 100}%`,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                  padding: '0.875rem 1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                    {t('nipSchedule')}
                  </h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                    {record.vaccines.length} vaccines total
                  </span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {record.vaccines.map((vaccine) => {
                      const overdue = isOverdue(vaccine.scheduledDate, vaccine.status);
                      const sc = statusConfig[vaccine.status] || statusConfig.scheduled;
                      return (
                        <div key={vaccine._id} style={{
                          border: `1px solid ${overdue ? '#f5c6c2' : '#eef4f7'}`,
                          borderRadius: '10px', padding: '1rem 1.25rem',
                          backgroundColor: overdue ? '#fdecea' : '#f7fbfd',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                              <span style={{ fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>
                                {vaccine.vaccineName}
                              </span>
                              {overdue && (
                                <span style={{ fontSize: '0.7rem', backgroundColor: '#c0392b', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '20px', fontWeight: '600' }}>
                                  {t('overdue')}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: '#7f9caa' }}>
                              <span>{t('scheduled')}: {new Date(vaccine.scheduledDate).toLocaleDateString()}</span>
                              {vaccine.givenDate && (
                                <span style={{ color: '#27ae60', fontWeight: '600' }}>
                                  {t('given')}: {new Date(vaccine.givenDate).toLocaleDateString()}
                                </span>
                              )}
                              {vaccine.batchNumber && <span>Batch: {vaccine.batchNumber}</span>}
                            </div>
                            {vaccine.notes && (
                              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#9ab0bc', fontStyle: 'italic' }}>
                                "{vaccine.notes}"
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem', flexShrink: 0 }}>
                            <span style={{
                              padding: '0.25rem 0.875rem', borderRadius: '20px',
                              fontSize: '0.75rem', fontWeight: '600',
                              backgroundColor: sc.bg, color: sc.color,
                              border: `1px solid ${sc.border}`,
                            }}>
                              {sc.label}
                            </span>
                            {vaccine.status !== 'given' && (
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button onClick={() => handleUpdateStatus(vaccine._id, 'given')} disabled={updatingId === vaccine._id} style={{
                                  fontSize: '0.75rem', padding: '0.35rem 0.75rem',
                                  backgroundColor: '#eafaf1', color: '#27ae60',
                                  border: '1px solid #a8e6c2', borderRadius: '6px',
                                  cursor: 'pointer', fontWeight: '600',
                                  opacity: updatingId === vaccine._id ? 0.5 : 1,
                                }}>{t('given')}</button>
                                <button onClick={() => handleUpdateStatus(vaccine._id, 'missed')} disabled={updatingId === vaccine._id} style={{
                                  fontSize: '0.75rem', padding: '0.35rem 0.75rem',
                                  backgroundColor: '#fdecea', color: '#c0392b',
                                  border: '1px solid #f5c6c2', borderRadius: '6px',
                                  cursor: 'pointer', fontWeight: '600',
                                  opacity: updatingId === vaccine._id ? 0.5 : 1,
                                }}>{t('missed')}</button>
                                <button onClick={() => handleUpdateStatus(vaccine._id, 'deferred')} disabled={updatingId === vaccine._id} style={{
                                  fontSize: '0.75rem', padding: '0.35rem 0.75rem',
                                  backgroundColor: '#fef9e7', color: '#d68910',
                                  border: '1px solid #f5e6b2', borderRadius: '6px',
                                  cursor: 'pointer', fontWeight: '600',
                                  opacity: updatingId === vaccine._id ? 0.5 : 1,
                                }}>{t('deferred')}</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}