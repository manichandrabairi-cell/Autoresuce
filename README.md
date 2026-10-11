# AutoRescue — AI-Powered Roadside Assistance Platform

AutoRescue is a complete, modern, production-oriented roadside assistance and towing marketplace application connecting stranded motorists with verified towing operators, wreckers, and mobile mechanics in real time.

---

## 1. Demo Credentials & Quick Login

The platform includes **one-click login buttons** on the `/login` screen as well as seeded credentials:

| Role | Email | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@autorescue.com` | `Customer123!` | Active booking `AR-84920` on live GPS radar |
| **Provider (Verified)** | `provider@autorescue.com` | `Provider123!` | Apex Roadside Logistics (Rating 4.9, 142 jobs) |
| **Provider (Verified)** | `quicktow@autorescue.com` | `Provider123!` | QuickTow 24/7 Rescue (Rating 4.8, 89 jobs) |
| **Provider (Pending)** | `newpartner@autorescue.com` | `Provider123!` | Metro Haulers (Pending compliance review) |
| **Administrator** | `admin@autorescue.com` | `Admin123!` | Access to approval queue, disputes & oversight |

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React automotive icons
- **Navigation**: React Router v7 with role-based protected routes
- **Maps & Telemetry**: Leaflet & OpenStreetMap interactive radar with animated tow truck movement
- **State & Network**: Context API (`AuthContext`) + standardized `apiRequest` fetch client

### Backend
- **Framework**: Python 3.11 + FastAPI + Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0
  - Universal default: SQLite (`autorescue.db`) for immediate zero-dependency local runs
  - PostgreSQL + PostGIS schema and DDL script provided in `backend/schema_postgres.sql`
- **Security**: JWT authentication (`HS256`), bcrypt password hashing
- **Real-Time Communication**: FastAPI WebSockets (`/ws/tracking/{booking_id}`)
- **AI Diagnostics**: MobileNetV2 transfer-learning vision inference service (`backend/app/services/ai_classifier.py`)
- **Payments**: Razorpay test mode integration with digital GST tax invoice generation
- **Documentation**: Interactive OpenAPI Swagger documentation at `http://127.0.0.1:8000/api/docs`

---

## 3. Implemented Features & Workflows

### Public Platform
- **Navbar**: Responsive navigation with brand identity, 24/7 hotline banner, and sticky SOS Emergency button.
- **Hero Section**: Emergency dispatch launcher, vehicle category dropdown, and trust telemetry.
- **10 Roadside Services**:
  1. Flatbed Towing
  2. Under-Lift Towing
  3. Two-Wheeler Towing
  4. Heavy Vehicle Recovery
  5. Accident Recovery
  6. Breakdown Towing
  7. Battery Jump-Start
  8. Flat-Tyre Assistance
  9. Emergency Fuel Delivery
  10. EV Roadside Assistance
- **Service Detail Pages**: Dedicated `/services/:serviceSlug` pages with interactive distance sliders and fare calculators.
- **How It Works**: 4-step visual walkthrough.
- **Pricing Engine**: Formula breakdown, vehicle classification coefficients, and live fare estimator.
- **Enterprise Solutions**: Fleet solutions page with active sales lead capture form (`POST /api/enterprise/lead`).
- **FAQ & Support**: Searchable help desk accordion and 24/7 operations contact directory.

### Customer Journey & Booking
- **7-Step Booking Wizard (`/customer/book`)**:
  - Step 1: Vehicle Details (Type, Brand, Model, Plate, Fuel, Condition)
  - Step 2: Problem Details (Flat tyre, battery, engine, accident, etc.)
  - Step 3: Photo Upload with **MobileNetV2 AI Analysis** (category, confidence, severity, caveats)
  - Step 4: Location (Current GPS coordinates or landmark address)
  - Step 5: Service Selection & Dispatch Mode:
    - **Mode A (Instant Auto-Dispatch)**: Assigns nearest top-rated unit immediately.
    - **Mode B (Competitive Bidding)**: Opens 15-minute window for regional operators to submit quotes.
  - Step 6: Upfront Fare Estimate Breakdown (Base fee, distance charge, vehicle factor)
  - Step 7: Confirmation & Instant Dispatch
- **Live GPS Tracking Radar (`/customer/track/:bookingId`)**:
  - Interactive map showing customer, pickup, destination, and animated moving tow truck.
  - Real-time driver profile card (name, vehicle, equipment, rating, total jobs).
  - In-app live chat drawer with driver.
  - Razorpay test mode payment modal with UPI, Card, Net Banking.
  - Digital GST tax invoice printable receipt.
  - Star rating and customer review modal.
  - Cancellation workflow with reason tracking.

