import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import auth, bookings, providers, ai, payments, admin, public
from app.services.websocket_manager import ws_manager

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AutoRescue: AI-Powered Roadside Assistance & Towing Marketplace Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Middleware - Universally allows all origins and cloud domains (Vercel, Render, Railway, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?:\/\/.*$",
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload files
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

from fastapi.responses import FileResponse
from fastapi import HTTPException

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(public.router, prefix=settings.API_V1_STR)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "platform": settings.PROJECT_NAME,
        "docs": "/api/docs"
    }

# Serve Frontend SPA in Production if frontend/dist exists
candidate_dist_paths = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"),
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist"),
    os.path.join(os.getcwd(), "frontend", "dist"),
    os.path.join(os.getcwd(), "dist")
]

FRONTEND_DIST = None
for p in candidate_dist_paths:
    if os.path.exists(p) and os.path.exists(os.path.join(p, "index.html")):
        FRONTEND_DIST = p
        break

if FRONTEND_DIST:
    assets_path = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/")
    async def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("uploads") or full_path.startswith("docs") or full_path.startswith("openapi"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "status": "operational",
            "docs": "/api/docs",
            "version": "1.0.0"
        }

# Live Tracking & Dispatch WebSocket
@app.websocket("/ws/tracking/{booking_id}")
async def websocket_tracking_endpoint(websocket: WebSocket, booking_id: int):
    await ws_manager.connect_booking(booking_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # If coordinates sent from client
            if data.get("type") == "LOCATION_UPDATE":
                await ws_manager.broadcast_to_booking(booking_id, data)
            elif data.get("type") == "PING":
                await websocket.send_json({"type": "PONG"})
    except WebSocketDisconnect:
        ws_manager.disconnect_booking(booking_id, websocket)
    except Exception:
        ws_manager.disconnect_booking(booking_id, websocket)
