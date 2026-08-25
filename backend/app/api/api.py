from fastapi import APIRouter
from app.api.endpoints import auth, reports, rescuers, ws, ai

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(rescuers.router, prefix="/rescuers", tags=["rescuers"])
api_router.include_router(ws.router, prefix="/ws", tags=["ws"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
