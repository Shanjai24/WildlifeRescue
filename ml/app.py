"""
Wildlife ML Prediction API
Flask REST API for ML model predictions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
import base64
from dotenv import load_dotenv
from groq import Groq

# Load .env file from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure Groq client
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
print(f"🔑 Groq API Key loaded: {'✅ Yes' if GROQ_API_KEY else '❌ Missing'}")


# Load models at startup
print("Loading ML models...")
priority_model = joblib.load('models/priority_classifier.joblib')
success_model = joblib.load('models/success_predictor.joblib')
label_encoders = joblib.load('models/label_encoders.joblib')
print("✅ Models loaded successfully!")

def encode_feature(feature_name, value):
    """Encode categorical feature using saved encoder"""
    if feature_name in label_encoders:
        try:
            return label_encoders[feature_name].transform([value])[0]
        except:
            # If unseen category, return most common encoding (0)
            return 0
    return value

def extract_keywords(description):
    """Extract binary features from description text"""
    desc_lower = description.lower()
    
    keywords = {
        'has_bleeding': any(word in desc_lower for word in ['bleeding', 'blood', 'wounded']),
        'has_trapped': any(word in desc_lower for word in ['trapped', 'stuck', 'caught']),
        'has_unconscious': any(word in desc_lower for word in ['unconscious', 'unresponsive', 'collapsed']),
        'near_highway': any(word in desc_lower for word in ['highway', 'road', 'street', 'traffic']),
        'in_storm': any(word in desc_lower for word in ['storm', 'flood', 'heavy rain'])
    }
    
    return {k: 1 if v else 0 for k, v in keywords.items()}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Wildlife ML API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict/priority', methods=['POST'])
def predict_priority():
    """
    Predict incident priority
    
    Request body:
    {
        "animal_category": "wildlife",
        "incident_type": "injured",
        "time_of_day": "night",
        "location_type": "forest",
        "weather": "storm",
        "description": "Deer found bleeding near highway"
    }
    """
    try:
        data = request.json
        
        # Extract keywords from description
        keywords = extract_keywords(data.get('description', ''))
        
        # Prepare features
        features = [
            encode_feature('animal_category', data.get('animal_category', 'other')),
            encode_feature('incident_type', data.get('incident_type', 'other')),
            encode_feature('time_of_day', data.get('time_of_day', 'afternoon')),
            encode_feature('location_type', data.get('location_type', 'urban')),
            encode_feature('weather', data.get('weather', 'clear')),
            keywords['has_bleeding'],
            keywords['has_trapped'],
            keywords['has_unconscious'],
            keywords['near_highway'],
            keywords['in_storm']
        ]
        
        # Predict
        prediction = priority_model.predict([features])[0]
        probabilities = priority_model.predict_proba([features])[0]
        
        # Get class probabilities
        classes = priority_model.classes_
        prob_dict = {cls: float(prob) for cls, prob in zip(classes, probabilities)}
        
        # Get confidence
        confidence = float(max(probabilities))
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'confidence': confidence,
            'probabilities': prob_dict,
            'keywords_detected': keywords,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/predict/success', methods=['POST'])
def predict_success():
    """
    Predict rescue success probability
    
    Request body:
    {
        "priority": "critical",
        "animal_category": "wildlife",
        "incident_type": "injured",
        "org_type": "wildlife_center",
        "response_time_min": 30,
        "distance_km": 12.5,
        "weather": "clear",
        "location_type": "forest"
    }
    """
    try:
        data = request.json
        
        # Prepare features
        features = [
            encode_feature('priority', data.get('priority', 'medium')),
            encode_feature('animal_category', data.get('animal_category', 'other')),
            encode_feature('incident_type', data.get('incident_type', 'other')),
            encode_feature('org_type', data.get('org_type', 'blue_cross')),
            float(data.get('response_time_min', 30)),
            float(data.get('distance_km', 10)),
            encode_feature('weather', data.get('weather', 'clear')),
            encode_feature('location_type', data.get('location_type', 'urban'))
        ]
        
        # Predict
        prediction = success_model.predict([features])[0]
        probability = success_model.predict_proba([features])[0]
        
        success_prob = float(probability[1])  # Probability of success (class 1)
        
        # Generate recommendation
        if success_prob >= 0.8:
            recommendation = "High success probability - Proceed with standard rescue protocol"
        elif success_prob >= 0.6:
            recommendation = "Moderate success probability - Consider backup resources"
        else:
            recommendation = "Lower success probability - May require specialized equipment or additional personnel"
        
        return jsonify({
            'success': True,
            'prediction': 'success' if prediction == 1 else 'failure',
            'success_probability': success_prob,
            'failure_probability': float(probability[0]),
            'recommendation': recommendation,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/predict/combined', methods=['POST'])
def predict_combined():
    """
    Combined prediction - both priority and success
    
    Request body: combination of both endpoints
    """
    try:
        data = request.json
        
        # Get priority prediction
        priority_response = predict_priority()
        priority_data = priority_response.get_json()
        
        if priority_data['success']:
            predicted_priority = priority_data['prediction']
            
            # Get success prediction with predicted priority
            success_data = {
                **data,
                'priority': predicted_priority
            }
            
            # Manually create features for success prediction
            features = [
                encode_feature('priority', predicted_priority),
                encode_feature('animal_category', data.get('animal_category', 'other')),
                encode_feature('incident_type', data.get('incident_type', 'other')),
                encode_feature('org_type', data.get('org_type', 'blue_cross')),
                float(data.get('response_time_min', 30)),
                float(data.get('distance_km', 10)),
                encode_feature('weather', data.get('weather', 'clear')),
                encode_feature('location_type', data.get('location_type', 'urban'))
            ]
            
            success_pred = success_model.predict([features])[0]
            success_proba = success_model.predict_proba([features])[0]
            
            return jsonify({
                'success': True,
                'priority': {
                    'prediction': predicted_priority,
                    'confidence': priority_data['confidence'],
                    'probabilities': priority_data['probabilities']
                },
                'rescue_success': {
                    'prediction': 'success' if success_pred == 1 else 'failure',
                    'probability': float(success_proba[1])
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return priority_response
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information and metadata"""
    try:
        import json
        with open('models/metadata.json', 'r') as f:
            metadata = json.load(f)
        
        return jsonify({
            'success': True,
            'models': {
                'priority_classifier': {
                    'type': 'Random Forest Classifier',
                    'purpose': 'Classify incident priority (low/medium/critical)',
                    'features': metadata['priority_features']
                },
                'success_predictor': {
                    'type': 'Logistic Regression',
                    'purpose': 'Predict rescue success probability',
                    'features': metadata['success_features']
                }
            },
            'metadata': metadata
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/ai/identify-species', methods=['POST'])
def identify_species():
    """Identify animal species from an uploaded image using Groq Vision"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image uploaded'}), 400

        if not GROQ_API_KEY:
            return jsonify({'success': False, 'error': 'Groq API key not configured'}), 500

        image_file = request.files['image']
        image_bytes = image_file.read()
        mime_type = image_file.content_type or 'image/jpeg'
        b64_image = base64.b64encode(image_bytes).decode('utf-8')

        client = Groq(api_key=GROQ_API_KEY)

        prompt = """Analyze this image and identify the animal species.
Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "success": true,
  "is_animal": true,
  "top_prediction": {
    "species": "Common Name",
    "scientific_name": "Scientific Name",
    "confidence": 0.92,
    "conservation_status": "Least Concern"
  },
  "all_predictions": [
    {"species": "...", "scientific_name": "...", "confidence": 0.92, "conservation_status": "..."}
  ],
  "notes": "Any relevant notes about the animal or image",
  "model_info": {"architecture": "Groq Vision"}
}
If no animal is visible, set is_animal to false and use "Unknown" for species fields with confidence 0."""

        response = client.chat.completions.create(
            model='meta-llama/llama-4-scout-17b-16e-instruct',
            messages=[{
                'role': 'user',
                'content': [
                    {'type': 'image_url', 'image_url': {'url': f'data:{mime_type};base64,{b64_image}'}},
                    {'type': 'text', 'text': prompt}
                ]
            }],
            temperature=0.1
        )

        text = response.choices[0].message.content.strip()
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        import json
        result = json.loads(text.strip())
        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ai/assess-injury', methods=['POST'])
def assess_injury():
    """Assess animal injury/condition from an uploaded image using Groq Vision"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image uploaded'}), 400

        if not GROQ_API_KEY:
            return jsonify({'success': False, 'error': 'Groq API key not configured'}), 500

        image_file = request.files['image']
        image_bytes = image_file.read()
        mime_type = image_file.content_type or 'image/jpeg'
        b64_image = base64.b64encode(image_bytes).decode('utf-8')

        client = Groq(api_key=GROQ_API_KEY)

        prompt = """Analyze this image and assess the animal's condition/injury.
Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format:
{
  "success": true,
  "severity": {
    "level": "moderate",
    "confidence": 0.85
  },
  "injury_type": {
    "type": "laceration",
    "confidence": 0.78
  },
  "priority": "medium",
  "visible_signs": ["sign 1", "sign 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "model_info": {"architecture": "Groq Vision"}
}
Severity level must be one of: critical, severe, moderate, mild.
Priority must be one of: critical, high, medium, low."""

        response = client.chat.completions.create(
            model='meta-llama/llama-4-scout-17b-16e-instruct',
            messages=[{
                'role': 'user',
                'content': [
                    {'type': 'image_url', 'image_url': {'url': f'data:{mime_type};base64,{b64_image}'}},
                    {'type': 'text', 'text': prompt}
                ]
            }],
            temperature=0.1
        )

        text = response.choices[0].message.content.strip()
        if text.startswith('```'):
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        import json
        result = json.loads(text.strip())
        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("🦁 WILDLIFE ML PREDICTION API")
    print("=" * 60)
    print("\nEndpoints:")
    print("  GET  /health              - Health check")
    print("  POST /predict/priority    - Predict incident priority")
    print("  POST /predict/success     - Predict rescue success")
    print("  POST /predict/combined    - Combined prediction")
    print("  GET  /model/info          - Model information")
    print("\n" + "=" * 60)
    print("🚀 Starting Flask server on http://localhost:5000")
    print("=" * 60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)