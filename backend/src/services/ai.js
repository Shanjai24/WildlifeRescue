import axios from 'axios';
import { Organization } from '../lib/db.js';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';

/**
 * Call ML API to classify incident priority
 */
export async function classifyPriority({ description, animalCategory, incidentType, addressText }) {
    try {
        // Extract time of day
        const hour = new Date().getHours();
        let timeOfDay = 'afternoon';
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        // Guess location type from address
        let locationType = 'urban';
        const addressLower = (addressText || '').toLowerCase();
        if (addressLower.includes('forest') || addressLower.includes('jungle')) {
            locationType = 'forest';
        } else if (addressLower.includes('highway') || addressLower.includes('road')) {
            locationType = 'highway';
        } else if (addressLower.includes('lake') || addressLower.includes('river') || addressLower.includes('water')) {
            locationType = 'water_body';
        } else if (addressLower.includes('village') || addressLower.includes('rural')) {
            locationType = 'rural';
        }

        // Simple weather detection (can be enhanced with real API)
        let weather = 'clear';
        const descLower = description.toLowerCase();
        if (descLower.includes('rain') || descLower.includes('wet')) weather = 'rain';
        if (descLower.includes('storm') || descLower.includes('flood')) weather = 'storm';

        const response = await axios.post(`${ML_API_URL}/predict/priority`, {
            animal_category: animalCategory || 'other',
            incident_type: incidentType || 'other',
            time_of_day: timeOfDay,
            location_type: locationType,
            weather: weather,
            description: description
        }, {
            timeout: 5000
        });

        if (response.data.success) {
            console.log('✅ ML Priority Prediction:', response.data);
            return response.data.prediction;
        } else {
            console.error('❌ ML API Error:', response.data.error);
            return fallbackPriorityClassification({ description, animalCategory, incidentType });
        }
    } catch (error) {
        console.error('❌ ML API Connection Error:', error.message);
        // Fallback to rule-based classification
        return fallbackPriorityClassification({ description, animalCategory, incidentType });
    }
}

/**
 * Call ML API to predict rescue success
 */
export async function predictRescueSuccess({
    priority, animalCategory, incidentType,
    organizationType, responseTime, distance, addressText
}) {
    try {
        // Extract location type from address
        let locationType = 'urban';
        const addressLower = (addressText || '').toLowerCase();
        if (addressLower.includes('forest') || addressLower.includes('jungle')) {
            locationType = 'forest';
        } else if (addressLower.includes('highway') || addressLower.includes('road')) {
            locationType = 'highway';
        } else if (addressLower.includes('lake') || addressLower.includes('river') || addressLower.includes('water')) {
            locationType = 'water_body';
        } else if (addressLower.includes('village') || addressLower.includes('rural')) {
            locationType = 'rural';
        }

        const response = await axios.post(`${ML_API_URL}/predict/success`, {
            priority: priority,
            animal_category: animalCategory || 'other',
            incident_type: incidentType || 'other',
            org_type: organizationType || 'blue_cross',
            response_time_min: responseTime || 30,
            distance_km: distance || 10,
            weather: 'clear',
            location_type: locationType
        }, {
            timeout: 5000
        });

        if (response.data.success) {
            console.log('✅ ML Success Prediction:', response.data);
            return {
                successProbability: response.data.success_probability,
                recommendation: response.data.recommendation
            };
        } else {
            console.error('❌ ML API Error:', response.data.error);
            return null;
        }
    } catch (error) {
        console.error('❌ ML API Connection Error:', error.message);
        return null;
    }
}

/**
 * Fallback rule-based priority classification if ML API is down
 */
function fallbackPriorityClassification({ description = '', animalCategory, incidentType }) {
    console.warn('⚠️  Using fallback rule-based classification');

    const text = description.toLowerCase();
    const criticalKeywords = ['bleeding', 'unconscious', 'trapped', 'highway', 'railway', 'storm', 'flood', 'fire'];
    const hasCritical = criticalKeywords.some(k => text.includes(k));

    if (hasCritical) return 'critical';
    if (animalCategory === 'wildlife' && (incidentType === 'injured' || incidentType === 'trapped')) return 'critical';
    if (incidentType === 'injured') return 'medium';
    return 'low';
}

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function matchOrganizations({ incident }) {
    const where = { verificationStatus: 'verified' };
    const orgs = await Organization.findAll({ where });

    // If location is not available, fall back to simple service matching
    if (!incident.latitude || !incident.longitude) {
        const serviceMap = {
            injured: ['veterinary', 'blue_cross', 'firefighter'],
            trapped: ['firefighter', 'blue_cross', 'wildlife_center'],
            endangered: ['wildlife_center', 'blue_cross', 'firefighter'],
            aggressive: ['firefighter', 'blue_cross']
        };
        const preferred = serviceMap[incident.incidentType] || ['blue_cross', 'firefighter', 'veterinary', 'wildlife_center'];
        return orgs.filter(o => preferred.includes(o.serviceType));
    }

    const MAX_DISTANCE_KM = 50; // Notification radius

    // Map orgs to include distance
    const orgsWithDistance = orgs.map(org => {
        if (!org.latitude || !org.longitude) return { org, distance: Infinity };
        const distance = calculateDistance(incident.latitude, incident.longitude, org.latitude, org.longitude);
        return { org, distance };
    });

    // Filter by max distance and Sort by distance (nearest first)
    // We prioritize distance over service type now, based on user feedback.
    // We will include ALL verified orgs within range, sorted by proximity.
    const sortedCandidates = orgsWithDistance
        .filter(item => item.distance <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distance - b.distance)
        .map(item => {
            // Attach distance to the org object for potential use downstream
            // Sequelize instances are not simple objects, but we can store it in dataValues or just a property
            item.org.dataValues.distanceKm = item.distance;
            return item.org;
        });

    console.log(`📍 Found ${sortedCandidates.length} rescuers within ${MAX_DISTANCE_KM}km. Nearest is ${sortedCandidates[0]?.dataValues.distanceKm?.toFixed(1)}km away.`);

    return sortedCandidates;
}
