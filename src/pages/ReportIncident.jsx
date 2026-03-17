import { useState } from 'react';
import api from '../api/client';
import PriorityBadge from '../components/PriorityBadge.jsx';
import SpeciesIdentifier from '../components/AI/SpeciesIdentifier.jsx';
import InjuryAssessor from '../components/AI/InjuryAssessor.jsx';

export default function ReportIncident() {
  const [activeTab, setActiveTab] = useState('species');
  const [form, setForm] = useState({
    addressText: '',
    latitude: '',
    longitude: '',
    animalCategory: 'wildlife',
    incidentType: 'injured',
    description: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const res = await api.post('/incidents', payload);
      setResult(res.data);
      setForm({ addressText: '', latitude: '', longitude: '', animalCategory: 'wildlife', incidentType: 'injured', description: '' });
    } catch {
      setError('Failed to submit incident report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => alert('Unable to retrieve your location.')
    );
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .ri-input:focus  { border-color: #16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.1) !important; outline: none; }
        .ri-tab-btn:hover { background: #f1f5f9 !important; }
        .upload-zone:hover { border-color: #16a34a !important; background: #f0fdf4 !important; }
        .submit-btn:hover:not(:disabled) { background: #15803d !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.3) !important; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Page header */}
      <div style={s.pageHeader}>
        <div style={s.pageHeaderLeft}>
          <div style={s.pageHeaderIcon}>🦁</div>
          <div>
            <h1 style={s.pageTitle}>Report Wildlife Incident</h1>
            <p style={s.pageSubtitle}>Help us respond quickly to wildlife in need</p>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.layout}>

          {/* ── LEFT SIDEBAR ── */}
          <div style={s.sidebar}>

            {/* AI Tools card */}
            <div style={s.sideCard}>
              <div style={s.sideCardHeader}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <span style={s.sideCardTitle}>AI Assistance</span>
              </div>

              <div style={s.tabBar}>
                <button
                  type="button"
                  className="ri-tab-btn"
                  onClick={() => setActiveTab('species')}
                  style={{ ...s.tab, ...(activeTab === 'species' ? s.tabActive : {}) }}
                >
                  🧬 Identify Species
                </button>
                <button
                  type="button"
                  className="ri-tab-btn"
                  onClick={() => setActiveTab('injury')}
                  style={{ ...s.tab, ...(activeTab === 'injury' ? s.tabActive : {}) }}
                >
                  🏥 Assess Condition
                </button>
              </div>

              <p style={s.sideCardHint}>
                Upload a photo to identify the animal or assess its condition.
              </p>
            </div>

            {/* AI tool panel */}
            <div style={s.aiPanel}>
              {activeTab === 'species' ? <SpeciesIdentifier /> : <InjuryAssessor />}
            </div>

            {/* Tip */}
            <div style={s.tipCard}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>💡</span>
              <p style={s.tipText}>Clear photos help our team identify species and assess conditions faster.</p>
            </div>
          </div>

          {/* ── MAIN FORM ── */}
          <div style={s.formCard}>

            {error && (
              <div style={s.errorBanner}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit}>

              {/* Location section */}
              <div style={s.section}>
                <div style={s.sectionHead}>
                  <div style={s.sectionIcon}>📍</div>
                  <span style={s.sectionTitle}>Location Details</span>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Address or Landmark</label>
                  <input
                    type="text"
                    className="ri-input"
                    style={s.input}
                    placeholder="e.g., North Rim Trail, Cliff Side"
                    value={form.addressText}
                    onChange={(e) => setForm({ ...form, addressText: e.target.value })}
                    required
                  />
                </div>

                <div style={s.fieldGroup}>
                  <div style={s.gpsRow}>
                    <label style={{ ...s.label, marginBottom: 0 }}>
                      GPS Coordinates <span style={s.optional}>(Optional)</span>
                    </label>
                    <button type="button" onClick={useMyLocation} style={s.locLink}>
                      📍 Use my location
                    </button>
                  </div>
                  <div style={{ ...s.coordRow, marginTop: 6 }}>
                    <input
                      type="number"
                      className="ri-input"
                      style={s.input}
                      placeholder="Latitude"
                      step="0.0001"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    />
                    <input
                      type="number"
                      className="ri-input"
                      style={s.input}
                      placeholder="Longitude"
                      step="0.0001"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              {/* Animal section */}
              <div style={s.section}>
                <div style={s.sectionHead}>
                  <div style={s.sectionIcon}>🐾</div>
                  <span style={s.sectionTitle}>Animal Details</span>
                </div>

                <div style={s.grid2}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Animal Type</label>
                    <select
                      className="ri-input"
                      style={{ ...s.input, ...s.select }}
                      value={form.animalCategory}
                      onChange={(e) => setForm({ ...form, animalCategory: e.target.value })}
                      required
                    >
                      <option value="wildlife">Wild Animal</option>
                      <option value="bird">Bird</option>
                      <option value="reptile">Reptile / Amphibian</option>
                      <option value="mammal">Large Mammal</option>
                      <option value="other">Unknown Species</option>
                    </select>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Situation</label>
                    <select
                      className="ri-input"
                      style={{ ...s.input, ...s.select }}
                      value={form.incidentType}
                      onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
                      required
                    >
                      <option value="injured">Injured or Sick</option>
                      <option value="trapped">Trapped or Stuck</option>
                      <option value="endangered">In Danger</option>
                      <option value="aggressive">Aggressive Behavior</option>
                      <option value="other">Other Concern</option>
                    </select>
                  </div>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Description</label>
                  <textarea
                    className="ri-input"
                    style={{ ...s.input, minHeight: 110, resize: 'vertical' }}
                    placeholder="Describe what you observed — the animal's condition, behavior, and any immediate dangers..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>

                {/* Photo upload */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>
                    Photos <span style={s.optional}>(Optional)</span>
                  </label>
                  <label className="upload-zone" style={s.uploadZone}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => console.log(e.target.files)}
                    />
                    <span style={{ fontSize: 20, color: '#94a3b8' }}>↑</span>
                    <span style={s.uploadPrimary}>Click to upload photos</span>
                    <span style={s.uploadSub}>JPG, PNG or WEBP — helps with faster identification</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} className="submit-btn" style={s.submitBtn}>
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={s.btnSpinner} />
                    Submitting Report...
                  </span>
                ) : 'Submit Report'}
              </button>
            </form>
    
          </div>

        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: '#0f172a',
  },
  pageHeader: {
    display: 'flex', alignItems: 'center',
    padding: '24px 48px 0',
    maxWidth: 1100, margin: '0 auto', width: '100%',
    boxSizing: 'border-box',
  },
  pageHeaderLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  pageHeaderIcon: {
    width: 52, height: 52, borderRadius: 14,
    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
  },
  pageTitle:    { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' },
  pageSubtitle: { fontSize: 13, color: '#94a3b8', margin: '3px 0 0' },
  body: {
    maxWidth: 1100, margin: '0 auto',
    padding: '20px 48px 48px',
    boxSizing: 'border-box',
  },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },

  /* Sidebar */
  sidebar: { width: 270, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 24 },
  sideCard: {
    background: '#fff', borderRadius: 14,
    border: '1px solid #e2e8f0', padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  sideCardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  sideCardTitle:  { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  tabBar: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 },
  tab: {
    padding: '8px 12px', borderRadius: 8, border: 'none',
    background: 'transparent', textAlign: 'left', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#64748b',
    transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif",
  },
  tabActive: { background: '#f0fdf4', color: '#16a34a', fontWeight: 600 },
  sideCardHint: { fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 },
  aiPanel: {
    background: '#fff', borderRadius: 14,
    border: '1px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  tipCard: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 12, padding: '12px 14px',
  },
  tipText: { fontSize: 12, color: '#166534', lineHeight: 1.5, margin: 0 },

  /* Form card */
  formCard: {
    flex: 1, background: '#fff', borderRadius: 14,
    border: '1px solid #e2e8f0', padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    animation: 'fadeUp 0.35s ease both',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 8,
    padding: '10px 14px', fontSize: 13, fontWeight: 500,
    marginBottom: 20,
  },
  section:     { marginBottom: 24 },
  sectionHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 },
  sectionIcon: {
    width: 32, height: 32, borderRadius: 8,
    background: '#f8fafc', border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  divider:      { height: 1, background: '#f1f5f9', margin: '4px 0 24px' },

  fieldGroup: { marginBottom: 16 },
  label:      { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  optional:   { fontWeight: 400, color: '#94a3b8', fontSize: 12 },
  input: {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: 10,
    fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: '#0f172a', background: '#fafafa',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  select: {
    appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
    paddingRight: 40,
  },
  grid2:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 },
  gpsRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  coordRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  locLink: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, color: '#16a34a',
    padding: 0, fontFamily: "'DM Sans', sans-serif",
  },
  uploadZone: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    border: '1.5px dashed #cbd5e1', borderRadius: 10,
    padding: '24px 20px', cursor: 'pointer', gap: 5,
    background: '#fafafa', transition: 'all 0.2s',
  },
  uploadPrimary: { fontSize: 13, fontWeight: 600, color: '#374151' },
  uploadSub:     { fontSize: 12, color: '#94a3b8' },

  submitBtn: {
    width: '100%', padding: '13px',
    background: '#16a34a', color: '#fff',
    border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer', marginTop: 8,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s, transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 2px 8px rgba(22,163,74,0.2)',
  },
  btnSpinner: {
    display: 'inline-block', width: 15, height: 15,
    border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
  },

  successCard: {
    marginTop: 20, background: '#f0fdf4',
    border: '1px solid #bbf7d0', borderRadius: 12,
    padding: '20px 24px', animation: 'fadeUp 0.3s ease',
  },
  successHead:      { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 },
  successTitle:     { fontSize: 15, fontWeight: 700, color: '#14532d', margin: 0 },
  successSubtitle:  { fontSize: 13, color: '#166534', marginTop: 2 },
  successGrid:      { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  successItem:      { background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #dcfce7' },
  successItemLabel: { fontSize: 11, color: '#16a34a', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' },
  successItemValue: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
};
