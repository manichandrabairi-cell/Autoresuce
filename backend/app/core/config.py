import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AutoRescue"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "autorescue_super_secret_jwt_key_982374892374892374"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for dev

    # Database: Supports SQLite (for immediate local runs) or PostgreSQL + PostGIS
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./autorescue.db")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Payment Gateway - Razorpay Test Mode
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_autorescue123")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "mock_secret_autorescue456")
    RAZORPAY_TEST_MODE: bool = True

    # Storage & Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    # Dispatch & Bidding
    DEFAULT_SEARCH_RADIUS_KM: float = 10.0
    BIDDING_WINDOW_MINUTES: int = 15

    # AI Model Settings
    AI_MODEL_NAME: str = "MobileNetV2-AutoRescue-v1"
    AI_CONFIDENCE_THRESHOLD: float = 0.65

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
