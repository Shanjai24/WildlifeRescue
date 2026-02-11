"""
Wildlife Incident Dataset Generator
Generates synthetic wildlife rescue incident data for ML training
"""
import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Define categories
ANIMAL_CATEGORIES = ['dog', 'cat', 'bird', 'wildlife', 'other']
INCIDENT_TYPES = ['injured', 'trapped', 'endangered', 'aggressive', 'other']
TIME_OF_DAY = ['morning', 'afternoon', 'evening', 'night']
LOCATION_TYPES = ['urban', 'rural', 'forest', 'water_body', 'highway']
WEATHER_CONDITIONS = ['clear', 'rain', 'storm', 'fog']
ORG_TYPES = ['veterinary', 'wildlife_center', 'blue_cross', 'firefighter']

def generate_incident():
    """Generate a single realistic wildlife incident record"""
    
    # Basic features
    animal_category = random.choice(ANIMAL_CATEGORIES)
    incident_type = random.choice(INCIDENT_TYPES)
    time_of_day = random.choice(TIME_OF_DAY)
    location_type = random.choice(LOCATION_TYPES)
    weather = random.choice(WEATHER_CONDITIONS)
    
    # Binary features (keyword-based)
    has_bleeding = 1 if incident_type == 'injured' and random.random() > 0.4 else 0
    has_trapped = 1 if incident_type == 'trapped' else 0
    has_unconscious = 1 if incident_type == 'injured' and random.random() > 0.7 else 0
    near_highway = 1 if location_type == 'highway' else 0
    in_storm = 1 if weather == 'storm' else 0
    
    # Numerical features
    response_time_min = random.randint(5, 120)
    distance_km = round(random.uniform(0.5, 50.0), 2)
    org_type = random.choice(ORG_TYPES)
    
    # PRIORITY LOGIC (Rule-based ground truth)
    priority_score = 0
    
    # Critical indicators
    if has_bleeding: priority_score += 30
    if has_unconscious: priority_score += 35
    if has_trapped: priority_score += 25
    if in_storm: priority_score += 20
    if near_highway: priority_score += 25
    if animal_category == 'wildlife' and incident_type in ['injured', 'trapped']:
        priority_score += 25
    if incident_type == 'endangered': priority_score += 30
    if time_of_day == 'night' and location_type in ['highway', 'forest']:
        priority_score += 15
    
    # Determine priority
    if priority_score >= 50:
        priority = 'critical'
    elif priority_score >= 25:
        priority = 'medium'
    else:
        priority = 'low'
    
    # RESCUE SUCCESS LOGIC
    success_prob = 0.85  # Base probability
    
    # Negative factors
    if response_time_min > 60: success_prob -= 0.25
    if response_time_min > 90: success_prob -= 0.15
    if distance_km > 30: success_prob -= 0.20
    if weather == 'storm': success_prob -= 0.15
    if priority == 'critical' and response_time_min > 45: success_prob -= 0.20
    if location_type == 'water_body': success_prob -= 0.10
    
    # Positive factors
    if org_type == 'wildlife_center' and animal_category == 'wildlife': success_prob += 0.10
    if org_type == 'veterinary' and animal_category in ['dog', 'cat']: success_prob += 0.10
    if response_time_min < 20: success_prob += 0.15
    if priority == 'low': success_prob += 0.05
    
    # Ensure probability is between 0 and 1
    success_prob = max(0.1, min(0.99, success_prob))
    rescue_success = 1 if random.random() < success_prob else 0
    
    return {
        'animal_category': animal_category,
        'incident_type': incident_type,
        'time_of_day': time_of_day,
        'location_type': location_type,
        'weather': weather,
        'has_bleeding': has_bleeding,
        'has_trapped': has_trapped,
        'has_unconscious': has_unconscious,
        'near_highway': near_highway,
        'in_storm': in_storm,
        'response_time_min': response_time_min,
        'distance_km': distance_km,
        'org_type': org_type,
        'priority': priority,
        'rescue_success': rescue_success
    }

def generate_dataset(n_samples=1500):
    """Generate complete dataset"""
    print(f"Generating {n_samples} wildlife incident records...")
    
    incidents = [generate_incident() for _ in range(n_samples)]
    df = pd.DataFrame(incidents)
    
    # Add incident IDs
    df.insert(0, 'incident_id', range(1, len(df) + 1))
    
    print(f"\nDataset Statistics:")
    print(f"Total Records: {len(df)}")
    print(f"\nPriority Distribution:")
    print(df['priority'].value_counts())
    print(f"\nRescue Success Rate: {df['rescue_success'].mean():.2%}")
    print(f"\nAnimal Category Distribution:")
    print(df['animal_category'].value_counts())
    
    return df

if __name__ == "__main__":
    # Generate dataset
    dataset = generate_dataset(n_samples=1500)
    
    # Save to CSV
    output_path = '../data/wildlife_incidents.csv'
    dataset.to_csv(output_path, index=False)
    print(f"\n✅ Dataset saved to: {output_path}")
    
    # Display sample
    print("\nSample Records:")
    print(dataset.head(10).to_string())