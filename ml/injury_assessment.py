"""
Injury Assessment Module
Uses Google Gemini Vision API (free tier) for animal injury assessment.
Requires: pip install google-genai
"""
from google import genai
from google.genai import types
import json
import re
from PIL import Image
import io
import os

MODEL = 'gemini-2.5-flash'


def _pil_to_bytes(image: Image.Image):
    buffer = io.BytesIO()
    fmt = image.format if image.format in ('JPEG', 'PNG', 'WEBP') else 'JPEG'
    image.save(buffer, format=fmt)
    buffer.seek(0)
    return buffer.read(), f"image/{fmt.lower()}"


class InjuryAssessor:
    """Assess animal injury severity using Google Gemini Vision API (new SDK)."""

    SEVERITY_LEVELS = ['minor', 'moderate', 'severe', 'critical']
    INJURY_TYPES = ['bleeding', 'fracture', 'entanglement', 'burn', 'wound', 'unknown']

    def __init__(self, model_path=None, device=None):
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set — check your .env file")
        self.client = genai.Client(api_key=api_key)
        self.model = MODEL
        print(f"✅ InjuryAssessor initialized with {MODEL} (key: ...{api_key[-6:]})")

    def predict(self, image_input, generate_attention_map: bool = False) -> dict:
        if isinstance(image_input, str):
            image = Image.open(image_input).convert('RGB')
        else:
            image = image_input.convert('RGB')

        img_bytes, mime_type = _pil_to_bytes(image)

        severity_options = ', '.join(self.SEVERITY_LEVELS)
        injury_options = ', '.join(self.INJURY_TYPES)

        prompt = f"""You are a veterinary triage expert. Assess the animal's injury in this image.
Return ONLY a valid JSON object with no markdown or explanation:
{{
  "animal_visible": true,
  "severity_level": "moderate",
  "severity_confidence": 0.82,
  "severity_probabilities": {{
    "minor": 0.10,
    "moderate": 0.82,
    "severe": 0.06,
    "critical": 0.02
  }},
  "injury_type": "wound",
  "injury_confidence": 0.75,
  "injury_probabilities": {{
    "bleeding": 0.10,
    "fracture": 0.05,
    "entanglement": 0.03,
    "burn": 0.02,
    "wound": 0.75,
    "unknown": 0.05
  }},
  "priority": "medium",
  "visible_signs": ["describe what you see"],
  "recommendations": ["practical rescue advice"]
}}
Severity levels: {severity_options}
Injury types: {injury_options}
Priority levels: critical, high, medium, low
- severity_probabilities must sum to 1.0
- injury_probabilities must sum to 1.0
- If healthy animal with no injuries, use severity_level "minor" and injury_type "unknown"
- When in doubt, err toward higher severity"""

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_bytes(data=img_bytes, mime_type=mime_type),
                    prompt,
                ]
            )

            raw = response.text.strip()
            raw = re.sub(r'^```(?:json)?\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            parsed = json.loads(raw)

        except json.JSONDecodeError as e:
            return {'success': False, 'error': f'Failed to parse Gemini response: {e}'}
        except Exception as e:
            return {'success': False, 'error': f'Gemini API error: {str(e)}'}

        severity_level = parsed.get('severity_level', 'unknown')
        if severity_level not in self.SEVERITY_LEVELS:
            severity_level = 'unknown'

        injury_type = parsed.get('injury_type', 'unknown')
        if injury_type not in self.INJURY_TYPES:
            injury_type = 'unknown'

        severity_probs = parsed.get('severity_probabilities', {
            lvl: (1.0 if lvl == severity_level else 0.0) for lvl in self.SEVERITY_LEVELS
        })
        injury_probs = parsed.get('injury_probabilities', {
            it: (1.0 if it == injury_type else 0.0) for it in self.INJURY_TYPES
        })

        priority = parsed.get('priority', self._priority_from_severity(severity_level))
        recommendations = parsed.get('recommendations', self._default_recommendations(severity_level, injury_type))

        return {
            'success': True,
            'severity': {
                'level': severity_level,
                'confidence': float(parsed.get('severity_confidence', 0.7)),
                'all_probabilities': severity_probs,
            },
            'injury_type': {
                'type': injury_type,
                'confidence': float(parsed.get('injury_confidence', 0.7)),
                'all_probabilities': injury_probs,
            },
            'priority': priority,
            'attention_map': None,
            'recommendations': recommendations,
            'visible_signs': parsed.get('visible_signs', []),
            'animal_visible': parsed.get('animal_visible', True),
            'model_info': {
                'architecture': f'Google {MODEL} (free)',
                'device': 'cloud'
            }
        }

    def _priority_from_severity(self, severity: str) -> str:
        return {'critical': 'critical', 'severe': 'high', 'moderate': 'medium', 'minor': 'low'}.get(severity, 'medium')

    def _default_recommendations(self, severity: str, injury_type: str) -> list:
        recs = []
        if severity in ('critical', 'severe'):
            recs.append("⚠️ URGENT: Immediate veterinary attention required")
            recs.append("Deploy experienced rescue team with medical equipment")
        if injury_type == 'bleeding':
            recs.append("Bring hemostatic agents and bandages")
        elif injury_type == 'fracture':
            recs.append("Bring splints and immobilization equipment")
        elif injury_type == 'entanglement':
            recs.append("Bring cutting tools and sedation equipment")
        elif injury_type == 'burn':
            recs.append("Bring burn treatment supplies and pain management")
        if severity == 'critical':
            recs.append("Consider air transport if available")
            recs.append("Alert nearest wildlife hospital")
        return recs or ["Monitor the animal and contact local wildlife rescue"]


if __name__ == '__main__':
    print("🏥 InjuryAssessor ready")
    assessor = InjuryAssessor()
    print(f"✅ Severity levels: {assessor.SEVERITY_LEVELS}")