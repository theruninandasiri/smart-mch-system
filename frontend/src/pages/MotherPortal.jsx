import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';

// Contact-detail fields shown on the profile (view-only for mothers).
const CONTACT_FIELDS = [
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'preferredLanguage', label: 'Preferred Language' },
  { key: 'emergencyContactName', label: 'Emergency Contact Name' },
  { key: 'emergencyContactRelationship', label: 'Emergency Contact Relationship' },
  { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
];

export default function MotherPortal() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mother, setMother] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const mothersRes = await api.get('/mothers');
      const myMother = mothersRes.data.find(m => m.nic === user?.nic);
      if (myMother) {
        setMother(myMother);
        const [assessmentsRes, childrenRes] = await Promise.all([
          api.get(`/risk/${myMother._id}`),
          api.get(`/children/mother/${myMother._id}`),
        ]);
        setAssessments(assessmentsRes.data);
        setChildren(childrenRes.data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const icons = {
    overview: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    assessments: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    children: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    messages: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    nutrition: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        <line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/>
      </svg>
    ),
    vaccination: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 2 4 4-14 14H4v-4L18 2z"/>
        <path d="m14.5 5.5 4 4"/>
        <path d="M3 22l3-3"/>
      </svg>
    ),
    download: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    logout: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
  };

  // ── PDF Health Card with QR Code ──
  const downloadHealthCard = async () => {
    if (!mother) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 0;

    const riskColor = mother.riskLevel === 'high' ? [192, 57, 43] :
                      mother.riskLevel === 'medium' ? [214, 137, 16] : [39, 174, 96];

    doc.setFillColor(26, 58, 74);
    doc.rect(0, 0, W, 35, 'F');
    doc.setFillColor(26, 107, 138);
    doc.rect(0, 18, W, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('MINISTRY OF HEALTH | SRI LANKA', 15, 10);
    doc.text('Smart Maternal & Child Healthcare System', 15, 15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MATERNAL HEALTH RECORD', 15, 27);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issued: ${new Date().toLocaleDateString()}`, W - 15, 27, { align: 'right' });
    doc.text(`ID: ${mother.barcodeId || 'N/A'}`, W - 15, 32, { align: 'right' });
    doc.setFillColor(...riskColor);
    doc.roundedRect(W - 55, 6, 40, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${(mother.riskLevel || 'LOW').toUpperCase()} RISK`, W - 35, 11.5, { align: 'center' });

    y = 42;

    const checkPage = () => {
      if (y > 268) { doc.addPage(); y = 15; }
    };

    const sectionHeader = (title, color) => {
      checkPage();
      doc.setFillColor(...color);
      doc.rect(10, y, W - 20, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 15, y + 5.5);
      y += 10;
    };

    const fieldRow = (fields) => {
      checkPage();
      const colW = (W - 20) / fields.length;
      fields.forEach(([label, value], i) => {
        const x = 10 + i * colW;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(127, 156, 170);
        doc.setFontSize(6.5);
        doc.text(label.toUpperCase(), x + 2, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 58, 74);
        doc.setFontSize(7.5);
        const val = String(value || 'N/A');
        doc.text(val.length > 28 ? val.substring(0, 28) + '...' : val, x + 2, y + 5);
      });
      doc.setDrawColor(238, 244, 247);
      doc.line(10, y + 7, W - 10, y + 7);
      y += 10;
    };

    const textBlock = (label, value) => {
      checkPage();
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(127, 156, 170);
      doc.setFontSize(6.5);
      doc.text(label.toUpperCase(), 12, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(26, 58, 74);
      doc.setFontSize(7.5);
      const lines = doc.splitTextToSize(String(value || 'N/A'), W - 30);
      doc.text(lines, 12, y + 5);
      doc.setDrawColor(238, 244, 247);
      doc.line(10, y + 5 + lines.length * 3.5, W - 10, y + 5 + lines.length * 3.5);
      y += 7 + lines.length * 3.5;
    };

    sectionHeader('PERSONAL INFORMATION', [26, 58, 74]);
    fieldRow([['NIC Number', mother.nic], ['Full Name', mother.fullName]]);
    fieldRow([['Date of Birth', mother.dateOfBirth ? new Date(mother.dateOfBirth).toLocaleDateString() : 'N/A'], ['Blood Group', mother.bloodGroup], ['Phone', mother.phone]]);
    fieldRow([['Email', mother.email], ['Ethnicity', mother.ethnicity], ['Preferred Language', mother.preferredLanguage]]);
    fieldRow([['Address', mother.address]]);
    fieldRow([['Emergency Contact', mother.emergencyContactName], ['Relationship', mother.emergencyContactRelationship], ['Emergency Phone', mother.emergencyContactPhone]]);
    y += 3;

    sectionHeader('CLINIC INFORMATION', [26, 107, 138]);
    fieldRow([['MOH Area', mother.mohArea], ['Midwife Area', mother.midwifeArea]]);
    fieldRow([['Status', (mother.status || 'N/A').toUpperCase()], ['Risk Level', (mother.riskLevel || 'N/A').toUpperCase()], ['Patient ID', mother.barcodeId]]);
    y += 3;

    sectionHeader('PREGNANCY DETAILS', [45, 182, 172]);
    fieldRow([['Pregnancy Number', mother.pregnancyNumber], ['LMP Date', mother.lmpDate ? new Date(mother.lmpDate).toLocaleDateString() : 'N/A'], ['EDD', mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A']]);
    fieldRow([['Conception Type', mother.conceptionType]]);
    if (mother.currentSymptoms) textBlock('Current Symptoms', mother.currentSymptoms);
    y += 3;

    sectionHeader('OBSTETRIC HISTORY', [13, 115, 119]);
    fieldRow([['Previous Deliveries', mother.previousDeliveries], ['Miscarriages', mother.previousMiscarriages], ['Terminations', mother.previousTerminations], ['Ectopic', mother.previousEctopic]]);
    fieldRow([['Delivery Types', mother.deliveryTypes]]);
    if (mother.pastComplications) textBlock('Past Complications', mother.pastComplications);
    y += 3;

    sectionHeader('MEDICAL & SURGICAL HISTORY', [14, 160, 133]);
    fieldRow([['Known Allergies', mother.allergies]]);
    if (mother.chronicConditions) textBlock('Chronic Conditions', mother.chronicConditions);
    if (mother.surgeries) textBlock('Past Surgeries', mother.surgeries);
    if (mother.currentMedications) textBlock('Current Medications', mother.currentMedications);
    y += 3;

    sectionHeader('FAMILY MEDICAL HISTORY', [108, 92, 231]);
    if (mother.familyGeneticConditions) textBlock('Genetic / Inherited Conditions', mother.familyGeneticConditions);
    if (mother.familyChronicIllnesses) textBlock('Family Chronic Illnesses', mother.familyChronicIllnesses);
    y += 3;

    sectionHeader('MENTAL HEALTH & WELLBEING', [92, 92, 200]);
    if (mother.mentalHealthHistory) textBlock('Mental Health History', mother.mentalHealthHistory);
    if (mother.supportSystem) textBlock('Support System at Home', mother.supportSystem);
    y += 3;

    sectionHeader('LIFESTYLE FACTORS', [214, 137, 16]);
    fieldRow([['Smoking Status', mother.smokingStatus], ['Alcohol Intake', mother.alcoholIntake], ['Occupation', mother.occupation]]);
    fieldRow([['Recreational Drug Use', mother.recreationalDrugs ? 'Yes' : 'No']]);
    y += 3;

    if (assessments.length > 0) {
      sectionHeader('RISK ASSESSMENT HISTORY', [192, 57, 43]);
      doc.setFillColor(220, 80, 60);
      doc.rect(10, y, W - 20, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('DATE', 13, y + 4.5);
      doc.text('RISK', 45, y + 4.5);
      doc.text('BLOOD PRESSURE', 68, y + 4.5);
      doc.text('WEIGHT', 105, y + 4.5);
      doc.text('HEMOGLOBIN', 130, y + 4.5);
      doc.text('EPDS', 165, y + 4.5);
      doc.text('NOTES', 178, y + 4.5);
      y += 7;
      assessments.forEach((a, i) => {
        checkPage();
        const bg = i % 2 === 0 ? [247, 251, 253] : [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(10, y, W - 20, 7, 'F');
        doc.setTextColor(26, 58, 74);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date(a.visitDate).toLocaleDateString(), 13, y + 4.5);
        const rc = a.riskLevel === 'high' ? [192, 57, 43] : a.riskLevel === 'medium' ? [214, 137, 16] : [39, 174, 96];
        doc.setFillColor(...rc);
        doc.roundedRect(43, y + 1, 18, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text((a.riskLevel || '').toUpperCase(), 52, y + 4.5, { align: 'center' });
        doc.setTextColor(26, 58, 74);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text(`${a.bloodPressureSystolic || 'N/A'}/${a.bloodPressureDiastolic || 'N/A'} mmHg`, 68, y + 4.5);
        doc.text(`${a.weight || 'N/A'} kg`, 105, y + 4.5);
        doc.text(`${a.hemoglobin || 'N/A'} g/dL`, 130, y + 4.5);
        doc.text(String(a.epdsScore ?? 'N/A'), 165, y + 4.5);
        if (a.clinicalNotes) doc.text(String(a.clinicalNotes).substring(0, 15), 178, y + 4.5);
        y += 7;
      });
      y += 5;
    }

    if (children.length > 0) {
      sectionHeader('CHILDREN', [39, 174, 96]);
      doc.setFillColor(30, 140, 75);
      doc.rect(10, y, W - 20, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text('GENDER', 13, y + 4.5);
      doc.text('DATE OF BIRTH', 50, y + 4.5);
      doc.text('BIRTH WEIGHT', 95, y + 4.5);
      doc.text('BIRTH HEIGHT', 135, y + 4.5);
      doc.text('BLOOD GROUP', 170, y + 4.5);
      y += 7;
      children.forEach((child, i) => {
        checkPage();
        const bg = i % 2 === 0 ? [234, 250, 241] : [255, 255, 255];
        doc.setFillColor(...bg);
        doc.rect(10, y, W - 20, 7, 'F');
        doc.setTextColor(26, 58, 74);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text((child.gender || 'N/A').toUpperCase(), 13, y + 4.5);
        doc.text(child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A', 50, y + 4.5);
        doc.text(`${child.birthWeight || 'N/A'} kg`, 95, y + 4.5);
        doc.text(`${child.birthHeight || 'N/A'} cm`, 135, y + 4.5);
        doc.text(child.bloodGroup || 'N/A', 170, y + 4.5);
        y += 7;
      });
      y += 5;
    }

    // ── QR CODE (replaces fake barcode) ──
    checkPage();
    doc.setDrawColor(238, 244, 247);
    doc.line(10, y, W - 10, y);
    y += 8;

    try {
      const QRCode = await import('qrcode');
      const scanUrl = `http://10.114.12.68:5173/scan/${mother.barcodeId}`;
      const qrDataUrl = await QRCode.default.toDataURL(scanUrl, {
        width: 200, margin: 1,
        color: { dark: '#1a3a4a', light: '#ffffff' },
      });
      doc.addImage(qrDataUrl, 'PNG', W / 2 - 22, y, 44, 44);
      doc.setTextColor(127, 156, 170);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan QR code to view patient record', W / 2, y + 47, { align: 'center' });
      doc.setFontSize(6.5);
      doc.text(mother.barcodeId, W / 2, y + 52, { align: 'center' });
      y += 58;
    } catch (err) {
      // fallback text if QR fails
      doc.setTextColor(127, 156, 170);
      doc.setFontSize(7);
      doc.text(mother.barcodeId, W / 2, y + 8, { align: 'center' });
      y += 15;
    }

    // ── FOOTER on every page ──
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(26, 58, 74);
      doc.rect(0, 285, W, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Copyright © 2026 - Ministry of Health - All Rights Reserved', W / 2, 290, { align: 'center' });
      doc.text(`Smart Maternal & Child Healthcare with Nutrition Management System |  Page ${p} of ${pageCount}`, W / 2, 294, { align: 'center' });
    }

    doc.save(`health-card-${mother.nic}.pdf`);
  };

  const riskStyles = {
    high:   { bg: '#c0392b', light: '#fdecea', border: '#f5c6c2' },
    medium: { bg: '#d68910', light: '#fef9e7', border: '#f5e6b2' },
    low:    { bg: '#27ae60', light: '#eafaf1', border: '#a8e6c2' },
  };

  const sidebarItems = [
    { key: 'overview',    label: t('overview'),    icon: icons.overview },
    { key: 'assessments', label: t('riskHistory'), icon: icons.assessments },
    { key: 'children',    label: t('myChildren'),  icon: icons.children },
    { key: 'messages',    label: t('messages'),    icon: icons.messages },
  ];

  const tabs = [
    { key: 'overview',    label: t('overview') },
    { key: 'assessments', label: t('riskHistory') },
    { key: 'children',    label: t('myChildren') },
    { key: 'messages',    label: t('messages') },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#7f9caa' }}>
      {t('loading')}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9fc' }}>

      {/* Sidebar */}
      <div style={{
        width: '240px', flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh',
        background: 'linear-gradient(180deg, #1a3a4a 0%, #1a6b8a 100%)',
        color: 'white', display: 'flex', flexDirection: 'column', zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/logo.png" alt="MOH Logo" style={{ height: '48px', objectFit: 'contain',borderRadius:'50px' }} />
            <div>
              
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '0.85rem', fontWeight: '700' }}>Smart MCH System</h3>
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '0.65rem 0.875rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600' }}>{user?.name}</p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', opacity: 0.55, textTransform: 'capitalize' }}>{t('mother')}</p>
            {mother && (
              <span style={{
                display: 'inline-block', marginTop: '0.3rem',
                padding: '0.15rem 0.6rem', borderRadius: '20px',
                backgroundColor: riskStyles[mother.riskLevel]?.bg || '#27ae60',
                color: 'white', fontSize: '0.65rem', fontWeight: '700',
              }}>
                {t(mother.riskLevel)?.toUpperCase()} {t('riskLevel')}
              </span>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <p style={{ margin: '0 0 0.5rem 0.25rem', fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
            {t('mainMenu')}
          </p>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <div key={item.key} onClick={() => setActiveTab(item.key)} style={{
                padding: '0.7rem 1rem', cursor: 'pointer', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'all 0.2s',
                backgroundColor: isActive ? 'rgba(77,182,172,0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #4db6ac' : '3px solid transparent',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#4db6ac' : 'rgba(255,255,255,0.8)',
              }}>
                <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            );
          })}

          <p style={{ margin: '1rem 0 0.5rem 0.25rem', fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
            Quick Access
          </p>
          {mother && [
            { label: t('nutritionInfo'),     icon: icons.nutrition,   action: () => navigate(`/nutrition?motherId=${mother._id}`) },
            { label: t('vaccination'),       icon: icons.vaccination, action: () => navigate('/vaccination') },
            { label: 'Download Health Card', icon: icons.download,    action: downloadHealthCard },
          ].map(item => (
            <div key={item.label} onClick={item.action} style={{
              padding: '0.7rem 1rem', cursor: 'pointer', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              fontSize: '0.875rem', marginBottom: '0.2rem', transition: 'all 0.2s',
              color: 'rgba(255,255,255,0.8)',
            }}>
              <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '1rem 0.75rem 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div onClick={handleLogout} style={{
            padding: '0.7rem 1rem', cursor: 'pointer', borderRadius: '10px',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            fontSize: '0.875rem', color: '#f1948a',
            backgroundColor: 'rgba(231,76,60,0.1)', transition: 'background 0.2s',
          }}>
            <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {icons.logout}
            </span>
            <span>{t('logout')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '240px', padding: '2rem 2.5rem', overflowY: 'auto' }}>

        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '700', color: '#1a3a4a' }}>
              {t('myHealthRecord')}
            </h1>
            <p style={{ margin: '0.25rem 0 0', color: '#7f9caa', fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {mother && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.6rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderLeft: `4px solid ${riskStyles[mother.riskLevel]?.bg || '#27ae60'}` }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ab0bc', textTransform: 'uppercase' }}>{t('riskLevel')}</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.875rem', fontWeight: '700', color: riskStyles[mother.riskLevel]?.bg || '#27ae60' }}>{t(mother.riskLevel)?.toUpperCase()}</p>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.6rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderLeft: '4px solid #1a6b8a' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ab0bc', textTransform: 'uppercase' }}>{t('status')}</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.875rem', fontWeight: '700', color: '#1a6b8a', textTransform: 'capitalize' }}>{t(mother.status)}</p>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '0.6rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', borderLeft: '4px solid #27ae60' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#9ab0bc', textTransform: 'uppercase' }}>{t('myChildren')}</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.875rem', fontWeight: '700', color: '#27ae60' }}>{children.length}</p>
              </div>
              <button onClick={downloadHealthCard} style={{
                padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)',
                color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '600',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,107,138,0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                ⬇ Download Health Card
              </button>
            </div>
          )}
        </div>

        {!mother ? (
          <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e8f6f9', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>+</div>
            <h3 style={{ margin: '0 0 0.5rem', color: '#1a3a4a', fontSize: '1.1rem', fontWeight: '700' }}>{t('noHealthRecord')}</h3>
            <p style={{ margin: '0 0 1rem', color: '#7f9caa', fontSize: '0.875rem' }}>{t('noHealthRecordDesc')}</p>
            <button onClick={() => navigate('/messages')} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
              {t('contactMidwife')}
            </button>
          </div>
        ) : (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #1a3a4a, #1a6b8a)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('myProfile')}</h3>
                <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{mother.barcodeId}</span>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  {[
                    { label: t('nic'),             value: mother.nic },
                    { label: t('bloodGroup'),      value: mother.bloodGroup || 'N/A' },
                    { label: t('mohArea'),         value: mother.mohArea },
                    { label: t('midwifeArea'),     value: mother.midwifeArea },
                    { label: 'LMP',                value: mother.lmpDate ? new Date(mother.lmpDate).toLocaleDateString() : 'N/A' },
                    { label: t('edd'),             value: mother.edd ? new Date(mother.edd).toLocaleDateString() : 'N/A' },
                    { label: t('pregnancyNumber'), value: mother.pregnancyNumber },
                  ].map(d => (
                    <div key={d.label} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f4f7' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.label}</p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Contact Information — view-only ── */}
            <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>Contact Information</h3>
              </div>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {CONTACT_FIELDS.map(f => (
                    <div key={f.key} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f4f7' }}>
                      <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ab0bc', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {f.label}
                      </p>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>
                        {mother[f.key] || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer',
                  border: 'none', transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.key ? '#1a6b8a' : 'white',
                  color: activeTab === tab.key ? 'white' : '#4a6a7a',
                  boxShadow: activeTab === tab.key ? '0 4px 12px rgba(26,107,138,0.3)' : '0 2px 6px rgba(0,0,0,0.05)',
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', padding: '0.875rem 1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('latestRiskAssessment')}</h3>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    {assessments.length === 0 ? (
                      <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noAssessmentsYet')}</p>
                    ) : (() => {
                      const latest = assessments[0];
                      const rs = riskStyles[latest.riskLevel] || riskStyles.low;
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.82rem', color: '#7f9caa' }}>{new Date(latest.visitDate).toLocaleDateString()}</span>
                            <span style={{ padding: '0.2rem 0.75rem', borderRadius: '20px', backgroundColor: rs.bg, color: 'white', fontSize: '0.75rem', fontWeight: '700' }}>
                              {t(latest.riskLevel)?.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {[
                              { label: t('bloodPressure'), value: `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}` },
                              { label: t('weight'),        value: `${latest.weight} kg` },
                              { label: t('hemoglobin'),    value: `${latest.hemoglobin} g/dL` },
                              { label: t('epdsScore'),     value: latest.epdsScore ?? 'N/A' },
                            ].map(d => (
                              <div key={d.label} style={{ backgroundColor: '#f7fbfd', borderRadius: '8px', padding: '0.5rem 0.75rem', border: '1px solid #e8f0f5' }}>
                                <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ab0bc' }}>{d.label}</p>
                                <p style={{ margin: '0.1rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('myChildren')}</h3>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    {children.length === 0 ? (
                      <p style={{ color: '#9ab0bc', fontSize: '0.875rem', margin: 0 }}>{t('noChildrenYet')}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {children.map(child => (
                          <div key={child._id} style={{ backgroundColor: '#f7fbfd', borderRadius: '8px', padding: '0.75rem', border: '1px solid #e8f0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', color: '#1a3a4a', fontSize: '0.875rem', textTransform: 'capitalize' }}>{t(child.gender)}</p>
                              <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: '#7f9caa' }}>DOB: {new Date(child.dateOfBirth).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => navigate(`/child/${child._id}`)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', backgroundColor: '#eafaf1', color: '#27ae60', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{t('view')}</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', padding: '0.875rem 1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('quickActions')}</h3>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {[
                      { labelKey: 'viewRiskHistory', action: () => setActiveTab('assessments'), color: '#c0392b', bg: '#fdecea', border: '#f5c6c2' },
                      { labelKey: 'messages',        action: () => navigate('/messages'),        color: '#1a6b8a', bg: '#e8f6f9', border: '#b2d8e0' },
                      { labelKey: 'nutritionInfo',   action: () => navigate(`/nutrition?motherId=${mother._id}`), color: '#27ae60', bg: '#eafaf1', border: '#a8e6c2' },
                    ].map(a => (
                      <button key={a.labelKey} onClick={a.action} style={{ padding: '0.875rem', borderRadius: '10px', backgroundColor: a.bg, color: a.color, border: `1px solid ${a.border}`, fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
                        {t(a.labelKey)}
                      </button>
                    ))}
                    <button onClick={downloadHealthCard} style={{ padding: '0.875rem', borderRadius: '10px', backgroundColor: '#f0f4f7', color: '#1a3a4a', border: '1px solid #d0dde5', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}>
                      ⬇ Health Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assessments' && (
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #c0392b, #e74c3c)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('riskAssessmentHistory')}</h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{assessments.length} records</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {assessments.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noAssessmentsYet')}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {assessments.map(a => {
                        const rs = riskStyles[a.riskLevel] || riskStyles.low;
                        return (
                          <div key={a._id} style={{ border: `1px solid ${rs.border}`, borderRadius: '10px', padding: '1.25rem', backgroundColor: rs.light }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '0.82rem', color: '#7f9caa' }}>{t('visitHistory')}: {new Date(a.visitDate).toLocaleDateString()}</span>
                              <span style={{ padding: '0.2rem 0.75rem', borderRadius: '20px', backgroundColor: rs.bg, color: 'white', fontSize: '0.75rem', fontWeight: '700' }}>{t(a.riskLevel)?.toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                              {[
                                { label: t('bloodPressure'), value: `${a.bloodPressureSystolic}/${a.bloodPressureDiastolic} mmHg` },
                                { label: t('weight'),        value: `${a.weight} kg` },
                                { label: t('hemoglobin'),    value: `${a.hemoglobin} g/dL` },
                                { label: t('epdsScore'),     value: a.epdsScore ?? 'N/A' },
                              ].map(d => (
                                <div key={d.label} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '0.5rem 0.75rem', border: '1px solid rgba(0,0,0,0.05)' }}>
                                  <p style={{ margin: 0, fontSize: '0.68rem', color: '#9ab0bc' }}>{d.label}</p>
                                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.875rem', fontWeight: '600', color: '#1a3a4a' }}>{d.value}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'children' && (
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '0.875rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: '700' }}>{t('myChildren')}</h3>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>{children.length} children</span>
                </div>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {children.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#9ab0bc', padding: '2rem 0', margin: 0 }}>{t('noChildrenYet')}</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {children.map(child => (
                        <div key={child._id} style={{ border: '1px solid #eef4f7', borderRadius: '10px', padding: '1rem', backgroundColor: '#f7fbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#1a3a4a', fontSize: '0.875rem', textTransform: 'capitalize' }}>{t(child.gender)}</p>
                            <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: '#7f9caa' }}>DOB: {new Date(child.dateOfBirth).toLocaleDateString()} · {t('birthWeight')}: {child.birthWeight} kg</p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => navigate(`/child/${child._id}`)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem', backgroundColor: '#e8f6f9', color: '#1a6b8a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{t('view')}</button>
                            <button onClick={() => navigate(`/vaccination?childId=${child._id}`)} style={{ fontSize: '0.78rem', padding: '0.35rem 0.875rem', backgroundColor: '#eafaf1', color: '#27ae60', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>{t('vaccination')}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉</div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#1a3a4a', fontSize: '1.1rem', fontWeight: '700' }}>{t('messages')}</h3>
                <p style={{ color: '#7f9caa', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{t('selectConversation')}</p>
                <button onClick={() => navigate('/messages')} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #1a6b8a, #2d9cad)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                  {t('goToMessages')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
