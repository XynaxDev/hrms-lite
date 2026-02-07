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

## 📦 Deployment
Configured for **Render** via `render.yaml`.
