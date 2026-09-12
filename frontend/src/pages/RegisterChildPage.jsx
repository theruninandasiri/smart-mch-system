import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const BIRTH_TYPES = [
  { value: 'single',   label: 'Single',   count: 1 },
  { value: 'twin',     label: 'Twins',    count: 2 },
  { value: 'triplet',  label: 'Triplets', count: 3 },
  { value: 'multiple', label: 'Multiple', count: 4 },
];

const emptyBaby = (index) => ({
  name: '',
  gender: '',
  birthWeight: '',
  birthHeight: '',
  bloodGroup: '',
  tempLabel: `Baby ${String.fromCharCode(65 + index)}`,
});

export default function RegisterChildPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const motherId = searchParams.get('motherId');

  const [multipleBirthType, setMultipleBirthType] = useState('single');
  const [babyCount, setBabyCount] = useState(4);

  const [sharedData, setSharedData] = useState({
    motherId: motherId || '',
    dateOfBirth: '',
  });

  const [singleBaby, setSingleBaby] = useState({
    gender: '', birthWeight: '', birthHeight: '', bloodGroup: '', name: '',
  });

  const [babies, setBabies] = useState([emptyBaby(0), emptyBaby(1)]);
  const [loading, setLoading] = useState(false);

  const handleSharedChange = (e) => {
    setSharedData({ ...sharedData, [e.target.name]: e.target.value });
  };

  const handleSingleBabyChange = (e) => {
    setSingleBaby({ ...singleBaby, [e.target.name]: e.target.value });
  };

  const handleBirthTypeChange = (value) => {
    setMultipleBirthType(value);
    if (value === 'single') return;
    const count = value === 'twin' ? 2 : value === 'triplet' ? 3 : babyCount;
    setBabies(Array.from({ length: count }, (_, i) => emptyBaby(i)));
  };

  const handleBabyCountChange = (e) => {
    const count = parseInt(e.target.value) || 4;
    setBabyCount(count);
    setBabies(Array.from({ length: count }, (_, i) => emptyBaby(i)));
  };

  const handleBabyChange = (index, field, value) => {
    const updated = [...babies];
    updated[index] = { ...updated[index], [field]: value };
    setBabies(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sharedData.motherId) { toast.error('Mother ID is required'); return; }
    if (!sharedData.dateOfBirth) { toast.error('Date of birth is required'); return; }

    setLoading(true);
    try {
      if (multipleBirthType === 'single') {
        const payload = {
          motherId: sharedData.motherId,
          dateOfBirth: sharedData.dateOfBirth,
          ...singleBaby,
        };
        const { data } = await api.post('/children', payload);
        toast.success('Child registered successfully!');
        navigate(`/child/${data._id}`);
      } else {
        for (const baby of babies) {
          if (!baby.gender || !baby.birthWeight) {
            toast.error('Please fill gender and birth weight for all babies');
            setLoading(false);
            return;
          }
        }
        const payload = {
          motherId: sharedData.motherId,
          dateOfBirth: sharedData.dateOfBirth,
          multipleBirthType,
          babies,
        };
        const { data } = await api.post('/children/multiple', payload);
        toast.success(`${data.length} children registered successfully!`);
        navigate(`/mother-history/${sharedData.motherId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
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

  const isMultiple = multipleBirthType !== 'single';

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
              Post Delivery Registration
            </p>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>
              Child Health Record
            </h2>
          </div>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '10px', padding: '0.5rem 1rem',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.78rem',
        }}>
          Postnatal
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit}>

            {/* Birth Type Selector */}
            <div style={{
              backgroundColor: 'white', borderRadius: '14px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              overflow: 'hidden', marginBottom: '1.25rem',
            }}>
              <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                  Delivery Type
                </h3>
              </div>
              <div style={{ padding: '1.5rem' }}>

                {/* Mother ID */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Mother ID *</label>
                  <input
                    style={{ ...inputStyle, backgroundColor: motherId ? '#f0f4f7' : '#f7fbfd', color: '#7f9caa' }}
                    type="text" name="motherId" value={sharedData.motherId}
                    onChange={handleSharedChange} required
                    placeholder="Mother's system ID"
                    readOnly={!!motherId}
                  />
                  {motherId && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: '#27ae60' }}>
                      Mother ID linked automatically
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Date of Birth *</label>
                  <input style={inputStyle} type="date" name="dateOfBirth"
                    value={sharedData.dateOfBirth} onChange={handleSharedChange}
                    required min="2000-01-01" max="2030-12-31"
                    onFocus={focus} onBlur={blur} />
                </div>

                {/* Birth Type Buttons */}
                <div>
                  <label style={labelStyle}>Number of Babies *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {BIRTH_TYPES.map(bt => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => handleBirthTypeChange(bt.value)}
                        style={{
                          padding: '0.7rem 0.5rem', borderRadius: '8px',
                          border: multipleBirthType === bt.value ? '2px solid #1a6b8a' : '2px solid #e8f0f5',
                          backgroundColor: multipleBirthType === bt.value ? '#e8f6f9' : '#f7fbfd',
                          color: multipleBirthType === bt.value ? '#1a6b8a' : '#7f9caa',
                          fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom count input for multiple */}
                  {multipleBirthType === 'multiple' && (
                    <div style={{ marginTop: '1rem' }}>
                      <label style={labelStyle}>Exact Number of Babies *</label>
                      <input
                        style={inputStyle}
                        type="number"
                        min="4"
                        value={babyCount}
                        onChange={handleBabyCountChange}
                        placeholder="Enter number of babies"
                        onFocus={focus} onBlur={blur}
                      />
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: '#9ab0bc' }}>
                        Enter the exact number of babies born (4 or more)
                      </p>
                    </div>
                  )}

                  {isMultiple && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#1a6b8a' }}>
                      All babies below will be linked as siblings from the same delivery.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Single baby form */}
            {!isMultiple && (
              <div style={{
                backgroundColor: 'white', borderRadius: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden', marginBottom: '1.25rem',
              }}>
                <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                    Birth Information
                  </h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Child's Name</label>
                    <input style={inputStyle} type="text" name="name"
                      value={singleBaby.name} onChange={handleSingleBabyChange}
                      placeholder="Leave blank if not yet named"
                      onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Gender *</label>
                      <select style={inputStyle} name="gender" value={singleBaby.gender}
                        onChange={handleSingleBabyChange} required onFocus={focus} onBlur={blur}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Weight (kg) *</label>
                      <input style={inputStyle} type="number" step="0.01" name="birthWeight"
                        value={singleBaby.birthWeight} onChange={handleSingleBabyChange}
                        required placeholder="e.g. 3.20" onFocus={focus} onBlur={blur} />
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Normal: 2.5 – 4.0 kg</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Height (cm)</label>
                      <input style={inputStyle} type="number" step="0.1" name="birthHeight"
                        value={singleBaby.birthHeight} onChange={handleSingleBabyChange}
                        placeholder="e.g. 50.0" onFocus={focus} onBlur={blur} />
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Normal: 48 – 53 cm</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Blood Group</label>
                      <select style={inputStyle} name="bloodGroup" value={singleBaby.bloodGroup}
                        onChange={handleSingleBabyChange} onFocus={focus} onBlur={blur}>
                        <option value="">Select blood group</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Multiple babies form */}
            {isMultiple && babies.map((baby, index) => (
              <div key={index} style={{
                backgroundColor: 'white', borderRadius: '14px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflow: 'hidden', marginBottom: '1.25rem',
                border: '2px dashed #b2dfdb',
              }}>
                <div style={{ background: 'linear-gradient(135deg, #00897b, #26a69a)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>
                    {baby.tempLabel}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Birth order: {index + 1}</span>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={labelStyle}>Child's Name</label>
                    <input style={inputStyle} type="text"
                      value={baby.name} onChange={(e) => handleBabyChange(index, 'name', e.target.value)}
                      placeholder={`Leave blank if not yet named (defaults to "${baby.tempLabel}")`}
                      onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Gender *</label>
                      <select style={inputStyle} value={baby.gender}
                        onChange={(e) => handleBabyChange(index, 'gender', e.target.value)}
                        required onFocus={focus} onBlur={blur}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Weight (kg) *</label>
                      <input style={inputStyle} type="number" step="0.01"
                        value={baby.birthWeight} onChange={(e) => handleBabyChange(index, 'birthWeight', e.target.value)}
                        required placeholder="e.g. 2.40" onFocus={focus} onBlur={blur} />
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.68rem', color: '#9ab0bc' }}>Multiples often weigh less than 2.5 kg</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Birth Height (cm)</label>
                      <input style={inputStyle} type="number" step="0.1"
                        value={baby.birthHeight} onChange={(e) => handleBabyChange(index, 'birthHeight', e.target.value)}
                        placeholder="e.g. 46.0" onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={labelStyle}>Blood Group</label>
                      <select style={inputStyle} value={baby.bloodGroup}
                        onChange={(e) => handleBabyChange(index, 'bloodGroup', e.target.value)}
                        onFocus={focus} onBlur={blur}>
                        <option value="">Select blood group</option>
                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Info box */}
            <div style={{
              backgroundColor: '#e8f6f9', borderRadius: '10px',
              padding: '1rem 1.25rem', marginBottom: '1.25rem',
              border: '1px solid #b2d8e0',
            }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#1a6b8a', fontWeight: '600' }}>
                After registration you can:
              </p>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#4a6a7a', lineHeight: 1.8, textAlign: 'left' }}>
                <li>Track growth records and clinic visits</li>
                <li>Add growth measurements over time</li>
                <li>Log clinic visits and next appointment</li>
              </ul>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => navigate(-1)} style={{
                flex: 1, padding: '0.875rem', backgroundColor: 'white',
                color: '#1a3a4a', border: '2px solid #e8f0f5', borderRadius: '10px',
                fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
              }}>Cancel</button>
              <button type="submit" disabled={loading} style={{
                flex: 2, padding: '0.875rem',
                background: loading ? '#9ab0bc' : 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '0.95rem', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(26,107,138,0.35)',
              }}>
                {loading ? 'Registering...' : isMultiple ? `Register ${babies.length} Children` : 'Register Child'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}