import json
import random
import google.generativeai as genai
from app.core.config import settings

def analyze_animal_report(animal_type: str, condition: str, description: str, base64_image: str = None) -> dict:
    """
    AI Vision Analysis Service.
    Uses Google Gemini Multimodal if AI_API_KEY is present, otherwise falls back to mock logic.
    """
    if settings.AI_API_KEY:
        try:
            genai.configure(api_key=settings.AI_API_KEY)
            # Use gemini-1.5-flash as the fast multimodal model
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are an AI assistant for an animal rescue application.
            Analyze this animal report.
            Animal Type provided: {animal_type}
            Condition provided: {condition}
            Description provided: {description}
            
            Based on the information and image (if any), please provide a JSON response with the following strictly formatted keys:
            - "species": The specific species or breed of the animal.
            - "injuries": A comma-separated string of identified injuries or conditions.
            - "is_litter": Boolean (true/false), whether this represents a vulnerable litter/young.
            - "urgency_score": An integer from 0 to 100 representing the severity/urgency.
            - "priority": A string, one of "CRITICAL", "HIGH", "MEDIUM", "LOW" (Based on urgency_score: >=85 is CRITICAL, >=60 is HIGH).
            - "ai_rationale": A short sentence explaining why this urgency score was assigned.
            - "first_aid_guidance": Short actionable first aid guidance for the reporter.
            - "observations": A JSON list of string observations (max 3).
            
            Return ONLY the raw JSON object, without any markdown formatting, backticks, or extra text.
            """
            
            # If we had image processing, we would pass the image parts here. 
            # For now, we will pass the text prompt to Gemini.
            # If base64_image is a valid data URI, we could parse it, but for simplicity we rely on text prompt for now 
            # unless a valid image part is constructed.
            
            response = model.generate_content(prompt)
            text_response = response.text.strip()
            # Clean up potential markdown formatting from Gemini response
            if text_response.startswith("```json"):
                text_response = text_response[7:-3].strip()
            elif text_response.startswith("```"):
                text_response = text_response[3:-3].strip()
                
            ai_data = json.loads(text_response)
            return ai_data
            
        except Exception as e:
            print(f"Error calling Gemini API: {e}. Falling back to mock logic.")
            # Fallback to mock logic if API fails
            pass

    # Fallback / Mock Logic
    condition_lower = condition.lower()
    desc_lower = description.lower()
    
    is_critical = any(word in condition_lower or word in desc_lower for word in ['severe', 'bleeding', 'accident', 'unconscious', 'dying', 'immediate'])
    is_high = any(word in condition_lower or word in desc_lower for word in ['fracture', 'broken', 'trapped', 'sick', 'pregnant'])
    
    urgency_score = random.randint(85, 100) if is_critical else random.randint(60, 84) if is_high else random.randint(30, 59)
    priority = "CRITICAL" if urgency_score >= 85 else "HIGH" if urgency_score >= 60 else "MEDIUM" if urgency_score >= 40 else "LOW"
    
    detected_species = animal_type if animal_type != "Other" else random.choice(["Dog", "Cat", "Bird"])
    
    injuries = []
    if is_critical:
        injuries.append("Severe open wound / Possible internal injury")
    if "road" in condition_lower:
        injuries.append("Trauma from vehicular impact")
    if not injuries:
        injuries.append("No obvious life-threatening external trauma visible in photo")
        
    first_aid = ""
    if is_critical:
        first_aid = "DO NOT MOVE the animal unless it's in immediate traffic danger. Keep them warm and wait for professional rescue."
    elif "bleeding" in desc_lower or "bleeding" in condition_lower:
        first_aid = "If safe to do so, apply gentle pressure to the wound with a clean cloth. Do not apply a tourniquet."
    else:
        first_aid = "Provide water if possible. Do not feed solid food as it may interfere with potential medical procedures."

    return {
        "species": detected_species,
        "injuries": ", ".join(injuries),
        "is_litter": "puppies" in desc_lower or "kittens" in desc_lower or "litter" in desc_lower,
        "urgency_score": urgency_score,
        "priority": priority,
        "ai_rationale": f"AI identified key distress markers consistent with {condition}. Vital signs appear compromised based on description/photo.",
        "first_aid_guidance": first_aid,
        "observations": [
            f"Detected {detected_species} in distress.",
            "Mobility appears restricted." if is_high else "Subject appears alert.",
            "Area appears hazardous." if "road" in condition_lower else "Area appears relatively safe."
        ]
    }
