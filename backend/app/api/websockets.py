import asyncio
from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Store active connections. In a real app, this might be a Redis pub/sub.
        self.active_connections: List[WebSocket] = []
        # Store rescuer connections separately to broadcast emergencies to them
        self.rescuer_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, role: str = "citizen"):
        await websocket.accept()
        self.active_connections.append(websocket)
        if role == "rescuer":
            self.rescuer_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, role: str = "citizen"):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if role == "rescuer" and websocket in self.rescuer_connections:
            self.rescuer_connections.remove(websocket)

    async def broadcast_to_rescuers(self, message: dict):
        # Broadcast a new emergency to all connected rescuers
        for connection in self.rescuer_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                # Handle disconnected clients that weren't cleaned up
                print(f"Failed to send message: {e}")

manager = ConnectionManager()
