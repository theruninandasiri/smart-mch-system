import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function PublicScan() {
  const { barcodeId } = useParams();
  const [mother, setMother] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/mothers/barcode/${barcodeId}`)
      .then(res => setMother(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [barcodeId]);

  const riskColors = {
    high:   { bg: '#fdecea', color: '#c0392b', border: '#f5c6c2' },
    medium: { bg: '#fef9e7', color: '#d68910', border: '#f5e6b2' },
    low:    { bg: '#eafaf1', color: '#27ae60', border: '#a8e6c2' },
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f4f9fc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #1a6b8a',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
        }} />
        <p style={{ color: '#7f9caa', fontSize: '0.875rem' }}>Loading patient record...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f4f9fc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '2rem',
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '20px',
        padding: '3rem 2rem', textAlign: 'center', maxWidth: '400px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ margin: '0 0 0.5rem', color: '#1a3a4a', fontSize: '1.25rem', fontWeight: '700' }}>
          Record Not Found
        </h2>
        <p style={{ margin: 0, color: '#7f9caa', fontSize: '0.875rem' }}>
          Barcode ID: <code style={{ color: '#1a6b8a' }}>{barcodeId}</code>
        </p>
        <p style={{ margin: '0.5rem 0 0', color: '#7f9caa', fontSize: '0.82rem' }}>
          Please contact the clinic for assistance.
        </p>
      </div>
    </div>
  );

  const rs = riskColors[mother.riskLevel] || riskColors.low;

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f4f9fc',
      fontFamily: "'Inter', sans-serif", padding: '1.5rem',
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
          borderRadius: '16px', padding: '1.5rem',
          textAlign: 'center', marginBottom: '1rem',
          boxShadow: '0 4px 20px rgba(26,107,138,0.3)',
        }}>
          <img src="/MOH logo.png" alt="MOH" style={{ height: '56px', objectFit: 'contain', marginBottom: '0.75rem' }} />
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
            සෞඛ්‍ය අමාත්‍යාංශය | சுகாதார அமைச்சு
          </p>
          <h2 style={{ margin: '0.25rem 0 0', color: 'white', fontSize: '1rem', fontWeight: '700' }}>
            Ministry of Health — Sri Lanka
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
            Smart Maternal & Child Healthcare System
          </p>
        </div>

        {/* Risk Badge */}
        <div style={{
          backgroundColor: rs.bg, border: `2px solid ${rs.border}`,
          borderRadius: '12px', padding: '1rem 1.5rem',
          textAlign: 'center', marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: rs.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Risk Level
          </p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', fontWeight: '800', color: rs.color }}>
            {(mother.riskLevel || 'LOW').toUpperCase()}
          </p>
        </div>

        {/* Patient Info */}
        <div style={{
          backgroundColor: 'white', borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          overflow: 'hidden', marginBottom: '1rem',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
            padding: '0.875rem 1.25rem',
          }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '0.875rem', fontWeight: '700' }}>
              Patient Information
            </h3>
          </div>
          <div style={{ padding: '1.25rem' }}>
            {[
              { label: 'Full Name',    value: mother.fullName || 'N/A' },
              { label: 'NIC Number',   value: mother.nic },
              { label: 'Blood Group',  value: mother.bloodGroup || 'N/A' },
              { label: 'MOH Area',     value: mother.mohArea },
              { label: 'Midwife Area', value: mother.midwifeArea },
              { label: 'Status',       value: (mother.status || 'N/A').toUpperCase() },
              { label: 'EDD',          value: mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A' },
              { label: 'Pregnancy No', value: mother.pregnancyNumber },
            ].map(d => (
              <div key={d.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.625rem 0', borderBottom: '1px solid #f0f4f7',
              }}>
                <span style={{ fontSize: '0.78rem', color: '#9ab0bc', fontWeight: '500' }}>{d.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        {mother.emergencyContactName && (
          <div style={{
            backgroundColor: '#fdecea', border: '1px solid #f5c6c2',
            borderRadius: '12px', padding: '1rem 1.25rem',
            marginBottom: '1rem',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: '#c0392b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Emergency Contact
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>
              {mother.emergencyContactName}
            </p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.82rem', color: '#4a6a7a' }}>
              {mother.emergencyContactRelationship} · {mother.emergencyContactPhone}
            </p>
          </div>
        )}

        {/* Barcode ID */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px',
          padding: '1rem 1.25rem', textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ab0bc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Patient ID
          </p>
          <p style={{ margin: '0.25rem 0 0', fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: '700', color: '#1a3a4a' }}>
            {mother.barcodeId}
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ab0bc' }}>
            Scanned: {new Date().toLocaleString()}
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.65rem', color: '#c8d8e0' }}>
            Smart MCH System · Ministry of Health · Sri Lanka
          </p>
        </div>

      </div>
    </div>
  );
}