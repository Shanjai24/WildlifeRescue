"""
NLP Processor Module
Natural language processing for intelligent report handling
"""
from transformers import pipeline
import re
from typing import Dict, List
import json

class NLPProcessor:
    """Natural language processing for wildlife reports"""
    
    # Predefined categories
    CATEGORIES = [
        'injured_animal',
        'trapped_animal',
        'orphaned_animal',
        'vehicle_collision',
        'poaching_activity',
        'habitat_destruction',
        'human_wildlife_conflict',
        'disease_outbreak',
        'other'
    ]
    
    # Urgency keywords
    URGENCY_KEYWORDS = {
        'critical': ['dying', 'bleeding', 'unconscious', 'severe', 'emergency', 'critical'],
        'high': ['injured', 'trapped', 'attacked', 'wounded', 'urgent'],
        'medium': ['stuck', 'lost', 'wandering', 'distressed'],
        'low': ['sighting', 'observation', 'spotted']
    }
    
    # Species keywords
    SPECIES_KEYWORDS = [
        'deer', 'elephant', 'tiger', 'leopard', 'lion', 'bear', 'wolf', 'fox',
        'monkey', 'snake', 'eagle', 'owl', 'peacock', 'parrot', 'crocodile',
        'turtle', 'rabbit', 'squirrel', 'bird', 'reptile', 'mammal'
    ]
    
    # Location keywords
    LOCATION_KEYWORDS = [
        'forest', 'highway', 'road', 'river', 'lake', 'mountain', 'village',
        'city', 'park', 'reserve', 'sanctuary', 'farm', 'residential'
    ]
    
    def __init__(self, use_transformers=False):
        """
        Initialize NLP processor
        
        Args:
            use_transformers: Whether to use transformer models (requires more resources)
        """
        self.use_transformers = use_transformers
        
        if use_transformers:
            try:
                # Load sentiment analysis model
                self.sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
                print("✅ Loaded sentiment analysis model")
            except Exception as e:
                print(f"⚠️ Could not load transformer models: {e}")
                self.use_transformers = False
    
    def categorize_report(self, description: str) -> Dict:
        """
        Automatically categorize incident report
        
        Args:
            description: Report description text
            
        Returns:
            Category predictions with confidence
        """
        desc_lower = description.lower()
        
        # Keyword-based categorization
        category_scores = {
            'injured_animal': self._count_keywords(desc_lower, ['injured', 'hurt', 'wounded', 'bleeding', 'broken']),
            'trapped_animal': self._count_keywords(desc_lower, ['trapped', 'stuck', 'caught', 'entangled', 'snared']),
            'orphaned_animal': self._count_keywords(desc_lower, ['orphan', 'baby', 'cub', 'alone', 'abandoned']),
            'vehicle_collision': self._count_keywords(desc_lower, ['hit', 'collision', 'accident', 'vehicle', 'car', 'truck']),
            'poaching_activity': self._count_keywords(desc_lower, ['poach', 'hunting', 'trap', 'illegal', 'gunshot']),
            'habitat_destruction': self._count_keywords(desc_lower, ['deforestation', 'destruction', 'clearing', 'development']),
            'human_wildlife_conflict': self._count_keywords(desc_lower, ['attack', 'conflict', 'aggressive', 'threatening']),
            'disease_outbreak': self._count_keywords(desc_lower, ['sick', 'disease', 'ill', 'outbreak', 'infection']),
        }
        
        # Get top category
        if max(category_scores.values()) == 0:
            top_category = 'other'
            confidence = 0.5
        else:
            top_category = max(category_scores, key=category_scores.get)
            total_score = sum(category_scores.values())
            confidence = category_scores[top_category] / max(total_score, 1)
        
        return {
            'category': top_category,
            'confidence': float(min(confidence, 1.0)),
            'all_scores': category_scores
        }
    
    def extract_entities(self, description: str) -> Dict:
        """
        Extract key entities from report text
        
        Args:
            description: Report description text
            
        Returns:
            Extracted entities (species, location, urgency, etc.)
        """
        desc_lower = description.lower()
        
        # Extract species
        detected_species = [s for s in self.SPECIES_KEYWORDS if s in desc_lower]
        
        # Extract location type
        detected_locations = [l for l in self.LOCATION_KEYWORDS if l in desc_lower]
        
        # Determine urgency
        urgency = self._determine_urgency(desc_lower)
        
        # Extract numbers (could be count of animals)
        numbers = re.findall(r'\b\d+\b', description)
        
        return {
            'species': detected_species[0] if detected_species else 'unknown',
            'all_species_mentioned': detected_species,
            'location_type': detected_locations[0] if detected_locations else 'unknown',
            'all_locations_mentioned': detected_locations,
            'urgency': urgency,
            'numbers_mentioned': [int(n) for n in numbers],
            'animal_count': int(numbers[0]) if numbers else 1
        }
    
    def analyze_sentiment(self, description: str) -> Dict:
        """
        Analyze sentiment of report (indicates reporter's emotional state)
        
        Args:
            description: Report description text
            
        Returns:
            Sentiment analysis results
        """
        if self.use_transformers and hasattr(self, 'sentiment_analyzer'):
            try:
                result = self.sentiment_analyzer(description[:512])[0]  # Limit length
                return {
                    'sentiment': result['label'].lower(),
                    'confidence': float(result['score'])
                }
            except:
                pass
        
        # Fallback: simple keyword-based sentiment
        desc_lower = description.lower()
        
        positive_words = ['safe', 'rescued', 'helped', 'recovered', 'healthy']
        negative_words = ['dying', 'suffering', 'critical', 'severe', 'emergency', 'urgent']
        
        pos_count = sum(1 for word in positive_words if word in desc_lower)
        neg_count = sum(1 for word in negative_words if word in desc_lower)
        
        if neg_count > pos_count:
            return {'sentiment': 'negative', 'confidence': 0.7}
        elif pos_count > neg_count:
            return {'sentiment': 'positive', 'confidence': 0.7}
        else:
            return {'sentiment': 'neutral', 'confidence': 0.6}
    
    def generate_tags(self, description: str) -> List[str]:
        """
        Generate relevant tags for report
        
        Args:
            description: Report description text
            
        Returns:
            List of tags
        """
        tags = []
        desc_lower = description.lower()
        
        # Add urgency tag
        urgency = self._determine_urgency(desc_lower)
        tags.append(f"urgency:{urgency}")
        
        # Add species tags
        for species in self.SPECIES_KEYWORDS:
            if species in desc_lower:
                tags.append(f"species:{species}")
        
        # Add location tags
        for location in self.LOCATION_KEYWORDS:
            if location in desc_lower:
                tags.append(f"location:{location}")
        
        # Add condition tags
        if any(word in desc_lower for word in ['injured', 'hurt', 'wounded']):
            tags.append('condition:injured')
        if any(word in desc_lower for word in ['trapped', 'stuck']):
            tags.append('condition:trapped')
        if any(word in desc_lower for word in ['baby', 'cub', 'young']):
            tags.append('age:juvenile')
        
        return tags
    
    def assess_report_quality(self, description: str) -> Dict:
        """
        Assess quality and completeness of report
        
        Args:
            description: Report description text
            
        Returns:
            Quality assessment
        """
        quality_score = 0
        max_score = 5
        issues = []
        suggestions = []
        
        # Check length
        if len(description) < 20:
            issues.append("Report is too short")
            suggestions.append("Please provide more details about the incident")
        else:
            quality_score += 1
        
        # Check for species mention
        if any(s in description.lower() for s in self.SPECIES_KEYWORDS):
            quality_score += 1
        else:
            issues.append("Species not clearly identified")
            suggestions.append("Please specify the type of animal")
        
        # Check for location mention
        if any(l in description.lower() for l in self.LOCATION_KEYWORDS):
            quality_score += 1
        else:
            issues.append("Location type not specified")
            suggestions.append("Please describe the location (forest, road, etc.)")
        
        # Check for condition description
        condition_words = ['injured', 'trapped', 'sick', 'bleeding', 'stuck']
        if any(w in description.lower() for w in condition_words):
            quality_score += 1
        else:
            issues.append("Animal condition not described")
            suggestions.append("Please describe the animal's condition")
        
        # Check for urgency indicators
        if self._determine_urgency(description.lower()) != 'low':
            quality_score += 1
        
        return {
            'quality_score': quality_score,
            'max_score': max_score,
            'quality_percentage': (quality_score / max_score) * 100,
            'quality_level': 'high' if quality_score >= 4 else 'medium' if quality_score >= 2 else 'low',
            'issues': issues,
            'suggestions': suggestions
        }
    
    def process_report(self, description: str) -> Dict:
        """
        Complete NLP processing pipeline
        
        Args:
            description: Report description text
            
        Returns:
            Complete NLP analysis
        """
        return {
            'success': True,
            'original_text': description,
            'category': self.categorize_report(description),
            'entities': self.extract_entities(description),
            'sentiment': self.analyze_sentiment(description),
            'tags': self.generate_tags(description),
            'quality_assessment': self.assess_report_quality(description)
        }
    
    def _count_keywords(self, text: str, keywords: List[str]) -> int:
        """Count occurrences of keywords in text"""
        return sum(1 for keyword in keywords if keyword in text)
    
    def _determine_urgency(self, text: str) -> str:
        """Determine urgency level from text"""
        for level, keywords in self.URGENCY_KEYWORDS.items():
            if any(keyword in text for keyword in keywords):
                return level
        return 'low'


if __name__ == '__main__':
    print("\n💬 Testing NLP Processor...")
    processor = NLPProcessor(use_transformers=False)
    
    # Test with sample report
    sample_report = "Found an injured deer on the highway. It's bleeding and can't walk. Needs urgent help!"
    
    result = processor.process_report(sample_report)
    print(f"✅ Category: {result['category']['category']}")
    print(f"✅ Species: {result['entities']['species']}")
    print(f"✅ Urgency: {result['entities']['urgency']}")
    print(f"✅ Quality: {result['quality_assessment']['quality_level']}")
    print(f"✅ Tags: {', '.join(result['tags'])}")
