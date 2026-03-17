import React, { useState, useEffect } from 'react';
import api from '../api/client';

const ConservationDashboard = () => {
  const [impact, setImpact] = useState(null);
  const [trends, setTrends] = useState(null);
  const [biodiversity, setBiodiversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState('Tiger');
  const [region, setRegion] = useState('Central Region');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species, region]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [impactRes, trendsRes, bioRes] = await Promise.all([
        api.get('/api/analytics/impact-report'),
        api.post('/api/analytics/population-trends', { species, region }),
        api.post('/api/analytics/biodiversity', { region })
      ]);
      setImpact(impactRes.data);
      setTrends(trendsRes.data);
      setBiodiversity(bioRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !impact) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading conservation data...</p>
    </div>
  );

  const statCards = [
    {
      label: 'Wildlife Rescued',
      value: impact?.impact_metrics?.animals_rescued ?? '—',
      trend: impact?.trends?.animals_rescued_change,
      unit: '',
      icon: '🐾',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      label: 'Survival Rate',
      value: impact?.impact_metrics?.success_rate ?? '—',
      trend: impact?.trends?.success_rate_change,
      unit: '%',
      icon: '💚',
      color: '#0891b2',
      bg: '#ecfeff',
    },
    {
      label: 'Poaching Prevented',
      value: impact?.impact_metrics?.poaching_incidents_prevented ?? '—',
      unit: '',
      trend: '+12%',
      icon: '🛡️',
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      label: 'Habitat Restored',
      value: impact?.impact_metrics?.habitat_restored_hectares ?? '—',
      unit: ' ha',
      trend: '+5.4%',
      icon: '🌿',
      color: '#b45309',
      bg: '#fffbeb',
    },
  ];

  const trendPoints = trends?.trend_data ?? [];
  const maxPop = trends?.statistics?.max_population ?? 1;
  const minPop = trends?.statistics?.min_population ?? 0;
  const padding = (maxPop - minPop) * 0.1 || 50;
  const chartMax = maxPop + padding;
  const chartMin = Math.max(0, minPop - padding);
  const range = chartMax - chartMin || 1;

  // Use fixed pixel dimensions for the SVG viewBox
  const SVG_W = 600;
  const SVG_H = 160;
  const PAD_LEFT = 0;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 10;
  const innerH = SVG_H - PAD_TOP - PAD_BOTTOM;

  const svgPoints = trendPoints.map((d, i) => ({
    x: trendPoints.length > 1
      ? PAD_LEFT + (i / (trendPoints.length - 1)) * (SVG_W - PAD_LEFT)
      : SVG_W / 2,
    y: PAD_TOP + innerH - ((d.population - chartMin) / range) * innerH,
    data: d,
  }));

  const linePath = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const areaPath = svgPoints.length
    ? `${linePath} L ${svgPoints[svgPoints.length - 1].x.toFixed(2)} ${SVG_H} L ${PAD_LEFT} ${SVG_H} Z`
    : '';

  const formatTrend = (t) => {
    if (t === undefined || t === null) return null;
    if (typeof t === 'string') return { label: t, positive: !t.startsWith('-') };
    return { label: `${t > 0 ? '+' : ''}${t.toFixed(1)}%`, positive: t >= 0 };
  };

  const biodiversityHealth = biodiversity?.biodiversity_health ?? '—';
  const healthColor = {
    excellent: '#16a34a',
    good: '#65a30d',
    moderate: '#d97706',
    poor: '#dc2626',
  }[biodiversityHealth] ?? '#6b7280';

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Conservation Analytics</h1>
          <p style={styles.subtitle}>Wildlife population monitoring & ecosystem health</p>
        </div>
        <div style={styles.controls}>
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            style={styles.select}
          >
            {['Tiger', 'Elephant', 'Leopard', 'Deer'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={styles.select}
          >
            {['Central Region', 'Northern Region', 'Eastern Region', 'Wildlife Reserve'].map(r => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((card, i) => {
          const t = formatTrend(card.trend);
          return (
            <div key={i} style={{ ...styles.statCard, borderTop: `3px solid ${card.color}` }}>
              <div style={styles.statTop}>
                <span style={styles.statIcon}>{card.icon}</span>
                <span style={styles.statLabel}>{card.label}</span>
              </div>
              <div style={styles.statValue}>
                {card.value}{card.unit}
              </div>
              {t && (
                <div style={{ ...styles.statTrend, color: t.positive ? '#16a34a' : '#dc2626' }}>
                  {t.positive ? '↑' : '↓'} {t.label} vs last period
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div style={styles.chartsRow}>

        {/* Population Trend Chart */}
        <div style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>{species} Population Trend</h2>
              <p style={styles.cardMeta}>12-month rolling period · {region}</p>
            </div>
            {trends?.statistics?.trend_direction && (
              <span style={{
                ...styles.badge,
                background: trends.statistics.trend_direction === 'increasing' ? '#dcfce7' : '#fee2e2',
                color: trends.statistics.trend_direction === 'increasing' ? '#15803d' : '#b91c1c',
              }}>
                {trends.statistics.trend_direction === 'increasing' ? '↑' : '↓'} {trends.statistics.trend_direction}
              </span>
            )}
          </div>

          <div style={styles.chartArea}>
            {/* Y-axis labels */}
            <div style={styles.yAxis}>
              {[maxPop, Math.round((maxPop + minPop) / 2), minPop].map((v, i) => (
                <span key={i} style={styles.axisLabel}>{v.toLocaleString()}</span>
              ))}
            </div>

            {/* SVG Chart */}
            <div style={styles.svgWrapper}>
              <svg
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                preserveAspectRatio="xMidYMid meet"
                style={styles.svg}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {/* Grid lines at 25%, 50%, 75% */}
                {[0.25, 0.5, 0.75].map((frac, i) => {
                  const gy = PAD_TOP + innerH * (1 - frac);
                  return <line key={i} x1={PAD_LEFT} y1={gy} x2={SVG_W} y2={gy} stroke="#f1f5f9" strokeWidth="1" />;
                })}
                {areaPath && <path d={areaPath} fill="url(#areaFill)" />}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {svgPoints.map((p, i) => (
                  <rect
                    key={i}
                    x={p.x - 10}
                    y={p.y - 10}
                    width={20}
                    height={20}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>

              {/* Tooltip */}
              {hoveredPoint !== null && svgPoints[hoveredPoint] && (
                <div style={{
                  ...styles.tooltip,
                  left: `${(svgPoints[hoveredPoint].x / SVG_W) * 100}%`,
                  top: `${(svgPoints[hoveredPoint].y / SVG_H) * 100}%`,
                }}>
                  <div style={styles.tooltipMonth}>{svgPoints[hoveredPoint].data.month}</div>
                  <div style={styles.tooltipValue}>{svgPoints[hoveredPoint].data.population.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* X-axis */}
          <div style={styles.xAxis}>
            {trendPoints.filter((_, i) => i % 2 === 0 || i === trendPoints.length - 1).map((d, i) => (
              <span key={i} style={styles.axisLabel}>{d.month?.slice(5)}</span>
            ))}
          </div>

          {/* Stats Row */}
          <div style={styles.miniStatsRow}>
            {[
              { label: 'Average', value: trends?.statistics?.average_population?.toLocaleString() },
              { label: 'Peak', value: trends?.statistics?.max_population?.toLocaleString() },
              { label: 'Growth', value: trends?.statistics?.percent_change_12_months != null ? `+${trends.statistics.percent_change_12_months.toFixed(1)}%` : '—', highlight: '#16a34a' },
              { label: '3-mo Forecast', value: trends?.forecast?.[2]?.predicted_population?.toLocaleString(), highlight: '#d97706' },
            ].map((s, i) => (
              <div key={i} style={styles.miniStat}>
                <div style={styles.miniStatLabel}>{s.label}</div>
                <div style={{ ...styles.miniStatValue, color: s.highlight ?? '#0f172a' }}>{s.value ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Biodiversity Card */}
        <div style={styles.bioCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Biodiversity Index</h2>
              <p style={styles.cardMeta}>Ecosystem health · {region}</p>
            </div>
          </div>

          <div style={styles.bioScore}>
            <div style={{ ...styles.bioNumber, color: healthColor }}>
              {biodiversity?.shannon_diversity_index?.toFixed(2) ?? '—'}
            </div>
            <div style={{ ...styles.bioHealthBadge, background: healthColor + '18', color: healthColor }}>
              {biodiversityHealth}
            </div>
            <div style={styles.bioIndexLabel}>Shannon Diversity Index</div>
          </div>

          <div style={styles.divider} />

          <div style={styles.bioMetrics}>
            {[
              { label: 'Species Richness', value: biodiversity?.species_richness ?? '—' },
              { label: 'Evenness', value: biodiversity?.evenness != null ? `${(biodiversity.evenness * 100).toFixed(0)}%` : '—' },
              { label: 'Total Individuals', value: biodiversity?.total_individuals?.toLocaleString() ?? '—' },
              { label: 'Simpson Index', value: biodiversity?.simpson_diversity_index?.toFixed(3) ?? '—' },
            ].map((m, i) => (
              <div key={i} style={styles.bioMetricRow}>
                <span style={styles.bioMetricLabel}>{m.label}</span>
                <span style={styles.bioMetricValue}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomRow}>

        {/* Habitat Health */}
        <div style={styles.bottomCard}>
          <h2 style={styles.cardTitle}>Habitat Health</h2>
          <p style={styles.cardMeta}>Environmental metrics</p>

          <div style={styles.healthScoreRow}>
            <span style={styles.healthScoreLabel}>Overall Health Score</span>
            <span style={styles.healthScoreValue}>74.5</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: '74.5%' }} />
          </div>

          <div style={styles.habitatGrid}>
            {[
              { label: 'Water Quality', value: 'High', color: '#0891b2' },
              { label: 'Forest Cover', value: '65.2%', color: '#16a34a' },
              { label: 'Air Quality', value: 'Good', color: '#7c3aed' },
              { label: 'Encroachment', value: 'Moderate', color: '#d97706' },
            ].map((h, i) => (
              <div key={i} style={styles.habitatItem}>
                <span style={{ ...styles.habitatDot, background: h.color }} />
                <div>
                  <div style={styles.habitatLabel}>{h.label}</div>
                  <div style={{ ...styles.habitatValue, color: h.color }}>{h.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Achievements */}
        <div style={styles.bottomCard}>
          <h2 style={styles.cardTitle}>Key Achievements</h2>
          <p style={styles.cardMeta}>Recent milestones</p>
          <div style={styles.achievementsList}>
            {(impact?.top_achievements ?? []).map((item, i) => (
              <div key={i} style={styles.achievementItem}>
                <span style={styles.achievementCheck}>✓</span>
                <span style={styles.achievementText}>{item}</span>
              </div>
            ))}
            {(impact?.highlights ?? []).map((item, i) => (
              <div key={i} style={styles.achievementItem}>
                <span style={{ ...styles.achievementCheck, color: '#0891b2', background: '#ecfeff' }}>→</span>
                <span style={styles.achievementText}>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#0f172a',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #16a34a',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 14,
    margin: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: '4px 0 0',
  },
  controls: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#334155',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 20,
  },
  statCard: {
    background: 'white',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 15,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.5px',
    marginBottom: 6,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: 500,
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 16,
    marginBottom: 20,
  },
  chartCard: {
    background: 'white',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  bioCard: {
    background: 'white',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
  },
  cardMeta: {
    fontSize: 12,
    color: '#94a3b8',
    margin: '3px 0 0',
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    whiteSpace: 'nowrap',
  },
  chartArea: {
    display: 'flex',
    gap: 8,
    height: 220,
    marginBottom: 8,
  },
  yAxis: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingRight: 4,
    minWidth: 44,
  },
  axisLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  svgWrapper: {
    flex: 1,
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  tooltip: {
    position: 'absolute',
    transform: 'translate(-50%, -130%)',
    background: '#0f172a',
    color: 'white',
    borderRadius: 6,
    padding: '5px 9px',
    pointerEvents: 'none',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
  tooltipMonth: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: 600,
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: 52,
    marginBottom: 20,
  },
  miniStatsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    borderTop: '1px solid #f1f5f9',
    paddingTop: 16,
  },
  miniStat: {
    textAlign: 'center',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '-0.3px',
  },
  bioScore: {
    textAlign: 'center',
    padding: '16px 0 20px',
  },
  bioNumber: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-2px',
    lineHeight: 1,
    marginBottom: 10,
  },
  bioHealthBadge: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 12px',
    borderRadius: 20,
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  bioIndexLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    background: '#f1f5f9',
    marginBottom: 16,
  },
  bioMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  bioMetricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioMetricLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  bioMetricValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  bottomCard: {
    background: 'white',
    borderRadius: 12,
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  healthScoreRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '20px 0 8px',
  },
  healthScoreLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  healthScoreValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#7c3aed',
  },
  progressTrack: {
    height: 6,
    background: '#f1f5f9',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
    borderRadius: 99,
  },
  habitatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  habitatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px',
    background: '#f8fafc',
    borderRadius: 8,
  },
  habitatDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  habitatLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  habitatValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  achievementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
  },
  achievementItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  achievementCheck: {
    fontSize: 11,
    fontWeight: 700,
    color: '#16a34a',
    background: '#dcfce7',
    borderRadius: '50%',
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 1.5,
  },
};

export default ConservationDashboard;