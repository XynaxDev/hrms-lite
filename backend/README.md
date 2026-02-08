# HRMS Lite - Backend Core

This is the high-performance FastAPI backend for the HRMS Lite system.

## 🛠️ Technology Stack
- **FastAPI**: Modern, fast web framework for building APIs.
- **Alchemy/PostgreSQL**: Robust data persistence layer.
- **LangChain**: Intelligence orchestration for the natural language assistant.
- **OpenRouter**: Access to state-of-the-art LLMs.

## 🛠️ Setup & Running

1. **Virtual Env**: `python -m venv venv`
2. **Dependencies**: `pip install -r requirements.txt`
3. **Environment**: Create `.env` based on `.env.example`
4. **Run**: `uvicorn app.main:app --reload`

## 🧪 Demo / Seed Data

This project includes optional demo seed data to help you explore the app quickly.

- The seeded employees/attendance/activities are **fictional test data**.
- You can safely edit/delete them.
- The app works normally with real data as well; seeding is only for convenience during testing.

To manually insert dummy employees:

`python .\seed_dummy_data.py --count 10`

## 📦 Deployment
Configured for **Render** via `render.yaml`.

## 🚀 Detailed Backend Setup (from root README)

### Prerequisites

- **Python** 3.12 or higher
- **PostgreSQL** (local or Supabase)

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

**Windows (PowerShell)**
```powershell
venv\Scripts\Activate.ps1
```

**macOS/Linux**
```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
SECRET_KEY=CHANGE_ME_TO_A_LONG_RANDOM_STRING
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free
DEBUG=true
API_KEY=CHANGE_ME_MATCHES_FRONTEND
```

### Run

```bash
uvicorn app.main:app --reload
```

✅ Backend is now running at:

- API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

## 🌐 Production Deployment Notes (from root README)

### Railway (example)

- **Root Directory:** `backend`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Environment variables example:

```env
DATABASE_URL=<your-supabase-connection-string>
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
API_KEY=<must-match-frontend-key>
```
