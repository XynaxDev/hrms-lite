# HRMS Lite | Enterprise Intelligent Workforce Management

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

HRMS Lite is a state-of-the-art, full-stack Human Resource Management System designed for modern, high-growth teams. It combines a premium React based user interface with a FastAPI backend and intelligent data querying powered by **OpenRouter**.

## Core Features

- **Intelligent HR Assistant**
  - Production-style conversational UI with chat history and responsive layout.
  - Natural language questions over employees, attendance, and workforce metrics.
  - Network-hardened requests (timeouts + clearer error surfacing).
  - Guardrails to avoid leaking raw backend/SQL errors into the UI.
  - Designed for executive summaries and actionable insights (e.g., leave trends, headcount signals).
- **Employee Management**
  - Add, edit, delete employees.
  - Department and status filtering.
- **Attendance Tracking**
  - Mark attendance by date.
  - Edit an existing entry (persists to DB).
  - Export CSV.
- **Modern UI**
  - Glassy navbar, responsive layout, smooth motion.
  - TailwindCSS + Framer Motion.
- **Production-friendly Architecture**
  - FastAPI + SQLAlchemy + Pydantic.
  - Works with hosted PostgreSQL (e.g. Supabase).

## Project Architecture
The system is split into two main modules:

1.  **Frontend (`/frontend`)**: 
    - **Engine**: React 18 + TypeScript
    - **Styling**: Tailwind CSS (Executive Aesthetic)
    - **Animations**: Framer Motion
2.  **Backend (`/backend`)**:
    - **Framework**: FastAPI (Python 3.12+)
    - **Intelligence**: LangChain + OpenRouter
    - **Database**: PostgreSQL + SQLAlchemy

## Security & Isolation (MVP)
This project is currently running **without full authentication** by design (demo/MVP mode).

- **Device / PC Isolation (Session-Scoped)**
  - Access is treated as **device-scoped** (a single browser/device session).
  - Intended to keep each demo environment isolated per device during reviews.
  - This is **not a replacement for authentication** and should not be considered production-grade security.

- **Roadmap**
  - Add proper **Auth + Roles** and Supabase **Row Level Security (RLS)** for real multi-user and multi-company isolation.

### Demo Isolation (Device / IP)

To keep demo data separated across different laptops/browsers **without login**, the backend can scope all reads/writes by a demo key.

- **Device mode (recommended for demos)**
  - Frontend generates a persistent `device_id` (stored in `localStorage`).
  - Every API request includes `X-Device-Id`.
  - Backend stores/filter records by `device_id`.

- **IP mode (optional)**
  - Backend scopes requests by client IP (`X-Forwarded-For` / remote address).
  - Useful for quick staging demos, but less reliable on shared networks/VPNs.

Backend env vars:

```env
DEMO_ISOLATION_ENABLED=true
DEMO_ISOLATION_MODE=device  # device | ip
```

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (local or hosted)

### Backend (FastAPI)

From the repository root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- Windows (PowerShell):

```powershell
venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
DEBUG=true
API_KEY=CHANGE_ME_MATCHES_FRONTEND
```

Notes:

- `API_KEY` is used for the `X-API-Key` header.
- Do not commit `.env` files.

Start the backend:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### Frontend (React + Vite)

From the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_KEY=CHANGE_ME_MATCHES_BACKEND
```

Start the frontend:

```bash
npm run dev
```

Open:

- `http://localhost:5173`

### Production build checks

Frontend typecheck + build:

```bash
cd frontend
npm run build
```

Backend syntax check (optional):

```bash
python -m compileall backend\app
```

## Deployment

### Backend (Railway)
1. Push the repository to GitHub.
2. Create a new project in Railway and connect your repo.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Start Command**:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

4. Set environment variables in Railway:
   - `DATABASE_URL` (Supabase Postgres connection string)
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_BASE_URL` = `https://openrouter.ai/api/v1`
   - `ALLOWED_ORIGINS` = `https://<your-vercel-app>.vercel.app`
   - `API_KEY` (must match frontend `VITE_API_KEY`)
5. Deploy and copy your public Railway service URL.

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Import your GitHub repo.
3. Set:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Add environment variables:
   - `VITE_API_URL` = `https://<your-railway-backend>/api/v1`
   - `VITE_API_KEY` = same value as backend `API_KEY`

Required frontend env vars:

- `VITE_API_URL`
- `VITE_API_KEY`

## Submission Requirements

### Checklist
- [x] **Live Application URL**
- [x] **GitHub Repository Link**
- [x] **README.md** containing:
  - [x] Project overview
  - [x] Tech stack used  
  - [x] Steps to run the project locally
  - [x] Assumptions or limitations


## Limitations & Assumptions

### Current Limitations (Demo Mode)
1. **No Authentication System**
   - Uses demo device isolation instead of proper user authentication
   - Data is scoped per device/browser session via `X-Device-Id` header
   - Not suitable for production multi-user environments

2. **Single-Tenant Architecture**
   - Designed for single organization/demo use
   - No multi-tenant or company-based data separation
   - All users share the same database schema

3. **Basic Role Management**
   - No role-based access control (RBAC)
   - All users have full access to all features
   - No admin/user permission differentiation

4. **Limited Audit Trail**
   - Basic activity logging only
   - No comprehensive audit logs for compliance
   - Limited change tracking capabilities

### Assumptions
- Demo environment with trusted users
- Small to medium team size (< 500 employees)
- Single geographic region (no timezone complexity)
- Basic HR workflows without complex compliance requirements

### Roadmap for Production
- Implement proper authentication (JWT/OAuth)
- Add role-based access control
- Multi-tenant architecture with company isolation
- Comprehensive audit logging
- Advanced compliance features (GDPR, etc.)


## License
Distributed under the MIT License. See `LICENSE` for more information.

**Built by Akash for Modern Operations.**

