from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.websockets import manager

router = APIRouter()

@router.websocket("/live")
async def websocket_endpoint(websocket: WebSocket, role: str = "citizen"):
    await manager.connect(websocket, role)
    try:
        while True:
            data = await websocket.receive_text()
            # In a full implementation, we can handle incoming messages here (e.g. rescuer location updates)
    except WebSocketDisconnect:
        manager.disconnect(websocket, role)
