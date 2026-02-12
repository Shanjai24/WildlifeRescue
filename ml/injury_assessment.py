"""
Injury Assessment Module
Deep learning model to assess injury severity from photos
"""
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import cv2
from pathlib import Path

class InjuryAssessor:
    """Assess animal injury severity from images"""
    
    # Severity levels
    SEVERITY_LEVELS = ['minor', 'moderate', 'severe', 'critical']
    
    # Injury types
    INJURY_TYPES = ['bleeding', 'fracture', 'entanglement', 'burn', 'wound', 'unknown']
    
    def __init__(self, model_path='models/injury_classifier.pth', device=None):
        """
        Initialize injury assessor
        
        Args:
            model_path: Path to trained model weights
            device: torch device (cuda/cpu)
        """
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Multi-task model: severity classification + injury type classification
        self.model = models.resnet50(weights=None)
        
        # Replace final layer with multi-task heads
        num_features = self.model.fc.in_features
        self.model.fc = nn.Identity()  # Remove original FC layer
        
        # Add custom heads
        self.severity_head = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, len(self.SEVERITY_LEVELS))
        )
        
        self.injury_type_head = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, len(self.INJURY_TYPES))
        )
        
        # Load trained weights if available
        if Path(model_path).exists():
            checkpoint = torch.load(model_path, map_location=self.device)
            self.model.load_state_dict(checkpoint['backbone'])
            self.severity_head.load_state_dict(checkpoint['severity_head'])
            self.injury_type_head.load_state_dict(checkpoint['injury_type_head'])
            print(f"✅ Loaded injury assessment model from {model_path}")
        else:
            print(f"⚠️ Model not found at {model_path}, using untrained model")
        
        self.model.to(self.device)
        self.severity_head.to(self.device)
        self.injury_type_head.to(self.device)
        
        self.model.eval()
        self.severity_head.eval()
        self.injury_type_head.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def predict(self, image_path, generate_attention_map=True):
        """
        Assess injury from image
        
        Args:
            image_path: Path to image file or PIL Image
            generate_attention_map: Whether to generate attention map
            
        Returns:
            dict with assessment results
        """
        # Load and preprocess image
        if isinstance(image_path, str):
            image = Image.open(image_path).convert('RGB')
            original_image = cv2.imread(image_path)
        else:
            image = image_path.convert('RGB')
            original_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        with torch.no_grad():
            features = self.model(img_tensor)
            
            # Severity prediction
            severity_logits = self.severity_head(features)
            severity_probs = torch.nn.functional.softmax(severity_logits, dim=1)
            severity_idx = torch.argmax(severity_probs, dim=1).item()
            severity_confidence = severity_probs[0, severity_idx].item()
            
            # Injury type prediction
            injury_logits = self.injury_type_head(features)
            injury_probs = torch.nn.functional.softmax(injury_logits, dim=1)
            injury_idx = torch.argmax(injury_probs, dim=1).item()
            injury_confidence = injury_probs[0, injury_idx].item()
        
        # Generate attention map (Grad-CAM)
        attention_map_path = None
        if generate_attention_map:
            attention_map_path = self._generate_attention_map(img_tensor, original_image)
        
        # Determine priority escalation
        priority = self._determine_priority(severity_idx, injury_idx)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            self.SEVERITY_LEVELS[severity_idx],
            self.INJURY_TYPES[injury_idx]
        )
        
        return {
            'success': True,
            'severity': {
                'level': self.SEVERITY_LEVELS[severity_idx],
                'confidence': float(severity_confidence),
                'all_probabilities': {
                    level: float(prob) 
                    for level, prob in zip(self.SEVERITY_LEVELS, severity_probs[0])
                }
            },
            'injury_type': {
                'type': self.INJURY_TYPES[injury_idx],
                'confidence': float(injury_confidence),
                'all_probabilities': {
                    itype: float(prob) 
                    for itype, prob in zip(self.INJURY_TYPES, injury_probs[0])
                }
            },
            'priority': priority,
            'attention_map': attention_map_path,
            'recommendations': recommendations
        }
    
    def _generate_attention_map(self, img_tensor, original_image):
        """Generate Grad-CAM attention map (simplified version)"""
        # For now, return None - full Grad-CAM implementation would be more complex
        # In production, use libraries like pytorch-grad-cam
        return None
    
    def _determine_priority(self, severity_idx, injury_idx):
        """Determine incident priority based on assessment"""
        severity = self.SEVERITY_LEVELS[severity_idx]
        
        if severity == 'critical':
            return 'critical'
        elif severity == 'severe':
            return 'critical' if injury_idx in [0, 1] else 'high'  # bleeding or fracture
        elif severity == 'moderate':
            return 'medium'
        else:
            return 'low'
    
    def _generate_recommendations(self, severity, injury_type):
        """Generate action recommendations"""
        recommendations = []
        
        if severity in ['critical', 'severe']:
            recommendations.append("⚠️ URGENT: Immediate veterinary attention required")
            recommendations.append("Deploy experienced rescue team with medical equipment")
        
        if injury_type == 'bleeding':
            recommendations.append("Bring hemostatic agents and bandages")
        elif injury_type == 'fracture':
            recommendations.append("Bring splints and immobilization equipment")
        elif injury_type == 'entanglement':
            recommendations.append("Bring cutting tools and sedation equipment")
        elif injury_type == 'burn':
            recommendations.append("Bring burn treatment supplies and pain management")
        
        if severity == 'critical':
            recommendations.append("Consider air transport if available")
            recommendations.append("Alert nearest wildlife hospital")
        
        return recommendations


if __name__ == '__main__':
    print("\n🏥 Testing Injury Assessor...")
    assessor = InjuryAssessor()
    print(f"✅ Model loaded - Severity levels: {assessor.SEVERITY_LEVELS}")
    print(f"✅ Injury types: {assessor.INJURY_TYPES}")