### Provider Portal (`/provider/dashboard`)
- **Status Progression**: Providers advance active dispatches (`PROVIDER_ASSIGNED` -> `EN_ROUTE` -> `ARRIVED` -> `SERVICE_IN_PROGRESS` -> `COMPLETED`).
- **Competitive Bidding Board**: View open market requests and submit price & ETA bids.
- **Online/Offline Availability**: Toggle availability with instant dispatch exclusion when offline.
- **Fleet Registry (`/provider/vehicles`)**: Register tow trucks with vehicle apparatus and tonnage capacity.
- **Compliance Documents (`/provider/documents`)**: View commercial permits, driver licenses, and verification status.

### Admin Governance Portal (`/admin/dashboard`)
- **KPI Overview Cards**: Total drivers, registered providers, pending verifications, active emergencies, completed jobs, gross volume, platform revenue (15%), response time SLA.
- **Provider Approvals (`/admin/providers`)**: Review unverified partners and click **Approve**, **Reject**, or **Suspend**.
- **Customer Directory (`/admin/customers`)**: Search users and toggle active/suspended status.
- **Incident Inspector (`/admin/bookings`)**: Global incident log with direct radar links.

---

## 4. Running in Visual Studio Code (VS Code)

### Option A: 1-Click VS Code Tasks & Debugger (Recommended)

1. **Open the project in VS Code**:
   * Open VS Code, select **File > Open Folder...**, and select the `AutoRescue` folder.
2. **Install Recommended Extensions**:
   * When prompted, click **Install All** for recommended extensions (Python, Tailwind CSS, etc.).
3. **Run via VS Code Debugger (F5)**:
   * Press `F5` or go to the **Run and Debug** tab (Ctrl+Shift+D).
   * Select **"FastAPI: Run & Debug Backend"** and press Play.
4. **Run via VS Code Tasks**:
   * Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   * Type **`Tasks: Run Task`** and select:
     - `1. Run Full Platform (Both Backend & Frontend)` to launch both servers simultaneously!
     - Or choose `Start FastAPI Backend` / `Start React Frontend` individually.

---

### Option B: Built-in VS Code Terminal (Step-by-Step)

#### Terminal 1 — Backend (FastAPI on Port 8000):
```bash
# 1. Open Terminal (Ctrl + `) and navigate to backend:
cd backend

# 2. (Optional) Create and activate a Python virtual environment:
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies:
pip install -r requirements.txt

# 4. Start the FastAPI backend server:
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
> FastAPI will start at `http://127.0.0.1:8000`. Swagger API docs at `http://127.0.0.1:8000/api/docs`.

#### Terminal 2 — Frontend (React + Vite on Port 5173):
```bash
# 1. Split or open a second terminal:
cd frontend

# 2. Install Node dependencies:
npm install

# 3. Launch the Vite development server:
npm run dev
```
> Open your browser at **`http://localhost:5173`**.

---

### Option C: Re-seed Database or Run Automated Tests

To re-seed test data (customers, providers, vehicles, active bookings):
```bash
cd backend
python seed.py
```

To run end-to-end automated workflow validation tests:
```bash
cd backend
python test_workflows.py
```

---

## 5. Documented External Integrations & Mocks

| Service | Implementation Status | Integration / Transition Steps |
| :--- | :--- | :--- |
| **MobileNetV2 Vision Diagnostics** | Active inference module (`ai_classifier.py`) | Uses image feature tensors, edge gradient density, and visual heuristics. To connect fine-tuned PyTorch `.pt` weights, place weights in `backend/app/models/` and load via `torchvision.models.mobilenet_v2`. |
| **Razorpay Payments** | Active test mode simulator (`payment_service.py`) | Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Toggle `RAZORPAY_TEST_MODE=false` in production. Cryptographic signature verification is already enforced. |
| **SMS OTP Verification** | Active dev simulator (`/api/auth/verify-otp`) | Simulates 6-digit SMS OTP (Demo OTP: `123456`). In production, plug in Twilio or Fast2SMS API key in `backend/app/routers/auth.py`. |
| **GPS Tracking & Maps** | Active Leaflet & OpenStreetMap radar | Features real coordinate positioning and smooth moving simulation. Compatible with Google Maps JS API by swapping the map container tile layer. |
| **PostgreSQL & PostGIS** | Schema DDL provided (`schema_postgres.sql`) | Runs automatically on SQLite for local zero-dependency testing. Change `DATABASE_URL` in `.env` to connect to production PostgreSQL with PostGIS geometry points. |
