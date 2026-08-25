from typing import Any # to define the type of a variable.
from fastapi import APIRouter, Depends, HTTPException, Body # to define the API routes, dependencies, HTTP exceptions, and request body.
from sqlalchemy.orm import Session # to define the database session.
from app.api import deps # to define the dependencies.
from app.api.auth_deps import get_current_user_optional # to define the current user.
from app.core.config import settings # to define the settings.
from openai import OpenAI
import json

router = APIRouter()

@router.post("/diagnose")
def diagnose_animal(
    symptoms: str = Body(..., embed=True),
    animal_type: str = Body(..., embed=True),
    current_user = Depends(get_current_user_optional)
) -> Any:
    """
    Get an AI diagnosis from Grok (primary) or OpenRouter (fallback).
    """
    if not settings.GROK_API_KEY and not settings.OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="AI API keys not configured")
        
    prompt = f"""
    You are an expert veterinary assistant AI.
    Analyze the following symptoms for a {animal_type}.
    Symptoms: {symptoms}
    
    Please provide a JSON response with the following strictly formatted keys:
    - "diagnosis": A short description of the likely diagnosis or condition.
    - "urgency": An integer from 0 to 100 representing the severity/urgency.
    - "recommendation": A short actionable recommendation for first-aid or next steps.
    - "requires_vet": Boolean (true/false) indicating if immediate vet attention is needed.
    
    Return ONLY the raw JSON object, without any markdown formatting or extra text.
    """
    
    # Try Grok first
    if settings.GROK_API_KEY:
        try:
            client = OpenAI(
                api_key=settings.GROK_API_KEY,
                base_url="https://api.x.ai/v1"
            )
            response = client.chat.completions.create(
                model="grok-beta",
                messages=[
                    {"role": "system", "content": "You are a veterinary AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            content = response.choices[0].message.content.strip()
            # Clean up markdown if present
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
                
            return json.loads(content)
        except Exception as e:
            print(f"Grok API failed: {e}. Falling back to OpenRouter...")
            
    # Fallback to OpenRouter
    if settings.OPENROUTER_API_KEY:
        try:
            client = OpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1"
            )
            response = client.chat.completions.create(
                model="meta-llama/llama-3.1-8b-instruct:free",
                messages=[
                    {"role": "system", "content": "You are a veterinary AI."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content[7:-3].strip()
            elif content.startswith("```"):
                content = content[3:-3].strip()
                
            return json.loads(content)
        except Exception as e:
            print(f"OpenRouter API failed: {e}")
            raise HTTPException(status_code=500, detail="AI Diagnosis service failed.")
            
    raise HTTPException(status_code=500, detail="No AI service available.")
