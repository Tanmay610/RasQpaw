from fastapi import APIRouter
from src.features.auth.api import auth_routes
from src.features.report.api import report_routes
from src.features.map.api import rescuer_routes, ws_routes
from AI_Diagnosis.api import ai_routes

api_router = APIRouter()
api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
api_router.include_router(report_routes.router, prefix="/reports", tags=["reports"])
api_router.include_router(rescuer_routes.router, prefix="/rescuers", tags=["rescuers"])
api_router.include_router(ws_routes.router, prefix="/ws", tags=["ws"])
api_router.include_router(ai_routes.router, prefix="/ai", tags=["ai"])
