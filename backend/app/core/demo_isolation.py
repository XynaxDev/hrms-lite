from __future__ import annotations

from fastapi import Depends, Header, Request

from app.core.config import get_settings

settings = get_settings()


def _get_client_ip(request: Request) -> str:
    # Prefer X-Forwarded-For (Railway/proxies), fall back to client.host
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # Take first IP in the list
        return xff.split(",")[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


async def get_demo_scope(
    request: Request,
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> str | None:
    """Return the isolation key to scope all reads/writes in demo mode.

    - mode=device: uses X-Device-Id header
    - mode=ip: uses client IP

    Returns None when isolation is disabled.
    """

    if not settings.DEMO_ISOLATION_ENABLED:
        return None

    mode = (settings.DEMO_ISOLATION_MODE or "device").strip().lower()
    if mode == "ip":
        return _get_client_ip(request)

    # default: device
    return x_device_id
