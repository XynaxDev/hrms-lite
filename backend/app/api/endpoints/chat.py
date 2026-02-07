"""Chatbot API endpoint."""

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.chatbot.agent import get_chat_response
from app.core.demo_isolation import get_demo_scope
from app.core.demo_scope_context import reset_demo_scope_key, set_demo_scope_key

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, scope_key: str | None = Depends(get_demo_scope)):
    """
    Send a message to the AI HR Assistant.

    The chatbot uses a controlled tool-calling architecture via LangChain.
    Instead of direct database access, it invokes predefined backend functions
    that execute validated SQL queries using SQLAlchemy.
    """
    token = set_demo_scope_key(scope_key)
    try:
        response, tools_called = await get_chat_response(request.message, request.history)
        return ChatResponse(response=response, tool_calls=tools_called)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat request: {str(e)}")
    finally:
        reset_demo_scope_key(token)


@router.get("/health")
def chat_health():
    """Check chatbot health status."""
    return {
        "status": "healthy",
        "service": "HRMS AI Assistant",
        "capabilities": [
            "Employee count and headcount",
            "Department breakdowns",
            "Employee search",
            "Leave status",
            "Attendance information",
        ],
    }
