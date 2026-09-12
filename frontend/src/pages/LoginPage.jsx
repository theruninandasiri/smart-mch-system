import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regData, setRegData] = useState({ name: '', email: '', password: '', role: 'moh_officer', phone: '', nic: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const bgImages = [
    '/maternal.png',
    '/child.png',
    '/nutrition.png',
    '/immunization.png',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      toast.success(t('welcomeMessage', { name: data.name }));
      if (data.role === 'moh_officer') navigate('/dashboard');
      else if (data.role === 'midwife') navigate('/midwife');
      else navigate('/mother');
    } catch (error) {
      toast.error(error.response?.data?.message || t('loginFailed'));
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRegLoading(true);
    try {
      await api.post('/auth/register', regData);
      toast.success(t('registrationSuccess'));
      setShowRegister(false);
      setEmail(regData.email);
      setRegData({ name: '', email: '', password: '', role: 'moh_officer', phone: '', nic: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || t('registrationFailed'));
    }
    setRegLoading(false);
  };

  const inputStyle = {
    padding: '0.45rem 0.875rem', borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.8rem',
    outline: 'none',
  };

  const fieldStyle = {
    width: '100%', padding: '0.7rem 1rem', borderRadius: '8px',
    border: '2px solid #e8f0f5', fontSize: '0.875rem',
    boxSizing: 'border-box', outline: 'none', color: '#1a3a4a',
    backgroundColor: '#f7fbfd', transition: 'border-color 0.4s',
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem',
    color: '#344a5a', fontSize: '0.85rem', fontWeight: '600',
  };

  const cards = [
    { titleKey: 'maternalCare', descKey: 'maternalCareDesc' },
    { titleKey: 'childHealth',  descKey: 'childHealthDesc' },
    { titleKey: 'nutrition',    descKey: 'nutritionDesc' },
    { titleKey: 'immunization', descKey: 'immunizationDesc' },
  ];

  return (
    <div style={{
      height: '100vh', width: '100vw', maxWidth: '100%',
      position: 'relative', display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif", overflow: 'hidden',
    }}>

      {/* Background images*/}
      {bgImages.map((img, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url('${img}')`,
          backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          opacity: activeCard === i ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
        }} />
      ))}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(8,38,54,0.94) 0%, rgba(15,68,88,0.9) 50%, rgba(20,90,105,0.85) 100%)',
        transition: 'background 1.2s ease-in-out',
      }} />

      {/* TOP BAR */}
      <div style={{
        position: 'relative', zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0.6rem 2.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', flexShrink: 0,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.93)', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
  Smart MCH System | Sri Lanka
</div>

        <form onSubmit={handleLogin} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputStyle, width: '140px', cursor: 'pointer', appearance: 'auto', fontSize: '0.75rem' }}>
            <option value="" style={{ color: '#000', backgroundColor: '#fff' }}>{t('selectRole')}</option>
            <option value="moh_officer" style={{ color: '#000', backgroundColor: '#fff' }}>{t('mohOfficer')}</option>
            <option value="midwife"     style={{ color: '#000', backgroundColor: '#fff' }}>{t('midwife')}</option>
            <option value="mother"      style={{ color: '#000', backgroundColor: '#fff' }}>{t('mother')}</option>
          </select>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder={t('emailAddress')} style={{ ...inputStyle, width: '175px' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder={t('password')} style={{ ...inputStyle, width: '135px' }} />
          <button type="submit" disabled={loading} style={{
            padding: '0.45rem 1rem',
            background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
            color: 'white', border: 'none', borderRadius: '6px',
            fontSize: '0.8rem', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.75 : 1, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(26,107,138,0.4)',
          }}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
          <button type="button" onClick={() => setShowRegister(true)} style={{
            padding: '0.45rem 0.875rem',
            background: 'rgba(77,182,172,0.2)',
            border: '1px solid rgba(77,182,172,0.4)',
            color: '#a8e6df', borderRadius: '6px',
            fontSize: '0.78rem', fontWeight: '500',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {t('register')}
          </button>
        </form>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '1rem 2rem',
        textAlign: 'center', gap: '0.75rem', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="MOH Logo" style={{
  height: 'clamp(80px, 14vh, 130px)',
  width: 'clamp(80px, 14vh, 130px)',
  objectFit: 'cover',
  borderRadius: '50%',
  filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
}} />
        </div>
        <div style={{ width: '50px', height: '2px', backgroundColor: 'rgba(77,182,172,0.7)', borderRadius: '2px' }} />
        <h1 style={{
  fontSize: 'clamp(1.5rem, 3.5vw, 2.8rem)',
  fontWeight: '800', margin: 0, lineHeight: 1.15,
  letterSpacing: '-1px', color: '#ffffff',
  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
}}>
          {t('smartMCHTitle')}<br />
          <span style={{ color: '#7de8df', fontSize: 'clamp(1.5rem, 3.5vw, 2.8rem)' }}>{t('smartMCHSubtitle')}</span><br />
          {t('smartMCHSystem')}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
          color: 'rgba(255,255,255,0.82)', fontWeight: '400',
          fontFamily: "'Playfair Display', serif",
          lineHeight: 1.75, margin: 0, maxWidth: '500px',
        }}>
          {t('systemDescription')}
        </p>

        {/* Cards */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {cards.map((card, index) => (
            <div
              key={card.titleKey}
              onClick={() => setActiveCard(index)}
              style={{
                backgroundColor: activeCard === index
                  ? 'rgba(77,182,172,0.3)'
                  : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: activeCard === index
                  ? '1px solid rgba(77,182,172,0.8)'
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px', padding: '0.6rem 0.875rem',
                textAlign: 'center', width: '200px',
                transition: 'all 0.5s ease',
                animation: 'fadeSlideUp 0.5s ease forwards',
                animationDelay: `${index * 0.15}s`, opacity: 0,
                cursor: 'pointer',
                transform: activeCard === index ? 'translateY(-6px)' : 'translateY(0)',
                boxShadow: activeCard === index
                  ? '0 8px 24px rgba(77,182,172,0.4)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
              onMouseEnter={e => {
                if (activeCard !== index) {
                  e.currentTarget.style.backgroundColor = 'rgba(77,182,172,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(77,182,172,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (activeCard !== index) {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }
              }}
            >
              <p style={{ margin: 0, fontWeight: '700', color: 'white', fontSize: '0.8rem' }}>
                {t(card.titleKey)}
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.93)', lineHeight: 1.4 }}>
                {t(card.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          {cards.map((_, i) => (
            <div
              key={i}
              onClick={() => setActiveCard(i)}
              style={{
                width: activeCard === i ? '24px' : '8px',
                height: '8px', borderRadius: '4px',
                backgroundColor: activeCard === i ? '#4db6ac' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.4s ease', cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        position: 'relative', zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '0.65rem 2rem', display: 'flex', justifyContent: 'center',
        alignItems: 'center', flexShrink: 0,
        color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', textAlign: 'center',
      }}>
        Copyright © 2026 - All Rights Reserved.
      </div>

      {/* Register User */}
      {showRegister && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowRegister(false); }}
        >
          <div style={{
            backgroundColor: 'white', borderRadius: '20px',
            padding: '2rem', width: '100%', maxWidth: '420px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#1a3a4a', fontSize: '1.25rem', fontWeight: '700' }}>{t('createAccount')}</h2>
              <button onClick={() => setShowRegister(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleRegister} autoComplete="off">
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>{t('accountType')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { value: 'moh_officer', label: t('mohOfficer') },
                    { value: 'midwife',     label: t('midwife') },
                  ].map(r => (
                    <button key={r.value} type="button" onClick={() => setRegData({ ...regData, role: r.value })} style={{
                      flex: 1, padding: '0.6rem', borderRadius: '8px',
                      fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
                      border: regData.role === r.value ? '2px solid #2d9cad' : '2px solid #e8f0f5',
                      backgroundColor: regData.role === r.value ? '#e8f6f9' : 'white',
                      color: regData.role === r.value ? '#1a6b8a' : '#64748b',
                      transition: 'all 0.2s',
                    }}>
                      {r.label}
                    </button>
                  ))}
                </div>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  {t('mothersRegisteredNote')}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>{t('fullName')}</label>
                <input type="text" autoComplete="off" value={regData.name}
                  onChange={e => setRegData({ ...regData, name: e.target.value })}
                  placeholder="Enter full name" required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#2d9cad'}
                  onBlur={e => e.target.style.borderColor = '#e8f0f5'} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>{t('emailAddress')}</label>
                <input type="email" autoComplete="off" value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })}
                  placeholder="Enter email" required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#2d9cad'}
                  onBlur={e => e.target.style.borderColor = '#e8f0f5'} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>{t('phoneNumber')}</label>
                <input type="text" autoComplete="off" value={regData.phone}
                  onChange={e => setRegData({ ...regData, phone: e.target.value })}
                  placeholder="e.g. 0771234567" required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#2d9cad'}
                  onBlur={e => e.target.style.borderColor = '#e8f0f5'} />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>{t('password')}</label>
                <input type="password" autoComplete="new-password" value={regData.password}
                  onChange={e => setRegData({ ...regData, password: e.target.value })}
                  placeholder="Min 8 characters" required style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#2d9cad'}
                  onBlur={e => e.target.style.borderColor = '#e8f0f5'} />
              </div>

              <button type="submit" disabled={regLoading} style={{
                width: '100%', padding: '0.8rem',
                background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '0.95rem', fontWeight: '700',
                cursor: regLoading ? 'not-allowed' : 'pointer',
                opacity: regLoading ? 0.75 : 1,
                boxShadow: '0 4px 15px rgba(26,107,138,0.35)',
              }}>
                {regLoading ? t('creatingAccount') : t('createAccount')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;