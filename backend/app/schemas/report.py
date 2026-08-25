from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse

class AnimalReportBase(BaseModel):
    animal_type: str
    condition: str
    description: str
    latitude: float
    longitude: float
    address: str
    image_url: Optional[str] = None

class AnimalReportCreate(AnimalReportBase):
    pass

class AIAssessmentResponse(BaseModel):
    animal_type: str
    visible_injury: bool
    injury_type: str
    severity: str
    urgency_score: int
    recommended_response_time: str
    confidence: float
    observations: List[str]

class AnimalReportResponse(AnimalReportBase):
    id: int
    case_id: str
    reporter_id: int
    priority: str
    urgency_score: int
    ai_assessment: Optional[str] = None
    
    # New AI Phase 1 Fields
    species: Optional[str] = None
    injuries: Optional[str] = None
    is_litter: Optional[bool] = None
    ai_rationale: Optional[str] = None
    first_aid_guidance: Optional[str] = None
    
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    reporter: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ReportStatusUpdate(BaseModel):
    status: str
