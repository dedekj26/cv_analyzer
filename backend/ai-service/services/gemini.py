import os
import json
import google.generativeai as genai

# Setup Gemini API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def analyze_cv_with_gemini(cv_text: str) -> dict:
    if not GEMINI_API_KEY:
        # Return mock data if no API key is present for testing
        return {
            "score": 85,
            "label": "Sangat Bagus",
            "strengths": ["Pengalaman relevan", "Pendidikan sesuai"],
            "weaknesses": ["Kurang detail pada project"],
            "recommendations": ["Tambahkan metrik keberhasilan"]
        }
        
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Analyze the following CV and evaluate it.
    Provide the response strictly in JSON format with the following keys:
    - score (integer 0-100)
    - label (string: 'Kurang', 'Cukup', 'Bagus', 'Sangat Bagus')
    - strengths (list of strings)
    - weaknesses (list of strings)
    - recommendations (list of strings)
    
    CV Text:
    {cv_text}
    """
    
    try:
        response = model.generate_content(prompt)
        # Extract JSON from response text. Gemini sometimes wraps it in ```json ... ```
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        return json.loads(response_text.strip())
    except Exception as e:
        raise Exception(f"Error calling Gemini: {str(e)}")
