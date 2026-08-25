from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.api.auth_deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.report import AnimalReport
from app.schemas.report import AnimalReportCreate, AnimalReportResponse, ReportStatusUpdate
import uuid
import json

router = APIRouter()

def mock_ai_assessment(report_in: AnimalReportCreate):
    # Simple Mock AI Logic
    condition = report_in.condition.lower()
    
    if "road accident" in condition or "severe" in condition or "bleeding" in condition:
        priority = "CRITICAL"
        urgency_score = 95
        severity = "high"
    elif "injured" in condition or "newborn" in condition:
        priority = "HIGH"
        urgency_score = 80
        severity = "medium-high"
    elif "sick" in condition or "minor" in condition:
        priority = "MEDIUM"
        urgency_score = 50
        severity = "medium"
    else:
        priority = "LOW"
        urgency_score = 20
        severity = "low"
        
    assessment = {
        "animal_type": report_in.animal_type,
        "visible_injury": priority in ["CRITICAL", "HIGH"],
        "injury_type": condition,
        "severity": severity,
        "urgency_score": urgency_score,
        "recommended_response_time": "Immediate" if priority == "CRITICAL" else "Within hours",
        "confidence": 0.85,
        "observations": ["Demo AI Assessment logic executed"]
    }
    return priority, urgency_score, json.dumps(assessment)

from app.services.ai_vision import analyze_animal_report

from app.api.websockets import manager
import asyncio

@router.post("/", response_model=AnimalReportResponse)
async def create_report(
    *,
    db: Session = Depends(deps.get_db),
    report_in: AnimalReportCreate,
    current_user: User | None = Depends(get_current_user_optional),
) -> Any:
    # Generate Case ID
    case_id = f"RQ-2026-{str(uuid.uuid4())[:8].upper()}"
    
    # Run mock AI assessment (Phase 1)
    ai_data = analyze_animal_report(
        animal_type=report_in.animal_type,
        condition=report_in.condition,
        description=report_in.description,
        base64_image=report_in.image_url
    )
    
    report = AnimalReport(
        case_id=case_id,
        reporter_id=current_user.id if current_user else None,
        animal_type=report_in.animal_type,
        condition=report_in.condition,
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        address=report_in.address,
        image_url=report_in.image_url,
        priority=ai_data["priority"],
        urgency_score=ai_data["urgency_score"],
        species=ai_data["species"],
        injuries=ai_data["injuries"],
        is_litter=ai_data["is_litter"],
        ai_rationale=ai_data["ai_rationale"],
        first_aid_guidance=ai_data["first_aid_guidance"],
        ai_assessment=json.dumps(ai_data["observations"]),
        status="Reported"
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Broadcast to online rescuers
    asyncio.create_task(manager.broadcast_to_rescuers({
        "type": "NEW_EMERGENCY",
        "case_id": report.case_id,
        "species": report.species,
        "priority": report.priority,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "address": report.address
    }))

    return report

@router.get("/", response_model=List[AnimalReportResponse])
def get_reports(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    reports = db.query(AnimalReport).offset(skip).limit(limit).all()
    return reports

@router.get("/{case_id}", response_model=AnimalReportResponse)
def get_report(
    *,
    db: Session = Depends(deps.get_db),
    case_id: str,
) -> Any:
    report = db.query(AnimalReport).filter(AnimalReport.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.patch("/{case_id}/status", response_model=AnimalReportResponse)
def update_report_status(
    *,
    db: Session = Depends(deps.get_db),
    case_id: str,
    status_update: ReportStatusUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    report = db.query(AnimalReport).filter(AnimalReport.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.status = status_update.status
    db.commit()
    db.refresh(report)
    return report

from app.utils.geo import haversine_distance
import random

@router.get("/{case_id}/nearby")
def get_nearby_resources(
    *,
    db: Session = Depends(deps.get_db),
    case_id: str,
) -> Any:
    report = db.query(AnimalReport).filter(AnimalReport.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    lat, lon = report.latitude, report.longitude
    
    # Mocking nearby rescuers
    rescuers = []
    for i in range(3):
        # Generate random coordinates within ~5km
        r_lat = lat + random.uniform(-0.045, 0.045)
        r_lon = lon + random.uniform(-0.045, 0.045)
        distance = haversine_distance(lat, lon, r_lat, r_lon)
        eta_minutes = int(distance * 5) # Rough estimate: 5 mins per km
        rescuers.append({
            "id": i + 1,
            "name": f"Rescuer {['Alice', 'Bob', 'Charlie', 'Dave'][i]}",
            "phone": "555-010" + str(i),
            "distance_km": round(distance, 2),
            "eta_minutes": eta_minutes,
            "latitude": r_lat,
            "longitude": r_lon,
            "rating": round(random.uniform(4.2, 5.0), 1)
        })
        
    rescuers.sort(key=lambda x: x["distance_km"])
    
    # Mocking nearby clinics
    clinics = []
    for i in range(2):
        c_lat = lat + random.uniform(-0.06, 0.06)
        c_lon = lon + random.uniform(-0.06, 0.06)
        distance = haversine_distance(lat, lon, c_lat, c_lon)
        clinics.append({
            "id": i + 1,
            "name": f"City Vet Clinic {i+1}",
            "distance_km": round(distance, 2),
            "latitude": c_lat,
            "longitude": c_lon,
            "is_open": True
        })
    
    clinics.sort(key=lambda x: x["distance_km"])
    
    return {
        "rescuers": rescuers,
        "clinics": clinics
    }
