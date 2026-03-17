import { Router } from 'express';

const router = Router();

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

router.get('/impact-report', (req, res) => {
  res.json({
    impact_metrics: {
      animals_rescued: 1247,
      success_rate: 87.3,
      poaching_incidents_prevented: 34,
      habitat_restored_hectares: 156.8,
    },
    trends: {
      animals_rescued_change: 12.5,
      success_rate_change: 3.2,
    },
    top_achievements: [
      'Successfully relocated 23 endangered elephants to protected corridor',
      'Established 3 new wildlife monitoring stations in Eastern Region',
      'Reduced average rescue response time by 28%',
      'Partnered with 12 new veterinary clinics for emergency care',
    ],
    highlights: [
      'AI-assisted priority triage now handles 94% of incoming reports',
      'Community reporting increased 45% year-over-year',
      'Cross-region coordination protocol launched in Northern Region',
    ],
  });
});

router.post('/population-trends', (req, res) => {
  const { species = 'Tiger', region = 'Central Region' } = req.body;
  const seed = hash(`${species}-${region}`);

  const basePop = {
    Tiger: 320, Elephant: 1450, Leopard: 210, Deer: 4800,
  }[species] ?? 500;

  const months = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2025, i, 1);
    const month = date.toISOString().slice(0, 7);
    const drift = seededRandom(seed + i) * 0.12 - 0.04;
    const pop = Math.round(basePop * (1 + drift + i * 0.008));
    months.push({ month, population: pop });
  }

  const pops = months.map(m => m.population);
  const avg = Math.round(pops.reduce((a, b) => a + b, 0) / pops.length);
  const maxPop = Math.max(...pops);
  const minPop = Math.min(...pops);
  const pctChange = ((pops[11] - pops[0]) / pops[0]) * 100;

  res.json({
    species,
    region,
    trend_data: months,
    statistics: {
      average_population: avg,
      max_population: maxPop,
      min_population: minPop,
      trend_direction: pctChange >= 0 ? 'increasing' : 'decreasing',
      percent_change_12_months: Math.round(pctChange * 10) / 10,
    },
    forecast: [1, 2, 3].map(i => ({
      month: new Date(2026, i - 1, 1).toISOString().slice(0, 7),
      predicted_population: Math.round(pops[11] * (1 + i * 0.012)),
    })),
  });
});

router.post('/biodiversity', (req, res) => {
  const { region = 'Central Region' } = req.body;
  const seed = hash(region);
  const shannon = 2.5 + seededRandom(seed) * 1.5;
  const simpson = 0.7 + seededRandom(seed + 1) * 0.25;
  const richness = 15 + Math.round(seededRandom(seed + 2) * 35);
  const total = 800 + Math.round(seededRandom(seed + 3) * 4200);
  const evenness = 0.55 + seededRandom(seed + 4) * 0.4;

  let health;
  if (shannon >= 3.5) health = 'excellent';
  else if (shannon >= 2.8) health = 'good';
  else if (shannon >= 2.0) health = 'moderate';
  else health = 'poor';

  res.json({
    region,
    shannon_diversity_index: Math.round(shannon * 100) / 100,
    simpson_diversity_index: Math.round(simpson * 1000) / 1000,
    species_richness: richness,
    total_individuals: total,
    evenness: Math.round(evenness * 100) / 100,
    biodiversity_health: health,
  });
});


router.post('/migration', (req, res) => {
  const { species = 'Deer', region = 'Northern Region', season = 'spring' } = req.body;
  const seed = hash(`${species}-${region}-${season}`);

  const prob = 0.4 + seededRandom(seed) * 0.55;
  const confidence = 0.65 + seededRandom(seed + 1) * 0.3;

  const peakMap = { spring: 'Mar–Apr', summer: 'Jun–Jul', fall: 'Sep–Oct', winter: 'Dec–Jan' };

  const corridors = [
    { from: `${region} Highlands`, to: `${region} Valley`, probability: 0.5 + seededRandom(seed + 2) * 0.45 },
    { from: `${region} Forest Edge`, to: 'River Corridor', probability: 0.25 + seededRandom(seed + 3) * 0.4 },
  ];

  res.json({
    species,
    region,
    season,
    migration_probability: Math.round(prob * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    peak_migration_period: peakMap[season] ?? 'Unknown',
    predicted_routes: corridors,
    recommendations: [
      `Set up monitoring checkpoints along ${region} corridors`,
      `Deploy camera traps at known ${species.toLowerCase()} crossing points`,
      `Coordinate with nearby reserves for cross-boundary tracking`,
      'Alert local communities about expected movement patterns',
    ],
  });
});


router.post('/poaching-hotspots', (req, res) => {
  const { region = 'Northern Region' } = req.body;
  const seed = hash(region);

  const zones = [
    { zone: 'North-West Border', riskBase: 0.75 },
    { zone: 'Eastern Forest Edge', riskBase: 0.55 },
    { zone: 'Southern Grasslands', riskBase: 0.35 },
  ];

  const hotspots = zones.map((z, i) => {
    const score = Math.min(1, z.riskBase + (seededRandom(seed + i) * 0.2 - 0.1));
    const level = score >= 0.7 ? 'high' : score >= 0.45 ? 'medium' : 'low';
    return {
      zone: z.zone,
      risk_score: Math.round(score * 100) / 100,
      risk_level: level,
      predicted_incidents: Math.round(3 + seededRandom(seed + i + 10) * 12),
      factors: [
        'proximity_to_roads',
        'low_patrol_frequency',
        'high_wildlife_density',
        'market_demand',
      ].slice(0, 2 + Math.round(seededRandom(seed + i + 20) * 2)),
    };
  });

  const totalIncidents = hotspots.reduce((s, h) => s + h.predicted_incidents, 0);

  res.json({
    region,
    hotspots,
    total_predicted_incidents: totalIncidents,
    recommendations: [
      'Increase patrol frequency in high-risk zones',
      'Deploy motion-sensor camera traps at border crossing points',
      'Strengthen community informer network in surrounding villages',
      'Coordinate with law enforcement for joint operations',
    ],
  });
});


router.post('/disease-risk', (req, res) => {
  const { species = 'Elephant', region = 'Northern Region', currentCases = 5 } = req.body;
  const seed = hash(`${species}-${region}`);

  const outbreakProb = 0.2 + seededRandom(seed) * 0.6;
  const predicted30 = Math.round(currentCases * (1 + outbreakProb * 2.5));

  let alertLevel;
  if (outbreakProb >= 0.65) alertLevel = 'critical';
  else if (outbreakProb >= 0.4) alertLevel = 'high';
  else alertLevel = 'moderate';

  res.json({
    species,
    region,
    outbreak_probability: Math.round(outbreakProb * 100) / 100,
    alert_level: alertLevel,
    current_cases: currentCases,
    predicted_cases_30_days: predicted30,
    preventive_measures: [
      'Quarantine symptomatic individuals immediately',
      'Increase water source testing frequency',
      'Deploy veterinary rapid-response teams',
      'Monitor herd movement to limit cross-contamination',
    ],
    recommendations: [
      `Establish disease surveillance perimeter around ${region}`,
      'Stock antiviral and antibiotic supplies at field stations',
      'Train local rangers in early symptom identification',
      'Coordinate with wildlife veterinary specialists for outbreak readiness',
    ],
  });
});


export default router;
