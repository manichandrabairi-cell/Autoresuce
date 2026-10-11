# AutoRescue — Backend API Service

AI-Powered Roadside Assistance and Towing Marketplace REST & WebSocket Backend.

## Technology Stack
- **Framework**: Python 3.11+, FastAPI, Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 (Supports SQLite for local dev & PostgreSQL/PostGIS for production)
- **Authentication**: JWT (`HS256`), bcrypt password hashing
- **Real-Time**: FastAPI WebSockets (`/ws/tracking/{booking_id}`)
- **AI Diagnostics**: MobileNetV2 Vision Transfer-Learning Classifier (`app/services/ai_classifier.py`)
- **Payments**: Razorpay Test Mode integration with cryptographic signature verification

## Getting Started

### 1. Create and Activate Virtual Environment
```bash
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Seed Database (Optional)
```bash
python seed.py
```

### 5. Start Development Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

## API Documentation
- **Interactive Swagger UI**: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/api/redoc](http://127.0.0.1:8000/api/redoc)

## Automated Tests
```bash
python test_workflows.py
```
