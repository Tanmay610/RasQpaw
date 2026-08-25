from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class CaseAssignment(Base):
    __tablename__ = "case_assignments"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("animal_reports.id"))
    rescuer_id = Column(Integer, ForeignKey("rescuers.id"))
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    report = relationship("AnimalReport")
    rescuer = relationship("Rescuer")

class CaseUpdate(Base):
    __tablename__ = "case_updates"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("animal_reports.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("AnimalReport")
    user = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

class CaseMessage(Base):
    __tablename__ = "case_messages"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("animal_reports.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("AnimalReport")
    sender = relationship("User")
