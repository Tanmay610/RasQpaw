import sys
import os
import random

# Add backend directory to sys path before importing local modules
sys.path.append(
    os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend'))
)

from app.db.session import SessionLocal, engine  # noqa: E402
from app.models.base import Base  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.report import AnimalReport  # noqa: E402
from app.models.organization import RescueOrganization  # noqa: E402
from app.models.rescuer import Rescuer  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Users
    citizen = User(
        name="Citizen User",
        email="citizen@demo.com",
        password_hash=get_password_hash("password"),
        role="citizen"
    )
    rescuer_user = User(
        name="Rescue Pro",
        email="rescuer@demo.com",
        password_hash=get_password_hash("password"),
        role="rescuer"
    )
    db.add(citizen)
    db.add(rescuer_user)
    db.commit()
    db.refresh(citizen)
    db.refresh(rescuer_user)

    # Org
    org = RescueOrganization(
        name="Chandigarh Animal Rescue",
        description="Demo Org",
        latitude=30.7333,
        longitude=76.7794,
        service_radius=20,
        verified=True
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # Rescuer profile
    rescuer = Rescuer(
        user_id=rescuer_user.id,
        organization_id=org.id,
        availability=True,
        latitude=30.74,
        longitude=76.78,
        expertise="Dog,Cat",
        verified=True
    )
    db.add(rescuer)
    db.commit()

    # 15 Cases
    animal_types = ["Dog", "Cat", "Cow", "Bird"]
    conditions = ["Road accident", "Injured", "Sick", "Abandoned"]
    priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    statuses = [
        "Reported",
        "Rescuer Assigned",
        "On The Way",
        "Animal Reached",
        "Resolved"
    ]

    for i in range(15):
        pt = random.choice(priorities)
        img_url = (
            "https://images.unsplash.com/photo-1548681528-6a5c45b66b42"
            "?w=500&auto=format&fit=crop"
        )
        report = AnimalReport(
            case_id=f"RQ-2026-DEMO-{i}",
            reporter_id=citizen.id,
            animal_type=random.choice(animal_types),
            condition=random.choice(conditions),
            description="Found this animal in distress.",
            latitude=30.73 + random.uniform(-0.05, 0.05),
            longitude=76.77 + random.uniform(-0.05, 0.05),
            address=f"Sector {random.randint(1, 50)}, Chandigarh",
            image_url=img_url if random.random() > 0.3 else None,
            priority=pt,
            urgency_score=random.randint(20, 95),
            status=random.choice(statuses)
        )
        db.add(report)

    db.commit()
    print("Database seeded!")
    db.close()


if __name__ == "__main__":
    seed()
