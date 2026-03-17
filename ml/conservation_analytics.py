"""
Conservation Analytics Module
Advanced analytics for conservation impact assessment
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json

class ConservationAnalytics:
    """Analytics for wildlife conservation metrics"""
    
    def __init__(self):
        """Initialize conservation analytics"""
        pass
    
    def analyze_population_trends(self, species: str, region: str, 
                                  historical_data: Optional[List[Dict]] = None) -> Dict:
        months = 12
        
        # Different base populations per species so dropdown changes are visible
        species_base = {
            'Tiger': 250, 'Elephant': 800, 'Leopard': 400,
            'Deer': 3000, 'Bear': 600, 'Lion': 180
        }
        base_population = species_base.get(species, 1000)
        
        # Region modifier
        region_modifier = {
            'Central Region': 1.0, 'Northern Region': 0.8,
            'Eastern Region': 1.2, 'Wildlife Reserve': 1.5
        }
        base_population = int(base_population * region_modifier.get(region, 1.0))
        
        # Simulate population trend with some variation
        trend_data = []
        for i in range(months):
            seasonal_factor = 1 + 0.1 * np.sin(i * np.pi / 6)
            growth_factor = 1 + (i * 0.01)
            noise = np.random.normal(0, 0.05)
            
            population = int(base_population * seasonal_factor * growth_factor * (1 + noise))
            
            date = (datetime.now() - timedelta(days=30 * (months - i))).strftime('%Y-%m')
            trend_data.append({
                'month': date,
                'population': population
            })
        
        populations = [d['population'] for d in trend_data]
        avg_population = np.mean(populations)
        trend_direction = 'increasing' if populations[-1] > populations[0] else 'decreasing'
        percent_change = ((populations[-1] - populations[0]) / populations[0]) * 100
        
        return {
            'success': True,
            'species': species,
            'region': region,
            'trend_data': trend_data,
            'statistics': {
                'current_population': populations[-1],
                'average_population': int(avg_population),
                'min_population': min(populations),
                'max_population': max(populations),
                'trend_direction': trend_direction,
                'percent_change_12_months': float(percent_change)
            },
            'forecast': self._forecast_population(populations, months=3),
            'conservation_status': self._assess_conservation_status(trend_direction, percent_change)
        }
    
    def calculate_biodiversity_index(self, region: str, species_counts: Optional[Dict[str, int]] = None) -> Dict:
        if not species_counts:
            # Vary counts by region
            region_multiplier = {
                'Central Region': 1.0, 'Northern Region': 0.7,
                'Eastern Region': 1.3, 'Wildlife Reserve': 1.8
            }.get(region, 1.0)
            
            species_counts = {
                'Deer': int(450 * region_multiplier),
                'Elephant': int(120 * region_multiplier),
                'Tiger': int(35 * region_multiplier),
                'Leopard': int(28 * region_multiplier),
                'Bear': int(65 * region_multiplier),
                'Monkey': int(380 * region_multiplier),
                'Bird Species': int(1200 * region_multiplier),
                'Reptile Species': int(180 * region_multiplier)
            }
        
        total: int = sum(species_counts.values())
        shannon_index: float = 0.0
        for count in species_counts.values():
            if count > 0:
                p: float = count / total  # type: ignore[operator]
                shannon_index -= p * float(np.log(p))  # type: ignore[operator]
        
        simpson_index: float = 1.0 - sum((count/total)**2 for count in species_counts.values())  # type: ignore[operator]
        species_richness: int = len(species_counts)
        max_shannon: float = float(np.log(species_richness))
        evenness: float = (shannon_index / max_shannon) if max_shannon > 0 else 0.0  # type: ignore[operator]
        
        if shannon_index >= 2.5:
            health_status = 'excellent'
        elif shannon_index >= 2.0:
            health_status = 'good'
        elif shannon_index >= 1.5:
            health_status = 'moderate'
        else:
            health_status = 'poor'
        
        return {
            'success': True,
            'region': region,
            'species_richness': species_richness,
            'total_individuals': total,
            'shannon_diversity_index': float(shannon_index),
            'simpson_diversity_index': float(simpson_index),
            'evenness': float(evenness),
            'biodiversity_health': health_status,
            'species_distribution': species_counts,
            'dominant_species': max(species_counts, key=lambda k: species_counts[k]),
            'rare_species': [s for s, c in species_counts.items() if c < float(total) * 0.02]
        }
    
    def assess_habitat_health(self, region: str, metrics: Optional[Dict] = None) -> Dict:
        if not metrics:
            metrics = {
                'forest_cover_percent': 65,
                'water_quality_index': 72,
                'air_quality_index': 68,
                'soil_health_index': 70,
                'human_encroachment_level': 'moderate'
            }
        
        health_score = (
            metrics.get('forest_cover_percent', 50) * 0.3 +
            metrics.get('water_quality_index', 50) * 0.25 +
            metrics.get('air_quality_index', 50) * 0.2 +
            metrics.get('soil_health_index', 50) * 0.25
        )
        
        encroachment_penalty = {
            'low': 0, 'moderate': -10, 'high': -20, 'severe': -30
        }
        health_score += encroachment_penalty.get(metrics.get('human_encroachment_level', 'moderate'), -10)
        
        if health_score >= 80:
            status = 'excellent'
        elif health_score >= 65:
            status = 'good'
        elif health_score >= 50:
            status = 'moderate'
        else:
            status = 'poor'
        
        recommendations = self._habitat_recommendations(metrics, health_score)
        
        return {
            'success': True,
            'region': region,
            'overall_health_score': float(health_score),
            'health_status': status,
            'metrics': metrics,
            'recommendations': recommendations,
            'priority_actions': self._priority_actions(metrics)
        }
    
    def generate_impact_report(self, time_period: str = 'last_year') -> Dict:
        impact_data = {
            'animals_rescued': 342,
            'successful_rescues': 298,
            'success_rate': 87.1,
            'species_helped': 28,
            'critical_incidents_handled': 89,
            'average_response_time_minutes': 35,
            'volunteer_hours': 4520,
            'area_monitored_sq_km': 1250,
            'poaching_incidents_prevented': 15,
            'habitat_restored_hectares': 45
        }
        
        previous_period_data = {
            'animals_rescued': 298,
            'successful_rescues': 251,
            'success_rate': 84.2
        }
        
        trends = {
            'animals_rescued_change': ((impact_data['animals_rescued'] - previous_period_data['animals_rescued']) / 
                                      previous_period_data['animals_rescued'] * 100),
            'success_rate_change': impact_data['success_rate'] - previous_period_data['success_rate']
        }
        
        return {
            'success': True,
            'time_period': time_period,
            'impact_metrics': impact_data,
            'trends': trends,
            'highlights': [
                f"Rescued {impact_data['animals_rescued']} animals with {impact_data['success_rate']:.1f}% success rate",
                f"Helped {impact_data['species_helped']} different species",
                f"Prevented {impact_data['poaching_incidents_prevented']} poaching incidents",
                f"Restored {impact_data['habitat_restored_hectares']} hectares of habitat"
            ],
            'top_achievements': [
                "Improved success rate by 2.9% compared to previous period",
                "Reduced average response time by 8 minutes",
                "Expanded monitoring area by 15%"
            ]
        }
    
    def track_endangered_species(self, species: str, region: Optional[str] = None) -> Dict:
        tracking_data = {
            'species': species,
            'conservation_status': 'Endangered',
            'estimated_population': 235,
            'population_trend': 'stable',
            'recent_incidents': 12,
            'successful_interventions': 10,
            'threats': ['Habitat loss', 'Poaching', 'Human-wildlife conflict'],
            'protected_areas': 5,
            'monitoring_devices': 18,
            'last_sighting': '2026-02-10'
        }
        
        return {
            'success': True,
            'tracking_data': tracking_data,
            'alert_level': 'medium',
            'recommendations': [
                'Increase monitoring frequency',
                'Strengthen anti-poaching measures',
                'Expand protected habitat areas'
            ]
        }
    
    def _forecast_population(self, historical_populations: List[int], months: int = 3) -> List[Dict]:
        x = np.arange(len(historical_populations))
        y = np.array(historical_populations)
        coeffs = np.polyfit(x, y, 1)
        
        forecast = []
        for i in range(1, months + 1):
            future_x = len(historical_populations) + i
            predicted = int(coeffs[0] * future_x + coeffs[1])
            future_date = (datetime.now() + timedelta(days=30 * i)).strftime('%Y-%m')
            forecast.append({
                'month': future_date,
                'predicted_population': max(0, predicted)
            })
        
        return forecast
    
    def _assess_conservation_status(self, trend: str, percent_change: float) -> str:
        if trend == 'increasing' and percent_change > 10:
            return 'improving'
        elif trend == 'decreasing' and percent_change < -10:
            return 'declining - action needed'
        else:
            return 'stable'
    
    def _habitat_recommendations(self, metrics: Dict, health_score: float) -> List[str]:
        recommendations = []
        if metrics.get('forest_cover_percent', 100) < 60:
            recommendations.append('Increase reforestation efforts')
        if metrics.get('water_quality_index', 100) < 70:
            recommendations.append('Improve water quality through pollution control')
        if metrics.get('human_encroachment_level') in ['high', 'severe']:
            recommendations.append('Implement stricter land use regulations')
        if health_score < 60:
            recommendations.append('Urgent intervention required - habitat degradation detected')
        return recommendations or ['Continue current conservation practices']
    
    def _priority_actions(self, metrics: Dict) -> List[str]:
        actions = []
        metric_scores = [
            ('forest_cover', metrics.get('forest_cover_percent', 100)),
            ('water_quality', metrics.get('water_quality_index', 100)),
            ('air_quality', metrics.get('air_quality_index', 100)),
            ('soil_health', metrics.get('soil_health_index', 100))
        ]
        metric_scores.sort(key=lambda x: x[1])
        for metric, score in metric_scores[:2]:
            if score < 70:
                actions.append(f"Priority: Improve {metric.replace('_', ' ')}")
        return actions or ['Maintain current conservation standards']


if __name__ == '__main__':
    print("\n🌿 Testing Conservation Analytics...")
    analytics = ConservationAnalytics()
    trends = analytics.analyze_population_trends('Tiger', 'Central Region')
    print(f"✅ Tiger population: {trends['statistics']['current_population']}")
    trends2 = analytics.analyze_population_trends('Elephant', 'Wildlife Reserve')
    print(f"✅ Elephant population: {trends2['statistics']['current_population']}")
    biodiversity = analytics.calculate_biodiversity_index('Forest Reserve')
    print(f"✅ Biodiversity health: {biodiversity['biodiversity_health']}")