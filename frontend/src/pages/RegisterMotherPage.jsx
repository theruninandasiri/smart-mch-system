import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// ── Moved outside to prevent remounting ──
const labelStyle = {
  display: 'block', marginBottom: '0.3rem', color: '#344a5a',
  fontWeight: '600', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em',
};

const inputStyle = {
  width: '100%', padding: '0.65rem 0.875rem', borderRadius: '8px',
  border: '2px solid #e8f0f5', fontSize: '0.875rem', boxSizing: 'border-box',
  outline: 'none', color: '#1a3a4a', backgroundColor: '#f7fbfd',
  transition: 'border-color 0.2s', fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif",
};

const focus = (e) => e.target.style.borderColor = '#1a6b8a';
const blur = (e) => e.target.style.borderColor = '#e8f0f5';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '0.1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function SectionHeader({ title, colors }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
      padding: '0.875rem 1.5rem', borderRadius: '14px 14px 0 0',
      display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0,
    }}>
      <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{title}</h3>
    </div>
  );
}
// ─────────────────────────────────────────

function RegisterMotherPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '', nic: '', dateOfBirth: '', phone: '', email: '', address: '',
    ethnicity: '', preferredLanguage: '',
    emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '',
    lmpDate: '', edd: '', conceptionType: 'natural', currentSymptoms: '',
    pregnancyNumber: 1, previousMiscarriages: 0, previousTerminations: 0,
    previousEctopic: 0, previousDeliveries: 0, deliveryTypes: '', pastComplications: '',
    chronicConditions: '', surgeries: '', currentMedications: '', allergies: '',
    familyGeneticConditions: '', familyChronicIllnesses: '',
    mentalHealthHistory: '', supportSystem: '',
    smokingStatus: 'never', alcoholIntake: 'none', recreationalDrugs: false, occupation: '',
    mohArea: '', midwifeArea: '', bloodGroup: '',
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/mothers', formData);
      toast.success('Mother registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const sections = [
    t('personalInfo'), t('pregnancyDetails'), t('obstetricHistory'),
    t('medicalHistory'), t('familyHistory'), t('mentalHealth'),
    t('lifestyle'), t('clinicInfo'),
  ];

  const sectionColors = [
    ['#1a3a4a', '#1a6b8a'], ['#1a6b8a', '#2d9cad'], ['#2d9cad', '#4db6ac'],
    ['#0d7377', '#14a085'], ['#1a6b8a', '#2d9cad'], ['#6c5ce7', '#a29bfe'],
    ['#d68910', '#f39c12'], ['#1a3a4a', '#1a6b8a'],
  ];

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
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: '8px', padding: '0.4rem 0.875rem',
            cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
          }}>{t('back')}</button>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('mohClinicPortal')}
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              {t('registerNewMotherTitle')}
            </h2>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px', padding: '0.5rem 1rem',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem',
        }}>
          {t('section')} {activeSection + 1} {t('of')} {sections.length}: {sections[activeSection]}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left — Section Nav */}
        <div style={{
          width: '220px', flexShrink: 0, backgroundColor: 'white',
          borderRight: '1px solid #eef4f7', overflowY: 'auto', padding: '1rem 0',
        }}>
          {sections.map((s, i) => (
            <div key={i} onClick={() => setActiveSection(i)} style={{
              padding: '1.3rem 1.25rem', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: activeSection === i ? '700' : '500',
              color: activeSection === i ? '#1a6b8a' : '#4a6a7a',
              backgroundColor: activeSection === i ? '#f0fafc' : 'transparent',
              borderLeft: activeSection === i ? '3px solid #1a6b8a' : '3px solid transparent',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                backgroundColor: activeSection === i ? '#1a6b8a' : '#e8f0f5',
                color: activeSection === i ? 'white' : '#7f9caa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: '700', flexShrink: 0,
              }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>

        {/* Right — Form Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          <form onSubmit={handleSubmit}>

            {activeSection === 0 && (
              <div>
                <SectionHeader title={t('personalInfo')} colors={sectionColors[0]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label={t('fullName') + ' *'}><input style={inputStyle} name="fullName" value={formData.fullName} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <Field label={t('nic') + ' *'}><input style={inputStyle} name="nic" value={formData.nic} onChange={handleChange} required placeholder="e.g. 952345678V" onFocus={focus} onBlur={blur} /></Field>
                    <Field label={t('dateOfBirth') + ' *'}><input style={inputStyle} type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required onFocus={focus} onBlur={blur} min="1900-01-01" max="2010-12-31" /></Field>
                    <Field label={t('phoneNumber')}><input style={inputStyle} name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. 0771234567" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Email"><input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Ethnicity"><input style={inputStyle} name="ethnicity" value={formData.ethnicity} onChange={handleChange} placeholder="e.g. Sinhalese, Tamil, Muslim" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Preferred Language">
                      <select style={inputStyle} name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="">Select language</option>
                        <option value="Sinhala">Sinhala</option>
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                      </select>
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Address *"><input style={inputStyle} name="address" value={formData.address} onChange={handleChange} required onFocus={focus} onBlur={blur} /></Field>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #eef4f7' }}>
                    <p style={{ margin: '0 0 1rem', fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem' }}>{t('emergencyContact')}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <Field label="Name"><input style={inputStyle} name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Relationship"><input style={inputStyle} name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Phone"><input style={inputStyle} name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 1 && (
              <div>
                <SectionHeader title={t('pregnancyDetails')} colors={sectionColors[1]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="LMP Date"><input style={inputStyle} type="date" name="lmpDate" value={formData.lmpDate} onChange={handleChange} onFocus={focus} onBlur={blur} min="2020-01-01" max="2026-12-31" /></Field>
                    <Field label={t('edd')}><input style={inputStyle} type="date" name="edd" value={formData.edd} onChange={handleChange} onFocus={focus} onBlur={blur} min="2024-01-01" max="2027-12-31" /></Field>
                    <Field label="Conception Type">
                      <select style={inputStyle} name="conceptionType" value={formData.conceptionType} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="natural">Natural</option>
                        <option value="ivf">IVF / Fertility Treatment</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Current Symptoms"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} name="currentSymptoms" value={formData.currentSymptoms} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 2 && (
              <div>
                <SectionHeader title={t('obstetricHistory')} colors={sectionColors[2]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <Field label={t('pregnancyNumber')}><input style={inputStyle} type="number" name="pregnancyNumber" value={formData.pregnancyNumber} onChange={handleChange} min="1" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Previous Miscarriages"><input style={inputStyle} type="number" name="previousMiscarriages" value={formData.previousMiscarriages} onChange={handleChange} min="0" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Previous Terminations"><input style={inputStyle} type="number" name="previousTerminations" value={formData.previousTerminations} onChange={handleChange} min="0" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Ectopic Pregnancies"><input style={inputStyle} type="number" name="previousEctopic" value={formData.previousEctopic} onChange={handleChange} min="0" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Previous Deliveries"><input style={inputStyle} type="number" name="previousDeliveries" value={formData.previousDeliveries} onChange={handleChange} min="0" onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Delivery Types">
                      <select style={inputStyle} name="deliveryTypes" value={formData.deliveryTypes} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="">Select type</option>
                        <option value="vaginal">Vaginal</option>
                        <option value="assisted">Assisted</option>
                        <option value="caesarean">Caesarean</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </Field>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <Field label="Past Complications"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} name="pastComplications" value={formData.pastComplications} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 3 && (
              <div>
                <SectionHeader title={t('medicalHistory')} colors={sectionColors[3]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label={t('bloodGroup')}>
                      <select style={inputStyle} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="">Select blood group</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </Field>
                    <Field label="Known Allergies"><input style={inputStyle} name="allergies" value={formData.allergies} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <div style={{ gridColumn: '1 / -1' }}><Field label="Chronic Conditions"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field></div>
                    <div style={{ gridColumn: '1 / -1' }}><Field label="Past Surgeries"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} name="surgeries" value={formData.surgeries} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field></div>
                    <div style={{ gridColumn: '1 / -1' }}><Field label="Current Medications"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} name="currentMedications" value={formData.currentMedications} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field></div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 4 && (
              <div>
                <SectionHeader title={t('familyHistory')} colors={sectionColors[4]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <Field label="Genetic / Inherited Conditions"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} name="familyGeneticConditions" value={formData.familyGeneticConditions} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Family Chronic Illnesses"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} name="familyChronicIllnesses" value={formData.familyChronicIllnesses} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 5 && (
              <div>
                <SectionHeader title={t('mentalHealth')} colors={sectionColors[5]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <Field label="Mental Health History"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} name="mentalHealthHistory" value={formData.mentalHealthHistory} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Support System at Home"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }} name="supportSystem" value={formData.supportSystem} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 6 && (
              <div>
                <SectionHeader title={t('lifestyle')} colors={sectionColors[6]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Smoking Status">
                      <select style={inputStyle} name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="never">Never smoked</option>
                        <option value="former">Former smoker</option>
                        <option value="current">Current smoker</option>
                      </select>
                    </Field>
                    <Field label="Alcohol Intake">
                      <select style={inputStyle} name="alcoholIntake" value={formData.alcoholIntake} onChange={handleChange} onFocus={focus} onBlur={blur}>
                        <option value="none">None</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                      </select>
                    </Field>
                    <Field label="Occupation"><input style={inputStyle} name="occupation" value={formData.occupation} onChange={handleChange} onFocus={focus} onBlur={blur} /></Field>
                    <Field label="Recreational Drug Use">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
                        <input type="checkbox" name="recreationalDrugs" checked={formData.recreationalDrugs} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#1a6b8a' }} />
                        <span style={{ fontSize: '0.875rem', color: '#4a6a7a' }}>Yes, currently using</span>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 7 && (
              <div>
                <SectionHeader title={t('clinicInfo')} colors={sectionColors[7]} />
                <div style={{ backgroundColor: 'white', borderRadius: '0 0 14px 14px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label={t('mohArea') + ' *'}><input style={inputStyle} name="mohArea" value={formData.mohArea} onChange={handleChange} required onFocus={focus} onBlur={blur} /></Field>
                    <Field label={t('midwifeArea') + ' *'}><input style={inputStyle} name="midwifeArea" value={formData.midwifeArea} onChange={handleChange} required onFocus={focus} onBlur={blur} /></Field>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => navigate('/dashboard')} style={{
                    flex: 1, padding: '0.875rem', backgroundColor: 'white',
                    color: '#1a3a4a', border: '2px solid #e8f0f5', borderRadius: '10px',
                    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
                  }}>{t('cancel')}</button>
                  <button type="submit" disabled={loading} style={{
                    flex: 2, padding: '0.875rem',
                    background: loading ? '#9ab0bc' : 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                    color: 'white', border: 'none', borderRadius: '10px',
                    fontSize: '0.95rem', fontWeight: '700',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(26,107,138,0.35)',
                  }}>{loading ? t('loading') : t('registerNewMotherTitle')}</button>
                </div>
              </div>
            )}

            {activeSection < 7 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                {activeSection > 0 && (
                  <button type="button" onClick={() => setActiveSection(activeSection - 1)} style={{
                    padding: '0.7rem 1.5rem', backgroundColor: 'white',
                    color: '#1a3a4a', border: '2px solid #e8f0f5', borderRadius: '10px',
                    fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', marginRight: '0.75rem',
                  }}>{t('previous')}</button>
                )}
                <button type="button" onClick={() => setActiveSection(activeSection + 1)} style={{
                  padding: '0.7rem 1.5rem',
                  background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26,107,138,0.3)',
                }}>{t('next')}</button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterMotherPage;