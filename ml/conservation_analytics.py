"""
Conservation Analytics Module
Advanced analytics for conservation impact assessment
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List
import json

class ConservationAnalytics:
    """Analytics for wildlife conservation metrics"""
    
    def __init__(self):
        """Initialize conservation analytics"""
        pass
    
    def analyze_population_trends(self, species: str, region: str, 
                                  historical_data: List[Dict] = None) -> Dict:
        """
        Analyze wildlife population trends
        
        Args:
            species: Animal species
            region: Geographic region
            historical_data: Historical population data
            
        Returns:
            Population trend analysis
        """
        # Generate synthetic trend data for demonstration
        # In production, this would use real historical data
        months = 12
        base_population = 1000
        
        # Simulate population trend with some variation
        trend_data = []
        for i in range(months):
            # Add seasonal variation and slight growth
            seasonal_factor = 1 + 0.1 * np.sin(i * np.pi / 6)
            growth_factor = 1 + (i * 0.01)  # 1% monthly growth
            noise = np.random.normal(0, 0.05)
            
            population = int(base_population * seasonal_factor * growth_factor * (1 + noise))
            
            date = (datetime.now() - timedelta(days=30 * (months - i))).strftime('%Y-%m')
            trend_data.append({
                'month': date,
                'population': population
            })
        
        # Calculate statistics
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
    
    def calculate_biodiversity_index(self, region: str, species_counts: Dict[str, int] = None) -> Dict:
        """
        Calculate biodiversity metrics for a region
        
        Args:
            region: Geographic region
            species_counts: Dictionary of species and their counts
            
        Returns:
            Biodiversity metrics
        """
        # Generate sample data if not provided
        if not species_counts:
            species_counts = {
                'Deer': 450,
                'Elephant': 120,
                'Tiger': 35,
                'Leopard': 28,
                'Bear': 65,
                'Monkey': 380,
                'Bird Species': 1200,
                'Reptile Species': 180
            }
        
        # Calculate Shannon Diversity Index
        total = sum(species_counts.values())
        shannon_index = 0
        for count in species_counts.values():
            if count > 0:
                p = count / total
                shannon_index -= p * np.log(p)
        
        # Calculate Simpson's Diversity Index
        simpson_index = 1 - sum((count/total)**2 for count in species_counts.values())
        
        # Species richness (number of species)
        species_richness = len(species_counts)
        
        # Evenness (how evenly distributed the species are)
        max_shannon = np.log(species_richness)
        evenness = shannon_index / max_shannon if max_shannon > 0 else 0
        
        # Determine biodiversity health
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
            'dominant_species': max(species_counts, key=species_counts.get),
            'rare_species': [s for s, c in species_counts.items() if c < total * 0.02]
        }
    
    def assess_habitat_health(self, region: str, metrics: Dict = None) -> Dict:
        """
        Assess habitat health based on various metrics
        
        Args:
            region: Geographic region
            metrics: Environmental metrics
            
        Returns:
            Habitat health assessment
        """
        # Default metrics if not provided
        if not metrics:
            metrics = {
                'forest_cover_percent': 65,
                'water_quality_index': 72,
                'air_quality_index': 68,
                'soil_health_index': 70,
                'human_encroachment_level': 'moderate'
            }
        
        # Calculate overall health score
        health_score = (
            metrics.get('forest_cover_percent', 50) * 0.3 +
            metrics.get('water_quality_index', 50) * 0.25 +
            metrics.get('air_quality_index', 50) * 0.2 +
            metrics.get('soil_health_index', 50) * 0.25
        )
        
        # Adjust for human encroachment
        encroachment_penalty = {
            'low': 0,
            'moderate': -10,
            'high': -20,
            'severe': -30
        }
        health_score += encroachment_penalty.get(metrics.get('human_encroachment_level', 'moderate'), -10)
        
        # Determine health status
        if health_score >= 80:
            status = 'excellent'
        elif health_score >= 65:
            status = 'good'
        elif health_score >= 50:
            status = 'moderate'
        else:
            status = 'poor'
        
        # Generate recommendations
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
        """
        Generate conservation impact report
        
        Args:
            time_period: Time period for report
            
        Returns:
            Impact report with key metrics
        """
        # Generate sample impact data
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
        
        # Calculate trends
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
    
    def track_endangered_species(self, species: str, region: str = None) -> Dict:
        """
        Track endangered species status and incidents
        
        Args:
            species: Endangered species name
            region: Optional region filter
            
        Returns:
            Endangered species tracking data
        """
        # Sample endangered species data
        tracking_data = {
            'species': species,
            'conservation_status': 'Endangered',
            'estimated_population': 235,
            'population_trend': 'stable',
            'recent_incidents': 12,
            'successful_interventions': 10,
            'threats': [
                'Habitat loss',
                'Poaching',
                'Human-wildlife conflict'
            ],
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
        """Simple population forecast"""
        # Linear trend forecast
        x = np.arange(len(historical_populations))
        y = np.array(historical_populations)
        
        # Fit linear trend
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
        """Assess conservation status based on trends"""
        if trend == 'increasing' and percent_change > 10:
            return 'improving'
        elif trend == 'decreasing' and percent_change < -10:
            return 'declining - action needed'
        else:
            return 'stable'
    
    def _habitat_recommendations(self, metrics: Dict, health_score: float) -> List[str]:
        """Generate habitat improvement recommendations"""
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
        """Determine priority conservation actions"""
        actions = []
        
        # Prioritize based on worst metrics
        metric_scores = [
            ('forest_cover', metrics.get('forest_cover_percent', 100)),
            ('water_quality', metrics.get('water_quality_index', 100)),
            ('air_quality', metrics.get('air_quality_index', 100)),
            ('soil_health', metrics.get('soil_health_index', 100))
        ]
        
        # Sort by score (lowest first)
        metric_scores.sort(key=lambda x: x[1])
        
        # Top 2 priorities
        for metric, score in metric_scores[:2]:
            if score < 70:
                actions.append(f"Priority: Improve {metric.replace('_', ' ')}")
        
        return actions or ['Maintain current conservation standards']


if __name__ == '__main__':
    print("\n🌿 Testing Conservation Analytics...")
    analytics = ConservationAnalytics()
    
    # Test population trends
    trends = analytics.analyze_population_trends('Tiger', 'Central Region')
    print(f"✅ Population trend: {trends['statistics']['trend_direction']}")
    
    # Test biodiversity
    biodiversity = analytics.calculate_biodiversity_index('Forest Reserve')
    print(f"✅ Biodiversity health: {biodiversity['biodiversity_health']}")
    
    # Test impact report
    impact = analytics.generate_impact_report()
    print(f"✅ Animals rescued: {impact['impact_metrics']['animals_rescued']}")
