from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.rescuer import Rescuer
from app.models.organization import RescueOrganization
from app.schemas.rescuer import RescuerResponse, OrganizationResponse

router = APIRouter()

@router.get("/nearby", response_model=List[RescuerResponse])
def get_nearby_rescuers(
    db: Session = Depends(deps.get_db),
    lat: float = 0.0,
    lng: float = 0.0,
) -> Any:
    # Mock nearby logic: Just return all verified available rescuers for demo
    rescuers = db.query(Rescuer).filter(Rescuer.verified == True, Rescuer.availability == True).all()
    return rescuers

@router.get("/organizations/nearby", response_model=List[OrganizationResponse])
def get_nearby_organizations(
    db: Session = Depends(deps.get_db),
    lat: float = 0.0,
    lng: float = 0.0,
) -> Any:
    # Mock nearby logic
    orgs = db.query(RescueOrganization).filter(RescueOrganization.verified == True).all()
    return orgs
