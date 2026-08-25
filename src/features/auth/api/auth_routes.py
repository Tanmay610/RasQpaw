from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.firebase import verify_token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        name=user_in.name,
        role=user_in.role,
        phone=user_in.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(deps.get_db),
    email: str = Body(...),
    password: str = Body(...)
) -> Any:
    user = db.query(User).filter(User.email == email).first()
    if not user or not security.verify_password(password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/firebase-login")
def firebase_login(
    db: Session = Depends(deps.get_db),
    token: str = Body(..., embed=True)
) -> Any:
    try:
        decoded_token = verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Firebase Token")

    email = decoded_token.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token does not contain an email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create a new user implicitly based on the Firebase token
        # Since Firebase handles auth, we can auto-register them as a citizen
        user = User(
            email=email,
            password_hash="FIREBASE_AUTH",  # Unused since Firebase handles it
            name=decoded_token.get("name") or email.split('@')[0],
            role="citizen"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
        }
    }
