from typing import Dict, List, Any
import json
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps booking_id to list of active WebSockets
        self.active_booking_connections: Dict[int, List[WebSocket]] = {}
        # Maps user_id to list of active WebSockets
        self.user_connections: Dict[int, List[WebSocket]] = {}

    async def connect_booking(self, booking_id: int, websocket: WebSocket):
        await websocket.accept()
        if booking_id not in self.active_booking_connections:
            self.active_booking_connections[booking_id] = []
        self.active_booking_connections[booking_id].append(websocket)

    def disconnect_booking(self, booking_id: int, websocket: WebSocket):
        if booking_id in self.active_booking_connections:
            if websocket in self.active_booking_connections[booking_id]:
                self.active_booking_connections[booking_id].remove(websocket)
            if not self.active_booking_connections[booking_id]:
                del self.active_booking_connections[booking_id]

    async def broadcast_to_booking(self, booking_id: int, message: Dict[str, Any]):
        if booking_id in self.active_booking_connections:
            dead_sockets = []
            for connection in self.active_booking_connections[booking_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect_booking(booking_id, dead)

    async def connect_user(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect_user(self, user_id: int, websocket: WebSocket):
        if user_id in self.user_connections:
            if websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def send_to_user(self, user_id: int, message: Dict[str, Any]):
        if user_id in self.user_connections:
            dead_sockets = []
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.append(connection)
            for dead in dead_sockets:
                self.disconnect_user(user_id, dead)

ws_manager = ConnectionManager()
