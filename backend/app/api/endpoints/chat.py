"""
Chatbot API endpoint.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse
from app.chatbot.agent import get_chat_response

router = APIRouter(prefix="/chat", tags=["Chatbot"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the AI HR Assistant.

    The chatbot uses a controlled tool-calling architecture via LangChain.
    Instead of direct database access, it invokes predefined backend functions
    that execute validated SQL queries using SQLAlchemy.
    """
    try:
        response, tools_called = await get_chat_response(
            request.message, request.history
        )

        return ChatResponse(
            response=response,
            tool_calls=tools_called,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process chat request: {str(e)}"
        )


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
