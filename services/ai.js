import { Organization } from '../lib/db.js';

export function classifyPriority({ description = '', animalCategory, incidentType }) {
  const text = description.toLowerCase();
  const criticalKeywords = ['bleeding', 'unconscious', 'trapped', 'highway', 'railway', 'storm', 'flood', 'fire'];
  const hasCritical = criticalKeywords.some(k => text.includes(k));
  if (hasCritical) return 'critical';
  if (animalCategory === 'wildlife' && (incidentType === 'injured' || incidentType === 'trapped')) return 'critical';
  if (incidentType === 'injured') return 'medium';
  return 'low';
}

function extractLocationTokens(addressText = '') {
  return addressText
    .toLowerCase()
    .split(/[,\s\/\-]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);
}


function locationScore(org, tokens) {
  if (!tokens.length) return 0;
  const city     = (org.city     || '').toLowerCase();
  const district = (org.district || '').toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (city.includes(token) || token.includes(city))         score += 2;
    if (district.includes(token) || token.includes(district)) score += 1;
  }
  return score;
}

export async function matchOrganizations({ incident }) {
  const serviceMap = {
    injured:    ['veterinary', 'blue_cross', 'firefighter'],
    trapped:    ['firefighter', 'blue_cross', 'wildlife_center'],
    endangered: ['wildlife_center', 'blue_cross', 'firefighter'],
    aggressive: ['firefighter', 'blue_cross'],
  };
  const preferred = serviceMap[incident.incidentType] || ['blue_cross', 'firefighter', 'veterinary', 'wildlife_center'];

  const allOrgs = await Organization.findAll({ where: { verificationStatus: 'verified' } });

  const serviceFiltered = allOrgs.filter(o => preferred.includes(o.serviceType));

  const tokens = extractLocationTokens(incident.addressText);

  const scored = serviceFiltered.map(org => ({
    org,
    score: locationScore(org, tokens),
  }));

  scored.sort((a, b) => b.score - a.score);

  const localMatches = scored.filter(s => s.score > 0);

  if (localMatches.length > 0) {
    console.log(`📍 Found ${localMatches.length} local org(s) near "${incident.addressText}"`);
    return localMatches.map(s => s.org);
  }

  console.log(`⚠️ No local org found for "${incident.addressText}" — notifying all ${serviceFiltered.length} matching orgs`);
  return serviceFiltered;
}