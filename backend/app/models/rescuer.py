from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Rescuer(Base):
    __tablename__ = "rescuers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    organization_id = Column(Integer, ForeignKey("rescue_organizations.id"), nullable=True)
    availability = Column(Boolean, default=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    expertise = Column(String, nullable=True) # comma separated animal types
    verified = Column(Boolean, default=False)

    user = relationship("User")
    organization = relationship("RescueOrganization")
