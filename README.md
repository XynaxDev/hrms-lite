# HRMS Lite - Enterprise Intelligent Workforce Management

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791)
![Python](https://img.shields.io/badge/Python-3.12-3776AB)
![Node](https://img.shields.io/badge/Node-18%2B-339933)
![Backend: Render](https://img.shields.io/badge/Backend-Render-46E3B7)
![Frontend: Vercel](https://img.shields.io/badge/Frontend-Vercel-000000)
![AI](https://img.shields.io/badge/AI-OpenRouter-8A2BE2)

HRMS Lite is a state-of-the-art, full-stack Human Resource Management System designed for modern, high-growth teams. It combines a premium React-based user interface with a FastAPI backend and intelligent data querying powered by **OpenRouter**.

## ✨ Core Features

- **Intelligent HR Assistant**
  - Natural language queries over employees and attendance.
  - Guardrails to avoid leaking raw backend/SQL errors.
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

---

## 🏗️ Project Architecture

The system is split into two main modules:

1.  **Frontend (`/frontend`)**: 
    - **Engine**: React 18 + TypeScript
    - **Styling**: Tailwind CSS (Executive Aesthetic)
    - **Animations**: Framer Motion
2.  **Backend (`/backend`)**:
    - **Framework**: FastAPI (Python 3.10+)
    - **Intelligence**: LangChain + OpenRouter
    - **Database**: PostgreSQL + SQLAlchemy

---

## 🚀 Getting Started

### 1) Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL (local or hosted)

### 2) Backend (FastAPI)

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

### 3) Frontend (React + Vite)

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

### 4) Production build checks

Frontend typecheck + build:

```bash
cd frontend
npm run build
```

Backend syntax check (optional):

```bash
python -m compileall backend\app
```

---

## 🌐 Deployment

### Backend (Render)
1. Create a `backend/Procfile` (if not already present):

```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
```

2. Push the repository to GitHub.
3. On Render:
   - **New +** → **Web Service**
   - Connect your GitHub repo
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`
4. Set environment variables (Render → Service → Environment):
   - `DATABASE_URL`
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_BASE_URL` = `https://openrouter.ai/api/v1`
   - `ALLOWED_ORIGINS` = `https://<your-vercel-app>.vercel.app`
   - `API_KEY` (must match frontend `VITE_API_KEY`)

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Import your GitHub repo.
3. Set:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. Add environment variables:
   - `VITE_API_URL` = `https://<your-render-backend>/api/v1`
   - `VITE_API_KEY` = same value as backend `API_KEY`

Required frontend env vars:

- `VITE_API_URL`
- `VITE_API_KEY`

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by Akash for Modern Operations.**
