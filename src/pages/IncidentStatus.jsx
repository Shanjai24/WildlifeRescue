import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';

export default function IncidentStatus() {
  const { role } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await api.get('/incidents');
        setItems(res.data);
      } catch (err) {
        setError('Failed to load your incidents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    if (role === 'animal_lover') load();
  }, [role]);

  if (role !== 'animal_lover') {
    return (
      <div style={s.page}>
        <div style={{ ...s.toast('error'), maxWidth: 560, margin: '60px auto' }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Access Restricted</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Only registered animal lovers can view incidents. Please login or create an account to continue.</div>
          </div>
        </div>
      </div>
    );
  }

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
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>📋</div>
          <div>
            <h1 style={s.title}>Your Incident Reports</h1>
            <p style={s.subtitle}>Track the status of your reported incidents and see rescue organization responses</p>
          </div>
        </div>
        {items.length > 0 && (
          <div style={s.totalBadge}>
            <div style={s.totalDot} />
            <span style={s.totalText}>{items.length} Total</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={s.body}>

        {error && (
          <div style={s.toast('error')}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading your incidents…</p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <div style={s.list}>
            {items.map((incident, idx) => {
              const sc = statusConfig[incident.status] ?? statusConfig.open;
              const pc = priorityColor(incident.priority);

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

                    {/* Details row */}
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

                    {/* Description */}
                    {incident.description && (
                      <div style={s.descBox}>
                        <div style={s.descLabel}>DETAILS</div>
                        <p style={s.descText}>{incident.description}</p>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={s.cardFooter}>
                      <span>Reported on {new Date(incident.createdAt || Date.now()).toLocaleDateString()}</span>
                      {incident.assignedOrganization && (
                        <span style={s.assignedTag}>🏥 {incident.assignedOrganization}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📭</div>
            <h3 style={s.emptyTitle}>No Incidents Yet</h3>
            <p style={s.emptyText}>You haven't reported any incidents. When you do, they'll appear here.</p>
            <p style={s.emptyHint}>Head to "Report Incident" to submit your first report.</p>
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
  totalBadge: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    padding: '6px 12px', borderRadius: 24, flexShrink: 0,
  },
  totalDot:  { width: 6, height: 6, borderRadius: '50%', background: '#16a34a' },
  totalText: { fontSize: 12, fontWeight: 600, color: '#16a34a' },
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
    border: '2.5px solid #e2e8f0', borderTop: '2.5px solid #16a34a',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: 12, color: '#94a3b8', margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },

  /* Card — no top border, compact */
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
    marginBottom: 8, gap: 0,
  },
  detailItem:    { flex: 1, minWidth: 70, padding: '0 10px' },
  detailLabel:   { fontSize: 10, color: '#94a3b8', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' },
  detailValue:   { fontSize: 12, fontWeight: 600, color: '#0f172a', textTransform: 'capitalize' },
  detailDivider: { width: 1, height: 24, background: '#e2e8f0', flexShrink: 0 },

  descBox: {
    background: '#f8fafc', border: '1px solid #f1f5f9',
    borderRadius: 7, padding: '8px 12px', marginBottom: 8,
  },
  descLabel: { fontSize: 10, color: '#94a3b8', fontWeight: 500, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.3px' },
  descText:  { fontSize: 12, color: '#475569', lineHeight: 1.5, margin: 0 },

  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 11, color: '#94a3b8',
    paddingTop: 8, borderTop: '1px solid #f1f5f9',
  },
  assignedTag: {
    fontSize: 11, fontWeight: 500, color: '#475569',
    background: '#f1f5f9', padding: '2px 8px', borderRadius: 20,
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