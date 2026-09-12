import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function ChildCard({ child, navigate, t, showBadge }) {
  return (
    <div style={{
      border: '1px solid #eef4f7', borderRadius: '10px',
      padding: '1rem', backgroundColor: '#f7fbfd',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#1a3a4a', fontSize: '0.875rem' }}>
            {child.name || child.tempLabel || (child.gender === 'male' ? t('male') : t('female'))}
          </p>
          {showBadge && (
            <span style={{
              fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.5rem',
              borderRadius: '10px', backgroundColor: '#e0f2f1', color: '#00897b',
              border: '1px solid #b2dfdb', textTransform: 'uppercase',
            }}>
              {child.tempLabel || `Baby ${child.birthOrder}`}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: '#7f9caa', textTransform: 'capitalize' }}>
            · {t(child.gender)}
          </span>
        </div>
        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#7f9caa' }}>
          DOB: {new Date(child.dateOfBirth).toLocaleDateString()} · {t('birthWeight')}: {child.birthWeight} kg
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => navigate(`/child/${child._id}`)} style={{
          fontSize: '0.78rem', padding: '0.35rem 0.875rem',
          backgroundColor: '#e8f6f9', color: '#1a6b8a',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
        }}>
          {t('view')}
        </button>
        <button onClick={() => navigate(`/vaccination?childId=${child._id}`)} style={{
          fontSize: '0.78rem', padding: '0.35rem 0.875rem',
          backgroundColor: '#eafaf1', color: '#27ae60',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
        }}>
          {t('vaccination')}
        </button>
      </div>
    </div>
  );
}

function ChildrenSection({ motherId }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [children, setChildren] = useState([]);

  useEffect(() => {
    api.get(`/children/mother/${motherId}`)
      .then(res => setChildren(res.data))
      .catch(() => {});
  }, [motherId]);

  // Group children by multipleBirthGroupId; singles fall into their own bucket
  const groups = [];
  const seenGroupIds = new Set();

  children.forEach(child => {
    if (child.multipleBirthGroupId) {
      if (!seenGroupIds.has(child.multipleBirthGroupId)) {
        seenGroupIds.add(child.multipleBirthGroupId);
        const siblings = children
          .filter(c => c.multipleBirthGroupId === child.multipleBirthGroupId)
          .sort((a, b) => a.birthOrder - b.birthOrder);
        groups.push({ type: 'multiple', multipleBirthType: child.multipleBirthType, children: siblings });
      }
    } else {
      groups.push({ type: 'single', children: [child] });
    }
  });

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden', marginTop: '1.25rem',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
        padding: '0.875rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
          {t('childrenRecords')}
        </h3>
        <Link to={`/register-child?motherId=${motherId}`} style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white', borderRadius: '8px',
          padding: '0.35rem 0.875rem',
          fontSize: '0.78rem', fontWeight: '600',
          textDecoration: 'none',
        }}>
          {t('registerChild')}
        </Link>
      </div>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {children.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '1.5rem 0', margin: 0, fontSize: '0.875rem' }}>
            {t('noChildrenYet')}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groups.map((group, i) => (
              group.type === 'single' ? (
                <ChildCard key={group.children[0]._id} child={group.children[0]} navigate={navigate} t={t} showBadge={false} />
              ) : (
                <div key={`group-${i}`} style={{
                  border: '2px dashed #b2dfdb', borderRadius: '12px', padding: '0.875rem',
                  backgroundColor: '#fafffe',
                }}>
                  <p style={{
                    margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: '700',
                    color: '#00897b', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {t(group.multipleBirthType) || group.multipleBirthType} · {group.children.length} {t('childrenRecords')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {group.children.map(child => (
                      <ChildCard key={child._id} child={child} navigate={navigate} t={t} showBadge={true} />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MotherHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mother, setMother] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMotherData(); }, [id]);

  const fetchMotherData = async () => {
    try {
      const [motherRes, assessmentsRes] = await Promise.all([
        api.get(`/mothers/${id}`),
        api.get(`/risk/${id}`),
      ]);
      setMother(motherRes.data);
      setAssessments(assessmentsRes.data);
    } catch (err) {
      toast.error('Failed to load mother data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7f9caa', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif" }}>
      {t('loading')}
    </div>
  );

  if (!mother) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7f9caa', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif" }}>
      Mother not found
    </div>
  );

  const riskStyles = {
    high:   { bg: '#c0392b', light: '#fdecea', border: '#f5c6c2' },
    medium: { bg: '#d68910', light: '#fef9e7', border: '#f5e6b2' },
    low:    { bg: '#27ae60', light: '#eafaf1', border: '#a8e6c2' },
  };
  const rs = riskStyles[mother.riskLevel] || riskStyles.low;

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
          }}>
            {t('back')}
          </button>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('motherHealthRecord')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {mother.fullName || mother.nic}
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            padding: '0.4rem 1rem', borderRadius: '20px',
            backgroundColor: rs.bg, color: 'white',
            fontSize: '0.78rem', fontWeight: '700',
          }}>
            {t(mother.riskLevel)?.toUpperCase()} {t('riskLevel')}
          </span>
          <span style={{
            padding: '0.4rem 1rem', borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
            fontSize: '0.78rem', fontWeight: '600', textTransform: 'capitalize',
          }}>
            {t(mother.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          {/* Patient Info */}
          <div style={{
            backgroundColor: 'white', borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden', marginBottom: '1.25rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
              padding: '0.875rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('patientInfo')}
              </h3>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {mother.barcodeId}
              </span>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: t('nic'),            value: mother.nic },
                  { label: t('fullName'),        value: mother.fullName || 'N/A' },
                  { label: t('dateOfBirth'),     value: mother.dateOfBirth ? new Date(mother.dateOfBirth).toLocaleDateString() : 'N/A' },
                  { label: t('bloodGroup'),      value: mother.bloodGroup || 'N/A' },
                  { label: t('phoneNumber'),     value: mother.phone || 'N/A' },
                  { label: t('mohArea'),         value: mother.mohArea },
                  { label: t('midwifeArea'),     value: mother.midwifeArea },
                  { label: 'LMP',                value: mother.lmpDate ? new Date(mother.lmpDate).toLocaleDateString() : 'N/A' },
                  { label: t('edd'),             value: mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A' },
                  { label: t('pregnancyNumber'), value: mother.pregnancyNumber },
                  { label: 'Occupation',         value: mother.occupation || 'N/A' },
                  { label: 'Language',           value: mother.preferredLanguage || 'N/A' },
                ].map(d => (
                  <div key={d.label} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f4f7' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {d.label}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>

              {mother.address && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f7fbfd', borderRadius: '8px', border: '1px solid #e8f0f5' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Address</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#1a3a4a' }}>{mother.address}</p>
                </div>
              )}

              {mother.emergencyContactName && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f7fbfd', borderRadius: '8px', border: '1px solid #e8f0f5' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('emergencyContact')}</p>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '500', color: '#1a3a4a' }}>
                    {mother.emergencyContactName} · {mother.emergencyContactRelationship} · {mother.emergencyContactPhone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: t('riskAssessment'), to: `/risk-assessment/${mother._id}`, color: '#c0392b', bg: '#fdecea', border: '#f5c6c2' },
              { label: t('registerChild'),  to: `/register-child?motherId=${mother._id}`, color: '#27ae60', bg: '#eafaf1', border: '#a8e6c2' },
              { label: t('nutrition'),      to: `/nutrition?motherId=${mother._id}`, color: '#1a6b8a', bg: '#e8f6f9', border: '#b2d8e0' },
              { label: t('printReport'),    print: true, color: '#4a6a7a', bg: '#f0f4f7', border: '#d0dde5' },
            ].map(action => (
              action.print ? (
                <button key={action.label} onClick={() => window.print()} style={{
                  padding: '0.875rem', borderRadius: '10px',
                  backgroundColor: action.bg, color: action.color,
                  border: `1px solid ${action.border}`,
                  fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  {action.label}
                </button>
              ) : (
                <Link key={action.label} to={action.to} style={{
                  padding: '0.875rem', borderRadius: '10px',
                  backgroundColor: action.bg, color: action.color,
                  border: `1px solid ${action.border}`,
                  fontWeight: '700', fontSize: '0.875rem',
                  textDecoration: 'none', textAlign: 'center', display: 'block',
                }}>
                  {action.label}
                </Link>
              )
            ))}
          </div>

          {/* Risk Assessment History */}
          <div style={{
            backgroundColor: 'white', borderRadius: '14px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden', marginBottom: '1.25rem',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a3a4a, #c0392b)',
              padding: '0.875rem 1.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                {t('riskAssessmentHistory')}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                {assessments.length} {assessments.length !== 1 ? 'records' : 'record'}
              </span>
            </div>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {assessments.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>
                  {t('noAssessmentsYet')}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {assessments.map((assessment) => {
                    const ars = riskStyles[assessment.riskLevel] || riskStyles.low;
                    return (
                      <div key={assessment._id} style={{
                        border: `1px solid ${ars.border}`, borderRadius: '10px',
                        padding: '1.25rem', backgroundColor: ars.light,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#7f9caa' }}>
                            {t('visitHistory')}: {new Date(assessment.visitDate).toLocaleDateString()}
                          </p>
                          <span style={{
                            padding: '0.25rem 0.875rem', borderRadius: '20px',
                            backgroundColor: ars.bg, color: 'white',
                            fontSize: '0.75rem', fontWeight: '700',
                          }}>
                            {t(assessment.riskLevel)?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          {[
                            { label: t('bloodPressure'), value: `${assessment.bloodPressureSystolic}/${assessment.bloodPressureDiastolic} mmHg` },
                            { label: t('weight'),        value: `${assessment.weight} kg` },
                            { label: t('hemoglobin'),    value: `${assessment.hemoglobin} g/dL` },
                            { label: t('epdsScore'),     value: assessment.epdsScore ?? 'N/A' },
                          ].map(d => (
                            <div key={d.label} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '0.5rem 0.75rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                              <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ab0bc', fontWeight: '500' }}>{d.label}</p>
                              <p style={{ margin: '0.15rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                            </div>
                          ))}
                        </div>
                        {(assessment.isHypertension || assessment.isAnemia || assessment.isDepression) && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {assessment.isHypertension && (
                              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fdecea', color: '#c0392b', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #f5c6c2' }}>
                                {t('hypertension')}
                              </span>
                            )}
                            {assessment.isAnemia && (
                              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef3e2', color: '#d68910', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #f5d5a0' }}>
                                {t('anemia')}
                              </span>
                            )}
                            {assessment.isDepression && (
                              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#fef9e7', color: '#d68910', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid #f5e6b2' }}>
                                {t('depressionRisk')}
                              </span>
                            )}
                          </div>
                        )}
                        {assessment.notes && (
                          <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: '#7f9caa', fontStyle: 'italic' }}>
                            "{assessment.notes}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Children */}
          <ChildrenSection motherId={mother._id} />

        </div>
      </div>
    </div>
  );
}