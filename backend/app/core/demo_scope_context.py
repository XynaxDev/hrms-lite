from __future__ import annotations

from contextvars import ContextVar

_demo_scope_key: ContextVar[str | None] = ContextVar("demo_scope_key", default=None)


def set_demo_scope_key(scope_key: str | None):
    return _demo_scope_key.set(scope_key)


def reset_demo_scope_key(token):
    _demo_scope_key.reset(token)


def get_demo_scope_key() -> str | None:
    return _demo_scope_key.get()
