import { useState } from 'react';
import axios from 'axios';

const InjuryAssessor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [result, setResult]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const assessInjury = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/api/ai/assess-injury', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assess injury');
    } finally {
      setLoading(false);
    }
  };

  const severityStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
      case 'severe':   return { color: '#d97706', bg: '#fff7ed', border: '#fed7aa' };
      case 'moderate': return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
      default:         return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    }
  };

  const priorityColor = (p) => {
    const m = { critical: '#dc2626', high: '#ea580c', medium: '#d97706', low: '#16a34a' };
    return m[p] || '#64748b';
  };

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .upload-area-inj:hover { border-color: #c97941 !important; background: #fdf8f0 !important; }
        .assess-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* Upload */}
      {!previewUrl ? (
        <label className="upload-area-inj" style={s.uploadArea}>
          <span style={s.uploadIcon}>🩺</span>
          <span style={s.uploadText}>Upload photo to assess condition</span>
          <span style={s.uploadHint}>JPG, PNG or WEBP — max 10 MB</span>
          <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
        </label>
      ) : (
        <div style={s.previewWrap}>
          <img src={previewUrl} alt="Preview" style={s.previewImg} />
          <button
            onClick={() => { setSelectedImage(null); setPreviewUrl(null); setResult(null); }}
            style={s.removeBtn}
          >✕ Remove</button>
        </div>
      )}

      {/* Assess button */}
      {selectedImage && !result && (
        <button
          className="assess-btn"
          onClick={assessInjury}
          disabled={loading}
          style={{ ...s.assessBtn, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={s.spinner} /> Analysing..
            </span>
          ) : '🏥 Assess Condition'}
        </button>
      )}

      {/* Error */}
      {error && <div style={s.errorBox}><span>⚠️</span> {error}</div>}

      {/* Result */}
      {result?.success && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>

          {/* Severity + Priority */}
          <div style={s.resultCard}>
            <div style={s.topRow}>
              {(() => {
                const sv = severityStyle(result.severity.level);
                return (
                  <div style={{ ...s.severityBadge, color: sv.color, background: sv.bg, border: `1px solid ${sv.border}` }}>
                    {result.severity.level}
                  </div>
                );
              })()}
              <div style={s.priorityWrap}>
                <span style={s.priorityLabel}>Priority</span>
                <span style={{ ...s.priorityVal, color: priorityColor(result.priority) }}>{result.priority}</span>
              </div>
            </div>

            {/* Injury type */}
            <div style={s.injuryRow}>
              <div style={s.metaLabel}>Injury Type</div>
              <div style={s.injuryName}>{result.injury_type.type}</div>
              <div style={s.confRow}>
                <span style={s.confLabel}>Confidence</span>
                <span style={s.confPct}>{(result.injury_type.confidence * 100).toFixed(0)}%</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${result.injury_type.confidence * 100}%`, background: '#5a8a3c' }} />
              </div>
            </div>

            {/* Severity confidence */}
            <div style={s.injuryRow}>
              <div style={s.metaLabel}>Severity Certainty</div>
              <div style={s.confRow}>
                <span style={s.confLabel}>Confidence</span>
                <span style={s.confPct}>{(result.severity.confidence * 100).toFixed(1)}%</span>
              </div>
              <div style={s.barTrack}>
                <div style={{ ...s.barFill, width: `${result.severity.confidence * 100}%`, background: '#c97941' }} />
              </div>
            </div>
          </div>

          {/* Visible signs */}
          {result.visible_signs?.length > 0 && (
            <div style={s.signsCard}>
              <div style={s.recsLabel}>Observed Signs</div>
              {result.visible_signs.map((sign, i) => (
                <div key={i} style={s.recRow}>
                  <div style={{ ...s.recDot, background: '#64748b' }} />
                  <span style={s.recText}>{sign}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div style={s.recsCard}>
              <div style={s.recsLabel}>Recommendations</div>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={s.recRow}>
                  <div style={s.recDot} />
                  <span style={s.recText}>{rec}</span>
                </div>
              ))}
            </div>
          )}

          <div style={s.modelBadge}>✨ Powered by {result.model_info?.architecture}</div>
        </div>
      )}
    </div>
  );
};

export default InjuryAssessor;

const s = {
  wrap: { padding: '20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: 13, color: '#0f172a' },
  uploadArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '28px 16px', cursor: 'pointer',
    border: '1.5px dashed #e8d8c0', borderRadius: 10,
    background: '#fdfaf4', transition: 'all 0.2s', marginBottom: 14,
  },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontSize: 13, fontWeight: 600, color: '#4a4030' },
  uploadHint: { fontSize: 11, color: '#94a3b8' },
  previewWrap: { marginBottom: 12 },
  previewImg: { width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 180, border: '1px solid #e2e8f0', display: 'block' },
  removeBtn: { all: 'unset', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 6, display: 'block', textAlign: 'right' },
  assessBtn: {
    width: '100%', padding: '11px 14px',
    background: 'linear-gradient(135deg,#b06030,#c97941)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
    transition: 'opacity 0.15s,transform 0.15s', marginBottom: 14,
  },
  spinner: { display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 500, marginBottom: 12 },
  resultCard: { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 10 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  severityBadge: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'capitalize' },
  priorityWrap: { textAlign: 'right' },
  priorityLabel: { display: 'block', fontSize: 10, color: '#94a3b8', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' },
  priorityVal: { fontSize: 13, fontWeight: 700, textTransform: 'capitalize' },
  injuryRow: { marginBottom: 12 },
  metaLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 },
  injuryName: { fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6, textTransform: 'capitalize' },
  confRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  confLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },
  confPct: { fontSize: 11, fontWeight: 700, color: '#5a8a3c' },
  barTrack: { height: 5, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.8s ease' },
  signsCard: { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 10 },
  recsCard:  { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 10 },
  recsLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 },
  recRow: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  recDot: { width: 6, height: 6, borderRadius: '50%', background: '#c97941', marginTop: 4, flexShrink: 0 },
  recText: { fontSize: 12, color: '#475569', lineHeight: 1.5 },
  modelBadge: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
};