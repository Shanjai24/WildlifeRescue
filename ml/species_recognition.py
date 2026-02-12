"""
Species Recognition Module
Uses transfer learning with pre-trained models for wildlife species identification
"""
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import numpy as np
import json
from pathlib import Path

class SpeciesRecognizer:
    """Wildlife species identification using deep learning"""
    
    def __init__(self, model_path='models/species_classifier.pth', device=None):
        """
        Initialize species recognizer
        
        Args:
            model_path: Path to trained model weights
            device: torch device (cuda/cpu)
        """
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load species metadata
        metadata_path = Path(model_path).parent / 'species_metadata.json'
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        
        self.species_list = self.metadata['species_list']
        self.num_classes = len(self.species_list)
        
        # Initialize model (EfficientNet-B0 for balance of accuracy and speed)
        self.model = models.efficientnet_b0(weights=None)
        self.model.classifier[1] = nn.Linear(self.model.classifier[1].in_features, self.num_classes)
        
        # Load trained weights if available
        if Path(model_path).exists():
            self.model.load_state_dict(torch.load(model_path, map_location=self.device))
            print(f"✅ Loaded species model from {model_path}")
        else:
            print(f"⚠️ Model not found at {model_path}, using untrained model")
        
        self.model.to(self.device)
        self.model.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def predict(self, image_path, top_k=5):
        """
        Predict species from image
        
        Args:
            image_path: Path to image file or PIL Image
            top_k: Number of top predictions to return
            
        Returns:
            dict with predictions and metadata
        """
        # Load and preprocess image
        if isinstance(image_path, str):
            image = Image.open(image_path).convert('RGB')
        else:
            image = image_path.convert('RGB')
        
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            top_probs, top_indices = torch.topk(probabilities, top_k)
        
        # Format results
        predictions = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            species_name = self.species_list[idx.item()]
            predictions.append({
                'species': species_name,
                'confidence': float(prob.item()),
                'scientific_name': self.metadata.get('scientific_names', {}).get(species_name, 'Unknown'),
                'conservation_status': self.metadata.get('conservation_status', {}).get(species_name, 'Unknown')
            })
        
        return {
            'success': True,
            'top_prediction': predictions[0],
            'all_predictions': predictions,
            'model_info': {
                'architecture': 'EfficientNet-B0',
                'num_classes': self.num_classes,
                'device': str(self.device)
            }
        }
    
    def predict_batch(self, image_paths, top_k=5):
        """Predict species for multiple images"""
        results = []
        for img_path in image_paths:
            results.append(self.predict(img_path, top_k))
        return results


def create_default_species_metadata():
    """Create default species metadata for common wildlife"""
    species_data = {
        'species_list': [
            'Deer', 'Elephant', 'Tiger', 'Leopard', 'Lion', 'Bear', 'Wolf', 
            'Fox', 'Monkey', 'Snake', 'Eagle', 'Owl', 'Peacock', 'Parrot',
            'Crocodile', 'Turtle', 'Rabbit', 'Squirrel', 'Raccoon', 'Otter',
            'Bison', 'Buffalo', 'Zebra', 'Giraffe', 'Rhino', 'Hippo',
            'Cheetah', 'Jaguar', 'Puma', 'Lynx', 'Hyena', 'Wild Dog',
            'Boar', 'Antelope', 'Gazelle', 'Moose', 'Elk', 'Reindeer',
            'Penguin', 'Seal', 'Dolphin', 'Whale', 'Shark', 'Stingray',
            'Kangaroo', 'Koala', 'Panda', 'Gorilla', 'Chimpanzee', 'Orangutan'
        ],
        'scientific_names': {
            'Deer': 'Cervidae',
            'Elephant': 'Elephantidae',
            'Tiger': 'Panthera tigris',
            'Leopard': 'Panthera pardus',
            'Lion': 'Panthera leo',
            'Bear': 'Ursidae',
            'Wolf': 'Canis lupus',
            'Eagle': 'Aquila',
            'Peacock': 'Pavo cristatus'
        },
        'conservation_status': {
            'Tiger': 'Endangered',
            'Elephant': 'Endangered',
            'Leopard': 'Vulnerable',
            'Lion': 'Vulnerable',
            'Rhino': 'Critically Endangered',
            'Panda': 'Vulnerable',
            'Gorilla': 'Critically Endangered',
            'Orangutan': 'Critically Endangered',
            'Cheetah': 'Vulnerable'
        }
    }
    
    # Save metadata
    metadata_path = Path('models/species_metadata.json')
    metadata_path.parent.mkdir(exist_ok=True)
    with open(metadata_path, 'w') as f:
        json.dump(species_data, f, indent=2)
    
    print(f"✅ Created species metadata with {len(species_data['species_list'])} species")
    return species_data


if __name__ == '__main__':
    # Create default metadata if it doesn't exist
    metadata_path = Path('models/species_metadata.json')
    if not metadata_path.exists():
        create_default_species_metadata()
    
    # Test the recognizer
    print("\n🔍 Testing Species Recognizer...")
    recognizer = SpeciesRecognizer()
    print(f"✅ Model loaded with {recognizer.num_classes} species classes")
