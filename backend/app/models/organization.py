from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class RescueOrganization(Base):
    __tablename__ = "rescue_organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    service_radius = Column(Integer) # in km
    verified = Column(Boolean, default=False)
    phone = Column(String)
    email = Column(String)
