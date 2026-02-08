from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader
from app.core.config import get_settings

settings = get_settings()

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)


async def get_api_key(
    api_key_header: str = Security(api_key_header),
):
    """
    Check for valid API Key in headers.
    In a real app, this would check against a database of valid keys.
    For HRMS Lite, we use the SECRET_KEY as a master key for high-level protection.
    """
    if settings.DEBUG:
        return None

    if not settings.SECRET_KEY:
        # If no secret key is set, we allow access but this is a warning state
        return None

    if api_key_header == settings.SECRET_KEY:
        return api_key_header

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate API Key",
    )
