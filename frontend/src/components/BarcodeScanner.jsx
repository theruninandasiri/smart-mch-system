import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function BarcodeScanner() {
  const navigate = useNavigate();
  const [barcodeId, setBarcodeId] = useState('');
  const [mother, setMother] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!barcodeId.trim()) {
      toast.error('Please enter a patient ID');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/mothers/barcode/${barcodeId.trim()}`);
      setMother(res.data);
      toast.success('Mother record found!');
    } catch (err) {
      toast.error('Mother not found. Please check the ID.');
      setMother(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
      }}>
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: '700' }}>
            Patient Lookup
          </h3>
          <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            Enter patient ID to retrieve mother's record
          </p>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* Manual Input */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            value={barcodeId}
            onChange={e => setBarcodeId(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleScan()}
            placeholder="Enter patient ID (e.g. MCH1748234567890)"
            style={{
              flex: 1, padding: '0.7rem 1rem', borderRadius: '8px',
              border: '2px solid #e8f0f5', fontSize: '0.875rem',
              fontFamily: 'monospace', outline: 'none', color: '#1a3a4a',
              backgroundColor: '#f7fbfd',
            }}
            onFocus={e => e.target.style.borderColor = '#1a6b8a'}
            onBlur={e => e.target.style.borderColor = '#e8f0f5'}
            autoFocus
          />
          <button
            onClick={handleScan}
            disabled={loading}
            style={{
              padding: '0.7rem 1.25rem',
              background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '0.875rem', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(26,107,138,0.3)',
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <p style={{ color: '#9ab0bc', fontSize: '0.75rem', margin: '0 0 1rem' }}>
          Tip: Find the patient ID on the printed health card or in the mothers table above
        </p>

        {/* Result */}
        {mother && (
          <div style={{
            border: '2px solid #b2d8e0', borderRadius: '12px',
            padding: '1.25rem', backgroundColor: '#f0fafc',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '44px', height: '44px',
                  background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                  borderRadius: '12px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#1a3a4a', fontSize: '0.95rem', fontWeight: '700' }}>
                    Patient Found
                  </h4>
                  <p style={{ margin: '0.1rem 0 0', fontFamily: 'monospace', fontSize: '0.78rem', color: '#7f9caa' }}>
                    {mother.barcodeId}
                  </p>
                </div>
              </div>
              <span style={{
                padding: '0.3rem 0.875rem', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: '700',
                backgroundColor: mother.riskLevel === 'high' ? '#fdecea' : mother.riskLevel === 'medium' ? '#fef9e7' : '#eafaf1',
                color: mother.riskLevel === 'high' ? '#c0392b' : mother.riskLevel === 'medium' ? '#d68910' : '#27ae60',
                border: `1px solid ${mother.riskLevel === 'high' ? '#f5c6c2' : mother.riskLevel === 'medium' ? '#f5e6b2' : '#a8e6c2'}`,
              }}>
                {mother.riskLevel?.toUpperCase()} RISK
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { label: 'NIC',         value: mother.nic },
                { label: 'MOH Area',    value: mother.mohArea },
                { label: 'Blood Group', value: mother.bloodGroup },
                { label: 'Status',      value: mother.status },
                { label: 'EDD',         value: mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A' },
                { label: 'Pregnancy',   value: `No. ${mother.pregnancyNumber}` },
              ].map(d => (
                <div key={d.label} style={{
                  backgroundColor: 'white', borderRadius: '8px',
                  padding: '0.5rem 0.75rem', border: '1px solid #e8f0f5',
                }}>
                  <p style={{ margin: 0, fontSize: '0.68rem', color: '#7f9caa', fontWeight: '500' }}>{d.label}</p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => navigate(`/mother-history/${mother._id}`)} style={{
                flex: 1, padding: '0.65rem',
                background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
              }}>
                ⏱ Full History
              </button>
              <button onClick={() => navigate(`/risk-assessment/${mother._id}`)} style={{
                flex: 1, padding: '0.65rem',
                background: mother.riskLevel === 'high' ? '#c0392b' : '#1a6b8a',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
              }}>
                ⚠︎ Risk Assessment
              </button>
              <button onClick={() => navigate(`/register-child?motherId=${mother._id}`)} style={{
                flex: 1, padding: '0.65rem',
                backgroundColor: '#27ae60',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
              }}>
                𖠋 Register Child
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}