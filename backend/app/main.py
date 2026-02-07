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
from app.db.database import Base, engine

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.trustedhost import TrustedHostMiddleware

settings = get_settings()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="HRMS Lite API",
    description="API for Human Resource Management System with AI Assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Protect against Host Header Injection
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.render.com", "*.vercel.app""*.railway.app",],
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "X-API-Key",
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
    """Root endpoint to verify API status."""
    return {
        "name": "HRMS Lite API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Create database tables (Alternative to Alembic for simple deployments)
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    print("Database tables created/verified.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG
    )
