from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class AnimalReport(Base):
    __tablename__ = "animal_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"))
    animal_type = Column(String)
    condition = Column(String)
    description = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(String)
    image_url = Column(String, nullable=True)
    
    # Priority and Assessment
    priority = Column(String, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    urgency_score = Column(Integer, default=50) # 0-100 score
    ai_assessment = Column(Text, nullable=True) # General JSON blob (legacy)
    
    # New AI Phase 1 Fields
    species = Column(String, nullable=True)
    injuries = Column(String, nullable=True)
    is_litter = Column(Boolean, default=False)
    ai_rationale = Column(Text, nullable=True)
    first_aid_guidance = Column(Text, nullable=True)
    
    # Tracking
    status = Column(String, default="Reported") # Reported, Rescuer Assigned, On The Way, Animal Reached, Resolved
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reporter = relationship("User", foreign_keys=[reporter_id])
