"""
Optimization Engine Module
AI-powered routing and resource allocation algorithms
"""
import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass
import math

@dataclass
class Location:
    """Geographic location"""
    lat: float
    lng: float
    name: str = ""

@dataclass
class Rescuer:
    """Rescuer profile"""
    id: int
    name: str
    location: Location
    skills: List[str]
    availability: bool
    experience_level: str  # 'beginner', 'intermediate', 'expert'
    max_distance_km: float = 50.0

@dataclass
class Incident:
    """Incident details"""
    id: int
    location: Location
    species: str
    severity: str
    incident_type: str
    required_skills: List[str]
    priority: str

class OptimizationEngine:
    """AI-powered optimization for rescue operations"""
    
    def __init__(self):
        """Initialize optimization engine"""
        self.skill_weights = {
            'wildlife_handling': 1.5,
            'veterinary': 2.0,
            'climbing': 1.2,
            'water_rescue': 1.3,
            'large_animal': 1.4,
            'bird_handling': 1.1,
            'reptile_handling': 1.2
        }
    
    def assign_optimal_rescuer(self, incident: Incident, available_rescuers: List[Rescuer]) -> Dict:
        """
        Find optimal rescuer for an incident
        
        Args:
            incident: Incident details
            available_rescuers: List of available rescuers
            
        Returns:
            Optimal rescuer assignment with score
        """
        if not available_rescuers:
            return {
                'success': False,
                'error': 'No available rescuers'
            }
        
        # Score each rescuer
        rescuer_scores = []
        for rescuer in available_rescuers:
            if not rescuer.availability:
                continue
            
            score = self._calculate_rescuer_score(incident, rescuer)
            rescuer_scores.append({
                'rescuer': rescuer,
                'score': score,
                'distance_km': self._calculate_distance(incident.location, rescuer.location),
                'eta_minutes': self._estimate_eta(incident.location, rescuer.location)
            })
        
        if not rescuer_scores:
            return {
                'success': False,
                'error': 'No suitable rescuers available'
            }
        
        # Sort by score (descending)
        rescuer_scores.sort(key=lambda x: x['score'], reverse=True)
        
        best_match = rescuer_scores[0]
        
        return {
            'success': True,
            'assigned_rescuer': {
                'id': best_match['rescuer'].id,
                'name': best_match['rescuer'].name,
                'experience_level': best_match['rescuer'].experience_level,
                'skills': best_match['rescuer'].skills
            },
            'match_score': float(best_match['score']),
            'distance_km': float(best_match['distance_km']),
            'eta_minutes': int(best_match['eta_minutes']),
            'alternative_rescuers': [
                {
                    'id': r['rescuer'].id,
                    'name': r['rescuer'].name,
                    'score': float(r['score']),
                    'distance_km': float(r['distance_km'])
                }
                for r in rescuer_scores[1:3]  # Top 2 alternatives
            ],
            'assignment_reason': self._explain_assignment(incident, best_match['rescuer'])
        }
    
    def optimize_route(self, start_location: Location, waypoints: List[Location], 
                       return_to_start: bool = False) -> Dict:
        """
        Optimize route through multiple waypoints (simplified TSP)
        
        Args:
            start_location: Starting location
            waypoints: List of locations to visit
            return_to_start: Whether to return to start
            
        Returns:
            Optimized route
        """
        if not waypoints:
            return {
                'success': False,
                'error': 'No waypoints provided'
            }
        
        # For small number of waypoints, use nearest neighbor heuristic
        route = [start_location]
        remaining = waypoints.copy()
        current = start_location
        total_distance = 0
        
        while remaining:
            # Find nearest unvisited waypoint
            nearest = min(remaining, key=lambda w: self._calculate_distance(current, w))
            distance = self._calculate_distance(current, nearest)
            
            route.append(nearest)
            total_distance += distance
            current = nearest
            remaining.remove(nearest)
        
        if return_to_start:
            distance = self._calculate_distance(current, start_location)
            route.append(start_location)
            total_distance += distance
        
        # Estimate total time
        total_time_minutes = self._distance_to_time(total_distance)
        
        return {
            'success': True,
            'route': [
                {
                    'lat': loc.lat,
                    'lng': loc.lng,
                    'name': loc.name
                }
                for loc in route
            ],
            'total_distance_km': float(total_distance),
            'estimated_time_minutes': int(total_time_minutes),
            'waypoint_order': [loc.name for loc in route],
            'optimization_method': 'nearest_neighbor'
        }
    
    def allocate_resources(self, incidents: List[Incident], available_rescuers: List[Rescuer]) -> Dict:
        """
        Allocate rescuers to multiple incidents optimally
        
        Args:
            incidents: List of incidents
            available_rescuers: List of available rescuers
            
        Returns:
            Resource allocation plan
        """
        # Sort incidents by priority
        priority_order = {'critical': 3, 'high': 2, 'medium': 1, 'low': 0}
        sorted_incidents = sorted(incidents, key=lambda i: priority_order.get(i.priority, 0), reverse=True)
        
        allocations = []
        assigned_rescuers = set()
        unassigned_incidents = []
        
        for incident in sorted_incidents:
            # Get available rescuers (not yet assigned)
            available = [r for r in available_rescuers if r.id not in assigned_rescuers]
            
            if not available:
                unassigned_incidents.append(incident)
                continue
            
            # Assign optimal rescuer
            assignment = self.assign_optimal_rescuer(incident, available)
            
            if assignment['success']:
                allocations.append({
                    'incident_id': incident.id,
                    'incident_priority': incident.priority,
                    'assigned_rescuer': assignment['assigned_rescuer'],
                    'match_score': assignment['match_score'],
                    'eta_minutes': assignment['eta_minutes']
                })
                assigned_rescuers.add(assignment['assigned_rescuer']['id'])
            else:
                unassigned_incidents.append(incident)
        
        return {
            'success': True,
            'allocations': allocations,
            'total_incidents': len(incidents),
            'assigned_incidents': len(allocations),
            'unassigned_incidents': len(unassigned_incidents),
            'unassigned_details': [
                {
                    'incident_id': i.id,
                    'priority': i.priority,
                    'reason': 'No available rescuers'
                }
                for i in unassigned_incidents
            ],
            'resource_utilization': len(assigned_rescuers) / max(len(available_rescuers), 1)
        }
    
    def _calculate_rescuer_score(self, incident: Incident, rescuer: Rescuer) -> float:
        """Calculate match score between incident and rescuer"""
        score = 0.0
        
        # Distance factor (closer is better)
        distance = self._calculate_distance(incident.location, rescuer.location)
        if distance > rescuer.max_distance_km:
            return 0.0  # Out of range
        
        distance_score = max(0, 100 - (distance / rescuer.max_distance_km) * 50)
        score += distance_score
        
        # Skill matching
        skill_score = 0
        for required_skill in incident.required_skills:
            if required_skill in rescuer.skills:
                skill_score += self.skill_weights.get(required_skill, 1.0) * 20
        score += skill_score
        
        # Experience level matching with severity
        experience_bonus = {
            'critical': {'expert': 30, 'intermediate': 15, 'beginner': 0},
            'high': {'expert': 25, 'intermediate': 20, 'beginner': 5},
            'medium': {'expert': 20, 'intermediate': 20, 'beginner': 10},
            'low': {'expert': 15, 'intermediate': 15, 'beginner': 15}
        }
        score += experience_bonus.get(incident.severity, {}).get(rescuer.experience_level, 0)
        
        return score
    
    def _calculate_distance(self, loc1: Location, loc2: Location) -> float:
        """Calculate distance between two locations using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        lat1, lng1 = math.radians(loc1.lat), math.radians(loc1.lng)
        lat2, lng2 = math.radians(loc2.lat), math.radians(loc2.lng)
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def _estimate_eta(self, loc1: Location, loc2: Location) -> int:
        """Estimate time to reach location (in minutes)"""
        distance = self._calculate_distance(loc1, loc2)
        return self._distance_to_time(distance)
    
    def _distance_to_time(self, distance_km: float) -> int:
        """Convert distance to time (assuming average speed of 40 km/h)"""
        avg_speed_kmh = 40
        return int((distance_km / avg_speed_kmh) * 60)
    
    def _explain_assignment(self, incident: Incident, rescuer: Rescuer) -> str:
        """Generate human-readable explanation for assignment"""
        reasons = []
        
        # Check skill match
        matching_skills = [s for s in incident.required_skills if s in rescuer.skills]
        if matching_skills:
            reasons.append(f"Has required skills: {', '.join(matching_skills)}")
        
        # Check experience
        if rescuer.experience_level == 'expert':
            reasons.append("Expert-level experience")
        
        # Check proximity
        distance = self._calculate_distance(incident.location, rescuer.location)
        if distance < 10:
            reasons.append("Very close to incident location")
        elif distance < 25:
            reasons.append("Reasonably close to incident")
        
        return "; ".join(reasons) if reasons else "Best available match"


if __name__ == '__main__':
    print("\n🎯 Testing Optimization Engine...")
    engine = OptimizationEngine()
    
    # Test rescuer assignment
    incident = Incident(
        id=1,
        location=Location(28.6139, 77.2090, "Delhi"),
        species="Deer",
        severity="critical",
        incident_type="injured",
        required_skills=["wildlife_handling", "veterinary"],
        priority="critical"
    )
    
    rescuers = [
        Rescuer(1, "John", Location(28.7041, 77.1025, "North Delhi"), 
                ["wildlife_handling", "veterinary"], True, "expert"),
        Rescuer(2, "Sarah", Location(28.5355, 77.3910, "Noida"), 
                ["wildlife_handling"], True, "intermediate")
    ]
    
    assignment = engine.assign_optimal_rescuer(incident, rescuers)
    if assignment['success']:
        print(f"✅ Assigned: {assignment['assigned_rescuer']['name']}")
        print(f"✅ Match score: {assignment['match_score']:.1f}")
        print(f"✅ ETA: {assignment['eta_minutes']} minutes")
