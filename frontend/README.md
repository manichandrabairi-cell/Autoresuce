# AutoRescue — Frontend Client

AI-Powered Roadside Assistance and Towing Marketplace Web Application.

## Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide React Automotive Icons
- **Routing**: React Router v7 with Role-Based Access Control (Customer, Provider, Admin)
- **Live Radar**: Leaflet & OpenStreetMap interactive maps with moving tow truck simulation
- **State & Network**: Context API (`AuthContext`) with resilient backend fallback client

## Getting Started

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If running against a backend on a custom host/port, configure `.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
```
*(By default, Vite proxies `/api` requests automatically to `http://127.0.0.1:8000`)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```

## Platform Portals
- **Stranded Motorist Journey**: `/customer/book` (7-step booking wizard) & `/customer/track/:id` (live GPS radar)
- **Service Partner Operator Portal**: `/provider/dashboard` (bidding board, status updates, fleet registry)
- **Platform Governance Portal**: `/admin/dashboard` (vetting queue, dispute logs, telemetry KPIs)
