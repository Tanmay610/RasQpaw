from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse

class OrganizationBase(BaseModel):
    name: str
    description: str
    latitude: float
    longitude: float
    service_radius: int
    phone: str
    email: str

class OrganizationResponse(OrganizationBase):
    id: int
    verified: bool

    class Config:
        from_attributes = True

class RescuerBase(BaseModel):
    availability: bool = True
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    expertise: Optional[str] = None
    organization_id: Optional[int] = None

class RescuerCreate(RescuerBase):
    pass

class RescuerResponse(RescuerBase):
    id: int
    user_id: int
    verified: bool
    user: Optional[UserResponse] = None
    organization: Optional[OrganizationResponse] = None

    class Config:
        from_attributes = True
