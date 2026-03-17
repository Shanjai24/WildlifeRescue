import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function RescuerDashboard() {
  const { role, organization } = useAuth();
  const [alerts, setAlerts]         = useState([]);
  const [error, setError]           = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get('/rescuer/alerts');
        setAlerts(res.data);
      } catch (err) {
        setError('Failed to load alerts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (role === 'rescuer' && organization?.verificationStatus === 'verified') {
      load();
    }
  }, [role, organization]);

  const accept = async (id) => {
    setError(null); setSuccessMsg(null); setProcessingId(id);
    try {
      const res = await api.post(`/rescuer/${id}/accept`);
      setSuccessMsg(`Incident #${res.data.id} accepted successfully.`);
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch {
      setError('Failed to accept incident. Please try again.');
    } finally { setProcessingId(null); }
  };

  const updateStatus = async (id, status) => {
    setError(null); setSuccessMsg(null); setProcessingId(id);
    try {
      await api.post(`/rescuer/${id}/status`, { status });
      const label = { in_progress: 'In Progress', completed: 'Completed' }[status] || status;
      setSuccessMsg(`Incident #${id} updated to ${label}.`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      setError('Failed to update status. Please try again.');
    } finally { setProcessingId(null); }
  };

  const animalEmoji = cat => ({ dog: '🐕', cat: '🐈', bird: '🦅', wildlife: '🦁', other: '🐾' }[cat] ?? '🐾');

  const statusConfig = {
    open:        { label: 'Open',        color: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
    accepted:    { label: 'Accepted',    color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
    in_progress: { label: 'In Progress', color: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
    completed:   { label: 'Completed',   color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  };

  const priorityColor = p => ({
    critical: '#dc2626', high: '#d97706', medium: '#2563eb', low: '#16a34a'
  }[p?.toLowerCase()] ?? '#64748b');

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .inc-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .action-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>🚑</div>
          <div>
            <h1 style={s.title}>Rescuer Hub</h1>
            <p style={s.subtitle}>{organization?.name || 'Rescue Organization'}</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <div style={s.activeBadge}>
            <div style={s.activeDot} />
            <span style={s.activeText}>{alerts.length} Active</span>
          </div>
        )}
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* Toasts */}
        {successMsg && (
          <div style={s.toast('success')}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div style={s.toast('error')}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading rescue alerts…</p>
          </div>
        )}

        {/* Cards */}
        {!isLoading && alerts.length > 0 && (
          <div style={s.list}>
            {alerts.map((incident, idx) => {
              const sc = statusConfig[incident.status] ?? statusConfig.open;
              const pc = priorityColor(incident.priority);
              const isProcessing = processingId === incident.id;

              return (
                <div
                  key={incident.id}
                  className="inc-card"
                  style={{ ...s.card, animationDelay: `${idx * 0.07}s` }}
                >
                  <div style={s.cardInner}>

                    {/* Card Header */}
                    <div style={s.cardHead}>
                      <div style={s.cardHeadLeft}>
                        <div style={s.animalIconWrap}>
                          <span style={{ fontSize: 18 }}>{animalEmoji(incident.animalCategory)}</span>
                        </div>
                        <div>
                          <div style={s.incidentTitle}>Incident #{incident.id}</div>
                          <div style={s.incidentLocation}>
                            📍 {incident.addressText || 'Location not provided'}
                          </div>
                        </div>
                      </div>
                      <div style={s.cardHeadRight}>
                        <div style={{ ...s.statusPill, color: sc.color, background: sc.bg }}>
                          <div style={{ ...s.statusDot, background: sc.dot }} />
                          {sc.label}
                        </div>
                        <PriorityBadge value={incident.priority} />
                      </div>
                    </div>

                    {/* Details row: Animal Type / Incident Type / Priority */}
                    <div style={s.detailsRow}>
                      <div style={s.detailItem}>
                        <div style={s.detailLabel}>ANIMAL TYPE</div>
                        <div style={s.detailValue}>{incident.animalCategory}</div>
                      </div>
                      <div style={s.detailDivider} />
                      <div style={s.detailItem}>
                        <div style={s.detailLabel}>INCIDENT TYPE</div>
                        <div style={s.detailValue}>{incident.incidentType}</div>
                      </div>
                      <div style={s.detailDivider} />
                      <div style={s.detailItem}>
                        <div style={s.detailLabel}>PRIORITY</div>
                        <div style={{ ...s.detailValue, color: pc }}>{incident.priority}</div>
                      </div>
                    </div>

                    {/* GPS Coordinates */}
                    {incident.latitude && incident.longitude && (
                      <div style={s.coordBox}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>🗺️</span>
                        <div>
                          <div style={s.detailLabel}>GPS COORDINATES</div>
                          <div style={s.coordValue}>
                            {parseFloat(incident.latitude).toFixed(6)},&nbsp;
                            {parseFloat(incident.longitude).toFixed(6)}
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          style={s.mapsLink}
                        >
                          Open in Maps →
                        </a>
                      </div>
                    )}

                    {/* Incident Details / Description */}
                    {incident.description && (
                      <div style={s.descBox}>
                        <div style={s.descLabel}>INCIDENT DETAILS</div>
                        <p style={s.descText}>{incident.description}</p>
                      </div>
                    )}

                    {/* Footer: date + action buttons */}
                    <div style={s.cardFooter}>
                      <span style={s.footerDate}>
                        Reported {new Date(incident.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <div style={s.actions}>
                        {incident.status === 'open' && (
                          <button
                            className="action-btn"
                            onClick={() => accept(incident.id)}
                            disabled={isProcessing}
                            style={{ ...s.btn, background: '#16a34a', color: '#fff', opacity: isProcessing ? 0.6 : 1 }}
                          >
                            {isProcessing ? 'Processing…' : '✓ Accept'}
                          </button>
                        )}
                        {incident.status === 'accepted' && (
                          <button
                            className="action-btn"
                            onClick={() => updateStatus(incident.id, 'in_progress')}
                            disabled={isProcessing}
                            style={{ ...s.btn, background: '#2563eb', color: '#fff', opacity: isProcessing ? 0.6 : 1 }}
                          >
                            {isProcessing ? 'Processing…' : '🚗 In Progress'}
                          </button>
                        )}
                        {incident.status === 'in_progress' && (
                          <button
                            className="action-btn"
                            onClick={() => updateStatus(incident.id, 'completed')}
                            disabled={isProcessing}
                            style={{ ...s.btn, background: '#16a34a', color: '#fff', opacity: isProcessing ? 0.6 : 1 }}
                          >
                            {isProcessing ? 'Processing…' : '✅ Complete'}
                          </button>
                        )}
                        {incident.status === 'completed' && (
                          <div style={s.completedTag}>✅ Completed</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && alerts.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h3 style={s.emptyTitle}>No Active Alerts</h3>
            <p style={s.emptyText}>There are currently no rescue incidents that need your attention.</p>
            <p style={s.emptyHint}>Check back soon for new incident reports.</p>
          </div>
        )}

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
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 48px 0',
    maxWidth: 960, margin: '0 auto', width: '100%',
    boxSizing: 'border-box',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 11,
    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
    flexShrink: 0,
  },
  title:    { fontSize: 19, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' },
  subtitle: { fontSize: 12, color: '#94a3b8', margin: '2px 0 0' },
  activeBadge: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: '#fef2f2', border: '1px solid #fecaca',
    padding: '6px 12px', borderRadius: 24, flexShrink: 0,
  },
  activeDot:  { width: 6, height: 6, borderRadius: '50%', background: '#dc2626' },
  activeText: { fontSize: 12, fontWeight: 600, color: '#dc2626' },
  body: {
    maxWidth: 960, margin: '0 auto',
    padding: '16px 48px 48px',
    boxSizing: 'border-box',
  },
  toast: type => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 9, marginBottom: 14,
    fontSize: 13, fontWeight: 500,
    background: type === 'success' ? '#f0fdf4' : '#fef2f2',
    border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
    color: type === 'success' ? '#15803d' : '#dc2626',
  }),
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 10 },
  spinner: {
    width: 26, height: 26,
    border: '2.5px solid #e2e8f0', borderTop: '2.5px solid #dc2626',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: 12, color: '#94a3b8', margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    background: '#fff', borderRadius: 11,
    border: '1px solid #e8edf2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
    animation: 'fadeUp 0.3s ease both',
  },
  cardInner: { padding: '14px 18px' },
  cardHead: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  cardHeadLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  animalIconWrap: {
    width: 34, height: 34, borderRadius: 8,
    background: '#f8fafc', border: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  incidentTitle:    { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  incidentLocation: { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  cardHeadRight: { display: 'flex', alignItems: 'center', gap: 7 },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: '50%' },
  detailsRow: {
    display: 'flex', alignItems: 'center',
    background: '#f8fafc', borderRadius: 8, padding: '9px 12px',
    marginBottom: 8,
  },
  detailItem:    { flex: 1, minWidth: 70, padding: '0 10px' },
  detailLabel:   { fontSize: 10, color: '#94a3b8', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' },
  detailValue:   { fontSize: 12, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' },
  detailDivider: { width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 },
  coordBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#f0f9ff', border: '1px solid #bae6fd',
    borderRadius: 7, padding: '8px 12px', marginBottom: 8,
  },
  coordValue: { fontSize: 12, fontWeight: 600, color: '#0369a1', fontFamily: 'monospace' },
  mapsLink: {
    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
    color: '#0369a1', textDecoration: 'none', flexShrink: 0,
  },
  descBox: {
    background: '#f8fafc', border: '1px solid #f1f5f9',
    borderRadius: 7, padding: '8px 12px', marginBottom: 8,
  },
  descLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' },
  descText:  { fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, borderTop: '1px solid #f1f5f9',
  },
  footerDate: { fontSize: 11, color: '#94a3b8' },
  actions:    { display: 'flex', gap: 7, flexWrap: 'wrap' },
  btn: {
    padding: '6px 13px', borderRadius: 7, fontSize: 12,
    fontWeight: 600, border: 'none', cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  },
  completedTag: {
    fontSize: 11, fontWeight: 600, color: '#16a34a',
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    padding: '5px 10px', borderRadius: 7,
  },
  empty: {
    background: '#fff', borderRadius: 11,
    padding: '44px 40px', textAlign: 'center',
    border: '1px solid #e8edf2',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  emptyIcon:  { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' },
  emptyText:  { fontSize: 13, color: '#64748b', margin: '0 0 4px' },
  emptyHint:  { fontSize: 12, color: '#94a3b8', margin: 0 },
};