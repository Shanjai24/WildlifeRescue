import React, { useState, useEffect } from 'react';
import api from '../api/client';

const PredictiveInsights = () => {
  const [migration, setMigration]     = useState(null);
  const [poaching, setPoaching]       = useState(null);
  const [disease, setDisease]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [region, setRegion]           = useState('Northern Region');
  const [species, setSpecies]         = useState('Deer');
  const [season, setSeason]           = useState('spring');
  const [activeId, setActiveId]       = useState(null);

  useEffect(() => { fetchAll(); }, [region, species, season]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mig, poach, dis] = await Promise.all([
        api.post('/api/analytics/migration', { species, region, season }),
        api.post('/api/analytics/poaching-hotspots', { region }),
        api.post('/api/analytics/disease-risk', { species: 'Elephant', region, currentCases: 5 }),
      ]);
      setMigration(mig.data);
      setPoaching(poach.data);
      setDisease(dis.data);
      setActiveId(null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Build unified threat list ──────────────────────────────────────────
  const buildThreats = () => {
    const list = [];

    (poaching?.hotspots ?? []).forEach((spot, i) => {
      const pct = Math.round((spot.risk_score ?? 0) * 100);
      list.push({
        id: `pch-${i}`,
        type: 'POACHING',
        urgency: spot.risk_level === 'high' ? 'CRITICAL' : spot.risk_level === 'medium' ? 'HIGH' : 'MODERATE',
        icon: '🚨',
        title: `Poaching Risk · Zone ${i + 1}`,
        summary: `${pct}% risk · ${spot.predicted_incidents} incidents forecast`,
        time: 'Next 30 days',
        detail: { kind:'poaching', score:pct, level:spot.risk_level, incidents:spot.predicted_incidents, factors:spot.factors??[], recs:poaching?.recommendations??[] },
      });
    });

    if (migration) {
      const prob = Math.round((migration.migration_probability ?? 0) * 100);
      list.push({
        id: 'mig-0', type: 'MIGRATION',
        urgency: prob > 70 ? 'HIGH' : 'MODERATE',
        icon: '🦅',
        title: `${species} Migration · ${season.charAt(0).toUpperCase()+season.slice(1)}`,
        summary: `${prob}% probability · Peak ${migration.peak_migration_period ?? '—'}`,
        time: migration.peak_migration_period ?? 'Upcoming',
        detail: { kind:'migration', prob, peak:migration.peak_migration_period, confidence:Math.round((migration.confidence??0.75)*100), routes:migration.predicted_routes??[], recs:migration.recommendations??[] },
      });
    }

    if (disease) {
      const outPct = Math.round((disease.outbreak_probability ?? 0) * 100);
      list.push({
        id: 'dis-0', type: 'DISEASE',
        urgency: disease.alert_level === 'critical' ? 'CRITICAL' : disease.alert_level === 'high' ? 'HIGH' : 'MODERATE',
        icon: '🦠',
        title: `Disease Outbreak · Elephant`,
        summary: `${outPct}% outbreak risk · ${disease.current_cases ?? 0} active cases`,
        time: '30-day outlook',
        detail: { kind:'disease', outPct, alertLevel:disease.alert_level, currentCases:disease.current_cases, forecast30:disease.predicted_cases_30_days, measures:disease.preventive_measures??[], recs:disease.recommendations??[] },
      });
    }

    const demand = Math.round(((poaching?.total_predicted_incidents??10)*2.5)+((disease?.predicted_cases_30_days??20)*0.4));
    list.push({
      id: 'rsc-0', type: 'RESCUE',
      urgency: demand > 60 ? 'HIGH' : 'MODERATE',
      icon: '🐾',
      title: `Rescue Demand Forecast`,
      summary: `~${demand} rescues predicted · ${region}`,
      time: 'Next 30 days',
      detail: {
        kind:'rescue', demand,
        breakdown:[
          { label:'Poaching-related',   val:Math.round((poaching?.total_predicted_incidents??10)*2.5) },
          { label:'Disease-related',    val:Math.round((disease?.predicted_cases_30_days??20)*0.4) },
          { label:'Habitat disruption', val:Math.round(demand*0.15) },
          { label:'Migration stress',   val:Math.round(demand*0.1) },
        ],
        recs:['Pre-position rescue teams in high-demand zones','Stock medical supplies for projected caseload','Coordinate with veterinary partners'],
      },
    });

    const order = { CRITICAL:0, HIGH:1, MODERATE:2 };
    return list.sort((a,b) => order[a.urgency]-order[b.urgency]);
  };

  const threats  = (migration || poaching || disease) ? buildThreats() : [];
  const selected = threats.find(t => t.id === activeId) ?? threats[0] ?? null;

  const urgencyConfig = {
    CRITICAL: { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', dot:'#dc2626' },
    HIGH:     { color:'#d97706', bg:'#fffbeb', border:'#fde68a', dot:'#d97706' },
    MODERATE: { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', dot:'#2563eb' },
  };
  const typeColor = { POACHING:'#dc2626', MIGRATION:'#16a34a', DISEASE:'#d97706', RESCUE:'#2563eb' };

  if (loading && !migration) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16, background:'#f8fafc' }}>
      <div style={{ width:36, height:36, border:'3px solid #e2e8f0', borderTop:'3px solid #16a34a', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#64748b', fontSize:13, margin:0 }}>Loading threat data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        @keyframes spin  { to { transform:rotate(360deg) } }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .trow:hover { background:#f1f5f9 !important; }
        select option { background:#fff; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.liveDot} />
          <div>
            <h1 style={s.title}>Threat Intelligence</h1>
            <p style={s.subtitle}>30-day predictive forecast · {region}</p>
          </div>
        </div>
        <div style={s.controls}>
          {[
            { label:'Species', val:species, set:setSpecies, opts:['Deer','Elephant','Tiger','Leopard'] },
            { label:'Season',  val:season,  set:setSeason,  opts:['spring','summer','fall','winter'] },
            { label:'Region',  val:region,  set:setRegion,
              opts:['Northern Region','Eastern Region','Wildlife Reserve','Southern Region'] },
          ].map((ctrl,i) => (
            <div key={i} style={s.ctrl}>
              <span style={s.ctrlLabel}>{ctrl.label}</span>
              <select value={ctrl.val} onChange={e=>ctrl.set(e.target.value)} style={s.select}>
                {ctrl.opts.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body}>

        {/* ── LEFT: Feed ── */}
        <div style={s.feedCol}>
          <div style={s.feedHead}>
            <span style={s.feedHeadLabel}>Active threats</span>
            <span style={s.feedCount}>{threats.length} signals</span>
          </div>
          {threats.map((t, i) => {
            const uc  = urgencyConfig[t.urgency] ?? urgencyConfig.MODERATE;
            const tc  = typeColor[t.type] ?? '#64748b';
            const active = selected?.id === t.id;
            return (
              <div
                key={t.id}
                className="trow"
                onClick={() => setActiveId(t.id)}
                style={{
                  ...s.trow,
                  background: active ? '#f8fafc' : '#fff',
                  borderLeft: `3px solid ${active ? tc : 'transparent'}`,
                  animationDelay:`${i*0.07}s`,
                }}
              >
                <div style={s.trowTop}>
                  <span style={s.trowIcon}>{t.icon}</span>
                  <div style={s.trowMid}>
                    <div style={{ ...s.trowTitle, color: active ? tc : '#0f172a' }}>{t.title}</div>
                    <div style={s.trowSummary}>{t.summary}</div>
                  </div>
                  <div style={s.trowRight}>
                    <span style={{ ...s.urgencyBadge, color:uc.color, background:uc.bg, border:`1px solid ${uc.border}` }}>
                      {t.urgency}
                    </span>
                    <span style={{ ...s.typeBadge, color: tc }}>{t.type}</span>
                  </div>
                </div>
                <div style={{ ...s.trowTime, color: active ? tc : '#94a3b8' }}>⏱ {t.time}</div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: Detail ── */}
        <div style={s.detailCol}>
          {selected
            ? <Detail threat={selected} urgencyConfig={urgencyConfig} typeColor={typeColor} />
            : (
              <div style={s.empty}>
                <span style={{ fontSize:40 }}>📡</span>
                <span style={{ fontSize:13, color:'#94a3b8' }}>Select a threat to view details</span>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

// ── Detail panel ───────────────────────────────────────────────────────────
const Detail = ({ threat, urgencyConfig, typeColor }) => {
  const { detail } = threat;
  const uc = urgencyConfig[threat.urgency] ?? urgencyConfig.MODERATE;
  const tc = typeColor[threat.type] ?? '#64748b';

  return (
    <div style={dt.wrap}>
      {/* Head */}
      <div style={dt.head}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ ...dt.iconBox, background: tc+'15', color: tc }}>{threat.icon}</div>
          <div>
            <div style={dt.headTitle}>{threat.title}</div>
            <div style={dt.headSub}>{threat.time}</div>
          </div>
        </div>
        <span style={{ ...dt.urgencyTag, color:uc.color, background:uc.bg, border:`1px solid ${uc.border}` }}>
          {threat.urgency}
        </span>
      </div>

      <div style={dt.divider} />

      {/* ── POACHING ── */}
      {detail.kind === 'poaching' && <>
        <div style={dt.metrics}>
          <Metric label="Risk Score"        value={`${detail.score}%`} color={tc} />
          <Metric label="Incidents Forecast" value={detail.incidents}  color='#0f172a' />
          <Metric label="Risk Level"         value={detail.level}      color={tc} caps />
        </div>

        <Section label="Threat intensity">
          <div style={dt.bigTrack}>
            <div style={{ ...dt.bigFill, width:`${detail.score}%`, background:`linear-gradient(90deg,${tc}55,${tc})` }} />
          </div>
        </Section>

        <Section label="Contributing factors">
          <div style={dt.factorGrid}>
            {detail.factors.map((f,i)=>(
              <div key={i} style={dt.factorPill}>
                <div style={{ ...dt.factorDot, background:tc }} />
                <span style={dt.factorText}>{f.replace(/_/g,' ')}</span>
              </div>
            ))}
          </div>
        </Section>

        <Recs recs={detail.recs} color={tc} />
      </>}

      {/* ── MIGRATION ── */}
      {detail.kind === 'migration' && <>
        <div style={dt.metrics}>
          <Metric label="Probability"  value={`${detail.prob}%`}      color={tc} />
          <Metric label="Peak Period"  value={detail.peak ?? '—'}     color='#0f172a' small />
          <Metric label="Confidence"   value={`${detail.confidence}%`} color='#0f172a' />
        </div>

        <Section label="Migration corridors">
          <div style={dt.corridorBox}>
            <svg viewBox="0 0 340 110" style={{ width:'100%', height:110 }}>
              <defs>
                <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0,8 3,0 6" fill={tc} />
                </marker>
              </defs>
              {/* terrain blobs */}
              <ellipse cx="55"  cy="55" rx="38" ry="28" fill={tc+'12'} stroke={tc+'30'} strokeWidth="1"/>
              <ellipse cx="175" cy="38" rx="32" ry="22" fill={tc+'12'} stroke={tc+'30'} strokeWidth="1"/>
              <ellipse cx="290" cy="68" rx="36" ry="26" fill={tc+'12'} stroke={tc+'30'} strokeWidth="1"/>
              {/* labels */}
              <text x="55"  y="59" textAnchor="middle" style={{ fontSize:8, fill:tc, fontWeight:600, fontFamily:'DM Sans,sans-serif' }}>Origin</text>
              <text x="175" y="42" textAnchor="middle" style={{ fontSize:8, fill:tc, fontWeight:600, fontFamily:'DM Sans,sans-serif' }}>Corridor</text>
              <text x="290" y="72" textAnchor="middle" style={{ fontSize:8, fill:tc, fontWeight:600, fontFamily:'DM Sans,sans-serif' }}>Destination</text>
              {(detail.routes).map((route, i) => {
                const y1 = 55 + (i===0?-10:10);
                const y2 = 68 + (i===0?-8:8);
                const prob = Math.round((route.probability??0)*100);
                return (
                  <g key={i}>
                    <path
                      d={`M 93 ${y1} Q 175 ${i===0?20:85} 254 ${y2}`}
                      fill="none" stroke={tc}
                      strokeWidth={i===0?2.5:1.5}
                      strokeDasharray={i===0?'':'5,4'}
                      strokeOpacity={i===0?0.9:0.5}
                      markerEnd="url(#arr)"
                    />
                    <text x="173" y={i===0?30:100} textAnchor="middle"
                      style={{ fontSize:9, fill:tc, fontFamily:'JetBrains Mono,monospace', fontWeight:600 }}>
                      {prob}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Section>

        <Section label="Predicted routes">
          {detail.routes.map((r,i)=>(
            <div key={i} style={dt.routeRow}>
              <span style={dt.routeNode}>{r.from}</span>
              <span style={dt.routeArrow}>──▶</span>
              <span style={dt.routeNode}>{r.to}</span>
              <div style={dt.routeTrack}>
                <div style={{ ...dt.routeFill, width:`${(r.probability??0)*100}%`, background:tc }} />
              </div>
              <span style={{ ...dt.routePct, color:tc }}>{((r.probability??0)*100).toFixed(0)}%</span>
            </div>
          ))}
        </Section>

        <Recs recs={detail.recs} color={tc} />
      </>}

      {/* ── DISEASE ── */}
      {detail.kind === 'disease' && <>
        <div style={dt.metrics}>
          <Metric label="Outbreak Risk"    value={`${detail.outPct}%`}     color={tc} />
          <Metric label="Active Cases"     value={detail.currentCases??'—'} color='#0f172a' />
          <Metric label="30-Day Forecast"  value={detail.forecast30??'—'}   color={tc} />
        </div>

        <Section label="Spread projection — next 4 weeks">
          <div style={dt.spreadBox}>
            <svg viewBox="0 0 340 90" style={{ width:'100%', height:90 }}>
              <defs>
                <radialGradient id="sg">
                  <stop offset="0%"   stopColor={tc} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={tc} stopOpacity="0"/>
                </radialGradient>
              </defs>
              <line x1="20" y1="72" x2="320" y2="72" stroke="#e2e8f0" strokeWidth="1"/>
              {['Now','Wk 1','Wk 2','Wk 3','Wk 4'].map((lbl,i)=>(
                <text key={i} x={20+i*75} y="84" style={{ fontSize:8, fill:'#94a3b8', fontFamily:'JetBrains Mono,monospace' }}>{lbl}</text>
              ))}
              {[0,1,2,3,4].map(i=>{
                const cx = 20+i*75;
                const r  = 5 + i*(detail.outPct/22);
                return (
                  <g key={i}>
                    <circle cx={cx} cy={72-r*0.6} r={r*1.8} fill="url(#sg)"/>
                    <circle cx={cx} cy={72-r*0.6} r={4}     fill={tc} opacity={0.6+i*0.08}/>
                  </g>
                );
              })}
            </svg>
          </div>
        </Section>

        <Section label="Preventive measures">
          {detail.measures.map((m,i)=>(
            <div key={i} style={dt.measureRow}>
              <div style={{ ...dt.measureNum, color:tc, background:tc+'15' }}>{i+1}</div>
              <span style={dt.measureText}>{m}</span>
            </div>
          ))}
        </Section>

        <Recs recs={detail.recs} color={tc} />
      </>}

      {/* ── RESCUE DEMAND ── */}
      {detail.kind === 'rescue' && <>
        <div style={dt.metrics}>
          <Metric label="Predicted Rescues" value={detail.demand} color={tc} large />
          <Metric label="Timeframe"         value="30 Days"       color='#0f172a' small />
        </div>

        <Section label="Demand breakdown">
          {detail.breakdown.map((b,i)=>(
            <div key={i} style={dt.breakRow}>
              <span style={dt.breakLabel}>{b.label}</span>
              <div style={dt.breakTrack}>
                <div style={{ ...dt.breakFill, width:`${Math.round((b.val/detail.demand)*100)}%`, background:tc }} />
              </div>
              <span style={{ ...dt.breakVal, color:tc }}>{b.val}</span>
            </div>
          ))}
        </Section>

        <Recs recs={detail.recs} color={tc} />
      </>}
    </div>
  );
};

// ── Shared sub-components ──────────────────────────────────────────────────
const Metric = ({ label, value, color, caps, small, large }) => (
  <div style={dt.metricBox}>
    <div style={dt.metricLabel}>{label}</div>
    <div style={{ ...dt.metricVal, color, fontSize: large?28:small?14:22, textTransform: caps?'capitalize':'none' }}>{value}</div>
  </div>
);

const Section = ({ label, children }) => (
  <div style={{ marginTop:22 }}>
    <div style={dt.sectionLabel}>{label}</div>
    {children}
  </div>
);

const Recs = ({ recs, color }) => (
  <Section label="Recommended actions">
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {recs.slice(0,4).map((r,i)=>(
        <div key={i} style={dt.recRow}>
          <div style={{ ...dt.recNum, color, background:color+'15' }}>{i+1}</div>
          <span style={dt.recText}>{r}</span>
        </div>
      ))}
    </div>
  </Section>
);

// ── Style objects ──────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight:'100vh', background:'#f8fafc',
    fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif",
    color:'#0f172a', display:'flex', flexDirection:'column',
  },
  header: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'20px 28px', background:'#fff',
    borderBottom:'1px solid #e2e8f0',
    flexWrap:'wrap', gap:12,
  },
  headerLeft: { display:'flex', alignItems:'center', gap:14 },
  liveDot: {
    width:10, height:10, borderRadius:'50%', background:'#16a34a',
    boxShadow:'0 0 0 3px #dcfce7', animation:'pulse 2s ease-in-out infinite',
  },
  title:    { fontSize:18, fontWeight:700, color:'#0f172a', margin:0, letterSpacing:'-0.4px' },
  subtitle: { fontSize:12, color:'#94a3b8', margin:'2px 0 0' },
  controls: { display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end' },
  ctrl:     { display:'flex', flexDirection:'column', gap:3 },
  ctrlLabel:{ fontSize:10, color:'#94a3b8', letterSpacing:1, textTransform:'uppercase' },
  select: {
    background:'#fff', border:'1px solid #e2e8f0', color:'#334155',
    fontSize:13, padding:'7px 12px', borderRadius:8,
    cursor:'pointer', outline:'none',
    fontFamily:"'DM Sans', sans-serif",
  },
  body: {
    display:'grid', gridTemplateColumns:'320px 1fr',
    flex:1, minHeight:0,
  },
  feedCol: {
    borderRight:'1px solid #e2e8f0', background:'#fff',
    display:'flex', flexDirection:'column', overflowY:'auto',
  },
  feedHead: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'12px 20px', borderBottom:'1px solid #f1f5f9',
    position:'sticky', top:0, background:'#fff', zIndex:2,
  },
  feedHeadLabel: { fontSize:11, fontWeight:600, letterSpacing:0.3, color:'#94a3b8' },
  feedCount:     { fontSize:11, color:'#cbd5e1' },
  trow: {
    padding:'14px 18px', borderBottom:'1px solid #f8fafc',
    cursor:'pointer', transition:'background 0.12s',
    animation:'fadeUp 0.3s ease both',
    borderLeft:'3px solid transparent',
  },
  trowTop:    { display:'flex', alignItems:'flex-start', gap:10 },
  trowIcon:   { fontSize:18, flexShrink:0, marginTop:1 },
  trowMid:    { flex:1, minWidth:0 },
  trowTitle:  { fontSize:14, fontWeight:600, lineHeight:1.3 },
  trowSummary:{ fontSize:12, color:'#94a3b8', marginTop:3, lineHeight:1.4 },
  trowRight:  { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, flexShrink:0 },
  urgencyBadge:{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:4, letterSpacing:0.2 },
  typeBadge:   { fontSize:10, fontWeight:600, letterSpacing:0.2, color:'#64748b' },
  trowTime:    { fontSize:11, marginTop:8, paddingLeft:28, color:'#94a3b8' },
  detailCol:   { overflowY:'auto', background:'#f8fafc' },
  empty: {
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', height:'100%', gap:12,
  },
};

const dt = {
  wrap: { padding:'28px 32px', animation:'fadeUp 0.2s ease both' },
  head: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' },
  iconBox: {
    width:48, height:48, borderRadius:12,
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
  },
  headTitle: { fontSize:16, fontWeight:700, color:'#0f172a', lineHeight:1.2 },
  headSub:   { fontSize:12, color:'#94a3b8', marginTop:4 },
  urgencyTag:{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:6, letterSpacing:0.2 },
  divider:   { height:1, background:'#f1f5f9', margin:'18px 0' },
  metrics:   { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 },
  metricBox: { background:'#fff', borderRadius:10, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  metricLabel:{ fontSize:12, color:'#94a3b8', fontWeight:500, marginBottom:6 },
  metricVal:  { fontWeight:700, letterSpacing:-0.5, lineHeight:1 },
  sectionLabel:{ fontSize:13, fontWeight:600, color:'#334155', marginBottom:12 },
  bigTrack:  { height:12, background:'#f1f5f9', borderRadius:8, overflow:'hidden' },
  bigFill:   { height:'100%', borderRadius:8, transition:'width 0.5s ease' },
  factorGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 },
  factorPill:{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' },
  factorDot: { width:7, height:7, borderRadius:'50%', flexShrink:0 },
  factorText:{ fontSize:12, color:'#475569', textTransform:'capitalize' },
  corridorBox:{ background:'#fff', borderRadius:10, padding:'12px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  spreadBox:  { background:'#fff', borderRadius:10, padding:'12px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  routeRow:  { display:'flex', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #f8fafc' },
  routeNode: { fontSize:12, color:'#475569', whiteSpace:'nowrap' },
  routeArrow:{ color:'#cbd5e1', margin:'0 8px', fontSize:12 },
  routeTrack:{ flex:1, margin:'0 12px', height:4, background:'#f1f5f9', borderRadius:2, overflow:'hidden' },
  routeFill: { height:'100%', borderRadius:2 },
  routePct:  { fontSize:13, fontWeight:700, minWidth:32, textAlign:'right', color:'#334155' },
  measureRow:{ display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  measureNum:{ width:24, height:24, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 },
  measureText:{ fontSize:13, color:'#64748b', lineHeight:1.5 },
  breakRow:  { display:'flex', alignItems:'center', marginBottom:10 },
  breakLabel:{ fontSize:13, color:'#64748b', minWidth:150 },
  breakTrack:{ flex:1, margin:'0 12px', height:6, background:'#f1f5f9', borderRadius:3, overflow:'hidden' },
  breakFill: { height:'100%', borderRadius:3 },
  breakVal:  { fontSize:14, fontWeight:700, minWidth:28, textAlign:'right' },
  recRow:    { display:'flex', alignItems:'flex-start', gap:10 },
  recNum:    { width:24, height:24, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 },
  recText:   { fontSize:13, color:'#64748b', lineHeight:1.5, paddingTop:3 },
};

export default PredictiveInsights;