"""
Pydantic schemas for Chatbot API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class ChatRole(str, Enum):
    """Chat message role."""

    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(BaseModel):
    """Single chat message."""

    role: ChatRole
    content: str


class ChatRequest(BaseModel):
    """Chat request schema."""

    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    history: Optional[List[ChatMessage]] = Field(
        default=[], description="Conversation history"
    )


class ChatResponse(BaseModel):
    """Chat response schema."""

    response: str = Field(..., description="Assistant response")
    tool_calls: Optional[List[str]] = Field(
        default=[], description="Tools called during response"
    )
