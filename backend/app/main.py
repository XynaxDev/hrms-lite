"""
Main entry point for the HRMS Lite FastAPI application.
AUTHOR: Akash Kumar
LICENSE: MIT (C) 2026 HRMS Enterprise Systems
PROJECT_ID: [AUTHENTIC_MINT_ID: HRMS-AK-2026-X9]
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.router import api_router
from app.core.config import get_settings
from app.db.database import Base, SessionLocal, engine
from sqlalchemy import text

from app.models.activity import Activity
from app.models.attendance import Attendance, AttendanceStatusEnum
from app.models.employee import DepartmentEnum, Employee, StatusEnum
from app.seed import seed_global_demo_data

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.trustedhost import TrustedHostMiddleware

settings = get_settings()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
docs_url = "/docs" if settings.DEBUG else None
redoc_url = "/redoc" if settings.DEBUG else None

app = FastAPI(
    title="HRMS Lite API",
    version="1.0.0",
    docs_url=docs_url,
    redoc_url=redoc_url,
)


# Add Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Protect against Host Header Injection
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=(
        ["*"]
        if settings.DEBUG
        else [
            "localhost",
            "127.0.0.1",
            "*.render.com",
            "*.onrender.com",
            "*.vercel.app",
            "*.railway.app",
        ]
    ),
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "X-API-Key",
        "X-Device-Id",
        "Content-Type",
        "Authorization",
    ],  # Explicitly list allowed headers
)


# Standard Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)

    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )

    # Only apply strict CSP in production
    if not settings.DEBUG:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
        )

    return response


# Exception handler for generic errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "An internal server error occurred.",
            "detail": str(exc) if settings.DEBUG else None,
        },
    )


# Include API routes
app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": "HRMS Lite API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs" if settings.DEBUG else None,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Create database tables (Alternative to Alembic for simple deployments)
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

    # ALTER TYPE ... ADD VALUE cannot run inside a transaction block on many
    # Postgres versions. Use AUTOCOMMIT to ensure it actually takes effect.
    for label in ("ACTIVE", "INACTIVE", "TERMINATED", "ON_LEAVE"):
        try:
            with engine.connect().execution_options(
                isolation_level="AUTOCOMMIT"
            ) as conn:
                conn.execute(
                    text(f"ALTER TYPE statusenum ADD VALUE IF NOT EXISTS '{label}'")
                )
        except Exception:
            pass

    with engine.begin() as conn:
        # Normalize any legacy/title-case values to uppercase labels.
        # Use ::text casting so it works regardless of enum label set.
        try:
            conn.execute(
                text(
                    """
                    UPDATE employees
                    SET status = CASE
                        WHEN status::text IN ('Active', 'ACTIVE') THEN 'ACTIVE'
                        WHEN status::text IN ('Inactive', 'INACTIVE') THEN 'INACTIVE'
                        WHEN status::text IN ('Terminated', 'TERMINATED') THEN 'TERMINATED'
                        WHEN status::text IN ('On Leave', 'ON_LEAVE', 'ON LEAVE', 'ON-LEAVE') THEN 'ON_LEAVE'
                        ELSE status
                    END
                    """
                )
            )
        except Exception:
            pass

    # Ensure optional demo-isolation columns exist even when demo isolation is disabled.
    # This prevents runtime 500s when running against an older database schema.
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS device_id TEXT"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_employees_device_id ON employees(device_id)"))
        except Exception:
            pass

        try:
            conn.execute(text("ALTER TABLE IF EXISTS attendance ADD COLUMN IF NOT EXISTS device_id TEXT"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_attendance_device_id ON attendance(device_id)"))
        except Exception:
            pass

        try:
            conn.execute(text("ALTER TABLE IF EXISTS activities ADD COLUMN IF NOT EXISTS device_id TEXT"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_activities_device_id ON activities(device_id)"))
        except Exception:
            pass

    db = SessionLocal()
    try:
        if (not settings.DEMO_ISOLATION_ENABLED) or settings.DEMO_SHARED_EMPLOYEES:
            seed_global_demo_data(db)
    finally:
        db.close()
    print("Database tables created/verified.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
