"""
Wildlife Incident ML Model Training
Trains two models:
1. Random Forest Classifier - Priority Classification
2. Logistic Regression - Rescue Success Prediction
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib
import json

class WildlifeMLTrainer:
    def __init__(self, data_path):
        """Initialize trainer with dataset"""
        print("📊 Loading dataset...")
        self.df = pd.read_csv(data_path)
        print(f"✅ Loaded {len(self.df)} records\n")
        
        self.label_encoders = {}
        self.priority_model = None
        self.success_model = None
        
    def preprocess_data(self):
        """Encode categorical features"""
        print("🔧 Preprocessing data...")
        
        categorical_cols = ['animal_category', 'incident_type', 'time_of_day', 
                           'location_type', 'weather', 'org_type']
        
        for col in categorical_cols:
            le = LabelEncoder()
            self.df[f'{col}_encoded'] = le.fit_transform(self.df[col])
            self.label_encoders[col] = le
        
        # Encode priority for model 2
        le_priority = LabelEncoder()
        self.df['priority_encoded'] = le_priority.fit_transform(self.df['priority'])
        self.label_encoders['priority'] = le_priority
        
        print("✅ Preprocessing complete\n")
    
    def train_priority_model(self):
        """Train Random Forest for priority classification"""
        print("🌲 Training Priority Classification Model (Random Forest)...")
        
        # Features for priority prediction
        feature_cols = [
            'animal_category_encoded', 'incident_type_encoded', 
            'time_of_day_encoded', 'location_type_encoded', 
            'weather_encoded', 'has_bleeding', 'has_trapped',
            'has_unconscious', 'near_highway', 'in_storm'
        ]
        
        X = self.df[feature_cols]
        y = self.df['priority']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train Random Forest
        self.priority_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        self.priority_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.priority_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n📈 Model Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print(f"\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': feature_cols,
            'importance': self.priority_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Feature Importance:")
        print(feature_importance.to_string(index=False))
        
        return accuracy
    
    def train_success_model(self):
        """Train Logistic Regression for rescue success prediction"""
        print("\n📊 Training Rescue Success Prediction Model (Logistic Regression)...")
        
        # Features for success prediction
        feature_cols = [
            'priority_encoded', 'animal_category_encoded', 
            'incident_type_encoded', 'org_type_encoded',
            'response_time_min', 'distance_km', 'weather_encoded',
            'location_type_encoded'
        ]
        
        X = self.df[feature_cols]
        y = self.df['rescue_success']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train Logistic Regression
        self.success_model = LogisticRegression(
            max_iter=1000,
            random_state=42,
            class_weight='balanced'
        )
        
        self.success_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.success_model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n📈 Model Performance:")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred))
        print(f"\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))
        
        return accuracy
    
    def save_models(self):
        """Save trained models and encoders"""
        print("\n💾 Saving models...")
        
        # Save models
        joblib.dump(self.priority_model, 'models/priority_classifier.joblib')
        joblib.dump(self.success_model, 'models/success_predictor.joblib')
        
        # Save label encoders
        joblib.dump(self.label_encoders, 'models/label_encoders.joblib')
        
        # Save metadata
        metadata = {
            'priority_features': [
                'animal_category', 'incident_type', 'time_of_day',
                'location_type', 'weather', 'has_bleeding', 'has_trapped',
                'has_unconscious', 'near_highway', 'in_storm'
            ],
            'success_features': [
                'priority', 'animal_category', 'incident_type', 'org_type',
                'response_time_min', 'distance_km', 'weather', 'location_type'
            ],
            'priority_classes': ['critical', 'low', 'medium'],
            'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
            'dataset_size': len(self.df)
        }
        
        with open('models/metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print("✅ Models saved successfully!")
        print("   - priority_classifier.joblib")
        print("   - success_predictor.joblib")
        print("   - label_encoders.joblib")
        print("   - metadata.json")

def main():
    print("=" * 60)
    print("🦁 WILDLIFE INCIDENT ML MODEL TRAINING")
    print("=" * 60 + "\n")
    
    # Create models directory
    import os
    os.makedirs('models', exist_ok=True)
    
    # Initialize trainer
    trainer = WildlifeMLTrainer('../data/wildlife_incidents.csv')
    
    # Preprocess
    trainer.preprocess_data()
    
    # Train models
    priority_acc = trainer.train_priority_model()
    success_acc = trainer.train_success_model()
    
    # Save models
    trainer.save_models()
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print(f"Priority Model Accuracy: {priority_acc:.2%}")
    print(f"Success Model Accuracy: {success_acc:.2%}")
    print("=" * 60)

if __name__ == "__main__":
    main()