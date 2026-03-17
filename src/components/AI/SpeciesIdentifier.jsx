import { useState } from 'react';
import axios from 'axios';

const SpeciesIdentifier = ({ onSpeciesIdentified }) => {
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

  const identifySpecies = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/api/ai/identify-species', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      
      // Pass results back to parent form
      if (response.data.success && onSpeciesIdentified) {
        onSpeciesIdentified({
          species: response.data.top_prediction.species,
          scientificName: response.data.top_prediction.scientific_name,
          confidence: response.data.top_prediction.confidence,
          conservationStatus: response.data.top_prediction.conservation_status,
          image: selectedImage,
          previewUrl: previewUrl
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to identify species');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = (status) => {
    if (['Endangered', 'Critically Endangered'].includes(status))
      return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    if (['Vulnerable', 'Near Threatened'].includes(status))
      return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
  };

  return (
    <div style={s.wrap}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .upload-area:hover  { border-color: #5a8a3c !important; background: #f4f8f0 !important; }
        .analyze-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* Upload */}
      {!previewUrl ? (
        <label className="upload-area" style={s.uploadArea}>
          <span style={s.uploadIcon}>📸</span>
          <span style={s.uploadText}>Upload photo to identify species</span>
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

      {/* Identify button */}
      {selectedImage && !result && (
        <button
          className="analyze-btn"
          onClick={identifySpecies}
          disabled={loading}
          style={{ ...s.analyzeBtn, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={s.spinner} /> Analysing..
            </span>
          ) : '🔍 Identify Species'}
        </button>
      )}

      {/* Error */}
      {error && <div style={s.errorBox}><span>⚠️</span> {error}</div>}

      {/* Result */}
      {result?.success && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          {result.is_animal === false && (
            <div style={s.noticeBox}>ℹ️ No animal detected in this image.</div>
          )}

          <div style={s.resultCard}>
            <div style={s.resultRow}>
              <div>
                <div style={s.speciesName}>{result.top_prediction.species}</div>
                <div style={s.sciName}>{result.top_prediction.scientific_name}</div>
              </div>
              {(() => {
                const sc = statusColors(result.top_prediction.conservation_status);
                return (
                  <div style={{ ...s.statusBadge, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {result.top_prediction.conservation_status}
                  </div>
                );
              })()}
            </div>

            <div style={s.confRow}>
              <span style={s.confLabel}>Confidence</span>
              <span style={s.confPct}>{(result.top_prediction.confidence * 100).toFixed(1)}%</span>
            </div>
            <div style={s.barTrack}>
              <div style={{ ...s.barFill, width: `${result.top_prediction.confidence * 100}%`, background: '#5a8a3c' }} />
            </div>
          </div>

          {result.notes && <div style={s.notesBox}>💬 {result.notes}</div>}

          {result.all_predictions?.length > 1 && (
            <div style={s.altSection}>
              <div style={s.altLabel}>Other possibilities</div>
              {result.all_predictions.slice(1, 5).map((pred, i) => (
                <div key={i} style={s.altRow}>
                  <div>
                    <span style={s.altName}>{pred.species}</span>
                    {pred.scientific_name && pred.scientific_name !== 'Unknown' && (
                      <span style={s.altSci}> · {pred.scientific_name}</span>
                    )}
                  </div>
                  <span style={s.altPct}>{(pred.confidence * 100).toFixed(1)}%</span>
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

export default SpeciesIdentifier;

const s = {
  wrap: { padding: '20px', fontFamily: "'DM Sans','Helvetica Neue',sans-serif", fontSize: 13, color: '#0f172a' },
  uploadArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '28px 16px', cursor: 'pointer',
    border: '1.5px dashed #d0c8b8', borderRadius: 10,
    background: '#fdfaf4', transition: 'all 0.2s', marginBottom: 14,
  },
  uploadIcon: { fontSize: 24 },
  uploadText: { fontSize: 13, fontWeight: 600, color: '#4a4030' },
  uploadHint: { fontSize: 11, color: '#94a3b8' },
  previewWrap: { marginBottom: 12 },
  previewImg: { width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 180, border: '1px solid #e2e8f0', display: 'block' },
  removeBtn: { all: 'unset', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 6, display: 'block', textAlign: 'right' },
  analyzeBtn: {
    width: '100%', padding: '11px 14px',
    background: 'linear-gradient(135deg,#4a7a2c,#5a8a3c)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
    transition: 'opacity 0.15s,transform 0.15s', marginBottom: 14,
  },
  spinner: { display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 12px', fontSize: 12, fontWeight: 500, marginBottom: 12 },
  noticeBox: { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 10 },
  notesBox:  { background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 10 },
  resultCard: { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: 10 },
  resultRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  speciesName: { fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 3 },
  sciName: { fontSize: 11, color: '#64748b', fontStyle: 'italic' },
  statusBadge: { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 },
  confRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  confLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },
  confPct: { fontSize: 11, fontWeight: 700, color: '#5a8a3c' },
  barTrack: { height: 5, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.8s ease' },
  altSection: { background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 10 },
  altLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 },
  altRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f1f5f9' },
  altName: { fontSize: 12, fontWeight: 500, color: '#475569' },
  altSci:  { fontSize: 11, color: '#94a3b8', fontStyle: 'italic' },
  altPct:  { fontSize: 12, fontWeight: 600, color: '#64748b' },
  modelBadge: { fontSize: 10, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
};