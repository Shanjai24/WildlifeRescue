import axios from 'axios';

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
      animal_category: animalCategory,
      incident_type: incidentType,
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
      animal_category: animalCategory,
      incident_type: incidentType,
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

// Keep existing matchOrganizations function
export { matchOrganizations } from './ai.js';