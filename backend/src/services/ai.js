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

export async function matchOrganizations({ incident }) {
  const where = { verificationStatus: 'verified' };
  const orgs = await Organization.findAll({ where });
  const serviceMap = {
    injured: ['veterinary', 'blue_cross', 'firefighter'],
    trapped: ['firefighter', 'blue_cross', 'wildlife_center'],
    endangered: ['wildlife_center', 'blue_cross', 'firefighter'],
    aggressive: ['firefighter', 'blue_cross']
  };
  const preferred = serviceMap[incident.incidentType] || ['blue_cross', 'firefighter', 'veterinary', 'wildlife_center'];
  const filtered = orgs.filter(o => preferred.includes(o.serviceType));
  return filtered;
}
