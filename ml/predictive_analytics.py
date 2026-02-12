"""
Predictive Analytics Module
Time-series forecasting and predictive models for wildlife conservation
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.cluster import DBSCAN
from datetime import datetime, timedelta
import json
from pathlib import Path

class WildlifePredictiveAnalytics:
    """Predictive analytics for wildlife conservation"""
    
    def __init__(self):
        """Initialize predictive analytics engine"""
        self.models = {}
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models if available"""
        models_dir = Path('models')
        
        # Try to load saved models
        model_files = {
            'migration': models_dir / 'migration_predictor.joblib',
            'poaching': models_dir / 'poaching_predictor.joblib',
            'disease': models_dir / 'disease_predictor.joblib'
        }
        
        for name, path in model_files.items():
            if path.exists():
                import joblib
                self.models[name] = joblib.load(path)
                print(f"✅ Loaded {name} model")
            else:
                print(f"⚠️ {name} model not found, will use default predictions")
    
    def predict_migration_patterns(self, species, region, season, historical_data=None):
        """
        Predict wildlife migration patterns
        
        Args:
            species: Animal species
            region: Geographic region
            season: Current season
            historical_data: Optional historical migration data
            
        Returns:
            Migration predictions with probability
        """
        # Simplified prediction logic (in production, use LSTM or Prophet)
        migration_likelihood = {
            'spring': 0.8,
            'summer': 0.3,
            'fall': 0.7,
            'winter': 0.4
        }
        
        base_probability = migration_likelihood.get(season.lower(), 0.5)
        
        # Adjust based on species
        species_modifiers = {
            'deer': 1.2,
            'elephant': 1.5,
            'bird': 1.8,
            'bear': 0.9
        }
        
        modifier = species_modifiers.get(species.lower(), 1.0)
        final_probability = min(base_probability * modifier, 1.0)
        
        # Generate predicted routes (simplified)
        predicted_routes = self._generate_migration_routes(species, region, season)
        
        return {
            'success': True,
            'species': species,
            'region': region,
            'season': season,
            'migration_probability': float(final_probability),
            'predicted_routes': predicted_routes,
            'peak_migration_period': self._estimate_peak_period(season),
            'confidence': 0.75,
            'recommendations': self._migration_recommendations(final_probability)
        }
    
    def predict_poaching_hotspots(self, region, time_period='next_month', historical_incidents=None):
        """
        Predict poaching hotspot locations
        
        Args:
            region: Geographic region
            time_period: Prediction time period
            historical_incidents: Historical poaching incident data
            
        Returns:
            Hotspot predictions with risk scores
        """
        # Simplified hotspot detection (in production, use geospatial clustering + ML)
        
        # Generate synthetic hotspots for demonstration
        hotspots = [
            {
                'location': {'lat': 28.6139, 'lng': 77.2090},
                'risk_score': 0.85,
                'risk_level': 'high',
                'predicted_incidents': 12,
                'factors': ['proximity_to_border', 'low_patrol_coverage', 'high_value_species']
            },
            {
                'location': {'lat': 28.7041, 'lng': 77.1025},
                'risk_score': 0.62,
                'risk_level': 'medium',
                'predicted_incidents': 6,
                'factors': ['historical_activity', 'remote_location']
            },
            {
                'location': {'lat': 28.5355, 'lng': 77.3910},
                'risk_score': 0.45,
                'risk_level': 'low',
                'predicted_incidents': 3,
                'factors': ['seasonal_patterns']
            }
        ]
        
        return {
            'success': True,
            'region': region,
            'time_period': time_period,
            'hotspots': hotspots,
            'total_predicted_incidents': sum(h['predicted_incidents'] for h in hotspots),
            'recommendations': [
                'Increase patrol frequency in high-risk areas',
                'Deploy camera traps in identified hotspots',
                'Coordinate with local law enforcement',
                'Implement community awareness programs'
            ]
        }
    
    def predict_disease_outbreak(self, species, region, current_cases=0, environmental_factors=None):
        """
        Predict disease outbreak probability
        
        Args:
            species: Animal species
            region: Geographic region
            current_cases: Current number of disease cases
            environmental_factors: Environmental conditions
            
        Returns:
            Disease outbreak predictions
        """
        # Simplified outbreak prediction (in production, use epidemiological models)
        
        # Base risk calculation
        base_risk = min(current_cases * 0.05, 0.5)
        
        # Environmental factor adjustments
        if environmental_factors:
            if environmental_factors.get('weather') == 'wet':
                base_risk += 0.2
            if environmental_factors.get('temperature') == 'high':
                base_risk += 0.15
            if environmental_factors.get('population_density') == 'high':
                base_risk += 0.25
        
        outbreak_probability = min(base_risk, 1.0)
        
        # Determine alert level
        if outbreak_probability >= 0.7:
            alert_level = 'critical'
        elif outbreak_probability >= 0.5:
            alert_level = 'high'
        elif outbreak_probability >= 0.3:
            alert_level = 'moderate'
        else:
            alert_level = 'low'
        
        return {
            'success': True,
            'species': species,
            'region': region,
            'outbreak_probability': float(outbreak_probability),
            'alert_level': alert_level,
            'current_cases': current_cases,
            'predicted_cases_30_days': int(current_cases * (1 + outbreak_probability * 2)),
            'recommendations': self._disease_recommendations(alert_level, species),
            'preventive_measures': [
                'Increase health monitoring frequency',
                'Quarantine affected areas if needed',
                'Coordinate with veterinary services',
                'Implement vaccination programs if available'
            ]
        }
    
    def predict_seasonal_incidents(self, region, season, historical_data=None):
        """
        Predict seasonal incident patterns
        
        Args:
            region: Geographic region
            season: Season (spring/summer/fall/winter)
            historical_data: Historical incident data
            
        Returns:
            Seasonal predictions
        """
        # Seasonal incident patterns
        seasonal_patterns = {
            'spring': {'incidents': 45, 'types': ['injured', 'orphaned', 'trapped']},
            'summer': {'incidents': 62, 'types': ['heat_stress', 'dehydration', 'wildfire']},
            'fall': {'incidents': 38, 'types': ['injured', 'vehicle_collision']},
            'winter': {'incidents': 28, 'types': ['starvation', 'cold_stress', 'trapped']}
        }
        
        pattern = seasonal_patterns.get(season.lower(), seasonal_patterns['summer'])
        
        return {
            'success': True,
            'region': region,
            'season': season,
            'predicted_incidents': pattern['incidents'],
            'common_incident_types': pattern['types'],
            'peak_period': self._estimate_peak_period(season),
            'resource_recommendations': self._resource_recommendations(pattern['incidents'])
        }
    
    def _generate_migration_routes(self, species, region, season):
        """Generate predicted migration routes"""
        # Simplified route generation
        return [
            {'from': region, 'to': 'Northern Region', 'probability': 0.7},
            {'from': region, 'to': 'Eastern Region', 'probability': 0.5}
        ]
    
    def _estimate_peak_period(self, season):
        """Estimate peak period for events"""
        peak_periods = {
            'spring': 'March-April',
            'summer': 'June-July',
            'fall': 'September-October',
            'winter': 'December-January'
        }
        return peak_periods.get(season.lower(), 'Unknown')
    
    def _migration_recommendations(self, probability):
        """Generate migration-related recommendations"""
        if probability >= 0.7:
            return [
                'High migration activity expected',
                'Increase monitoring along migration corridors',
                'Prepare for increased vehicle-wildlife collisions',
                'Coordinate with transportation authorities'
            ]
        else:
            return [
                'Normal migration patterns expected',
                'Maintain standard monitoring protocols'
            ]
    
    def _disease_recommendations(self, alert_level, species):
        """Generate disease-specific recommendations"""
        recommendations = []
        
        if alert_level in ['critical', 'high']:
            recommendations.extend([
                f'⚠️ HIGH ALERT: Potential {species} disease outbreak',
                'Implement immediate health screening protocols',
                'Restrict movement in affected areas',
                'Alert all wildlife centers and veterinarians'
            ])
        else:
            recommendations.extend([
                'Continue routine health monitoring',
                'Maintain biosecurity protocols'
            ])
        
        return recommendations
    
    def _resource_recommendations(self, predicted_incidents):
        """Generate resource allocation recommendations"""
        if predicted_incidents >= 50:
            return [
                'High incident volume expected',
                'Ensure adequate rescue team availability',
                'Stock up on medical supplies',
                'Consider activating volunteer network'
            ]
        else:
            return [
                'Normal incident volume expected',
                'Maintain standard resource levels'
            ]


if __name__ == '__main__':
    print("\n📊 Testing Predictive Analytics...")
    analytics = WildlifePredictiveAnalytics()
    
    # Test migration prediction
    migration = analytics.predict_migration_patterns('Deer', 'Central Region', 'spring')
    print(f"✅ Migration prediction: {migration['migration_probability']:.2%} probability")
    
    # Test poaching hotspots
    hotspots = analytics.predict_poaching_hotspots('Northern Region')
    print(f"✅ Poaching hotspots: {len(hotspots['hotspots'])} identified")
    
    # Test disease outbreak
    disease = analytics.predict_disease_outbreak('Elephant', 'Eastern Region', current_cases=5)
    print(f"✅ Disease outbreak: {disease['alert_level']} alert level")
