# HRMS Lite - Enterprise Intelligent Workforce Management

HRMS Lite is a state-of-the-art, full-stack Human Resource Management System designed for modern, high-growth teams. It combines a premium React-based user interface with a powerful FastAPI backend and intelligent data querying powered by **OpenRouter**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.1.0-emerald.svg)
![Tech](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20%7C%20PostgreSQL-indigo.svg)

## ✨ Core Features

- **📊 Intelligent Analytics**: Query your workforce data using natural language via the Integrated Core assistant.
- **👥 People Operations**: Full-featured employee directory with department categorization and status tracking.
- **⏳ Real-time Attendance**: Seamless flow for marking attendance, tracking daily logs, and generating reports.
- **⚡ Performance First**: Built with React 18 and Vite for near-zero latency and buttery smooth Framer Motion animations.
- **🔒 Enterprise Security**: Row-level security architecture with SQLAlchemy ORM and Pydantic data validation.

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

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL Database (Local or Cloud-based like Supabase)

### 2. Backend Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
OPENROUTER_API_KEY=your_key_here
SECRET_KEY=generate_a_strong_random_key_here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct
DEBUG=true
```

**Database Setup**:
If you need to migrate existing data or update column types:
```bash
python migrate_db.py
```

### 3. Frontend Installation
```bash
cd frontend
npm install
```

**Configuration**:
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_KEY=must_match_backend_secret_key
```

### 4. Running Locally
- **Backend**: `uvicorn app.main:app --reload`
- **Frontend**: `npm run dev`

---

## 🌐 Deployment

### Backend (Render)
1. Push the repository to GitHub.
2. Create a new **Web Service** on Render.
3. Connect the repository and set the root directory to `backend`.
4. Render will automatically detect `render.yaml` for configuration.

### Frontend (Vercel)
1. Create a new project on Vercel.
2. Connect the repository and set the root directory to `frontend`.
3. Vercel will auto-detect the Vite configuration.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ by Akash for Modern Operations.**
