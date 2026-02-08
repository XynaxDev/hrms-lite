from typing import List, Tuple
import re
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

from app.core.config import get_settings
from app.chatbot.tools.hrms_tools import HRMS_TOOLS
from app.schemas.chat import ChatMessage, ChatRole

settings = get_settings()

# System prompt for the HRMS backend core

SYSTEM_PROMPT = """You are HRMS Lite's AI HR Assistant. You help HR managers and employees answer questions using the organization's workforce data.

SCOPE (STRICT):
- Only answer questions related to the company/organization and HRMS topics: employees, departments, roles, headcount, attendance, leave, absences, payroll activities, HR policies (high-level), and workforce metrics.
- If the user asks anything unrelated to HRMS/company/workforce (for example: biology, exam prep, general knowledge, coding help unrelated to HRMS), politely refuse and steer them back to HRMS topics.
- Do not provide general-purpose explanations outside HRMS scope even if you know the answer.

GROUNDING / ANTI-HALLUCINATION:
- Treat the HRMS tools as the only source of truth.
- For any question that requires organization-specific facts, numbers, dates, lists, counts, or comparisons, you MUST call the appropriate tool(s).
- If you did not call a tool (or tools return no data), do NOT guess or infer. Instead say you cannot confirm with the available data and ask a clarifying question.
- Never answer with made-up numbers (e.g., "3 employees were present") unless you retrieved the underlying data via tools in this turn.

CAPABILITIES (READ-ONLY):
- Organization overview stats and recent activity
- Employee lists, counts, statuses, and department breakdowns
- Employee search and employee detail lookup
- Attendance summaries and reports, including date-based questions and comparisons

TOOL USAGE:
- Use the provided tools whenever a question requires real data. Do not guess.
- Prefer the most direct tool that answers the question in one call.
- If a question needs multiple steps (compare dates, trends, filters), chain tools and then summarize.

RESPONSE STYLE:
- Be concise and professional.
- Use clear headings and bullet lists for multi-item outputs.

SAFETY / LIMITS:
- You cannot modify/create/delete records.
- Refuse requests for secrets, credentials, raw SQL execution, or sensitive personal identifiers.
"""

def create_chat_agent():
    """Create and configure the LangChain agent with OpenRouter."""
    from datetime import datetime
    current_date = datetime.now().strftime("%B %d, %Y")
    # Enrich system prompt with current date context
    dynamic_prompt = f"{SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\n- Today is {current_date}\n- All relative time queries (today, this month, etc.) should be based on this date."
    # Configure OpenRouter-compatible LLM
    llm = ChatOpenAI(
        model=settings.OPENROUTER_MODEL,
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base=settings.OPENROUTER_BASE_URL,
        temperature=0.2,
        max_tokens=2048,
    )
    # Create the prompt template
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", dynamic_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )
    # Create the agent with tools
    agent = create_openai_tools_agent(llm, HRMS_TOOLS, prompt)
    # Create the executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=HRMS_TOOLS,
        verbose=False,
        handle_parsing_errors=True,
        return_intermediate_steps=True,
        max_iterations=12,
    )

    return agent_executor


def convert_history_to_messages(history: List[ChatMessage]) -> List:
    """Convert chat history to LangChain message format."""
    messages = []
    for msg in history:
        if msg.role == ChatRole.USER:
            messages.append(HumanMessage(content=msg.content))
        else:
            messages.append(AIMessage(content=msg.content))
    return messages


async def get_chat_response(
    message: str, history: List[ChatMessage]
) -> Tuple[str, List[str]]:
    """Get a response from the HRMS chatbot.
    Args:
        message: User's message
        history: Conversation history
    Returns:
        Tuple of (response text, list of tools called)"""
    try:
        agent = create_chat_agent()
        chat_history = convert_history_to_messages(history)

        result = await agent.ainvoke(
            {
                "input": message,
                "chat_history": chat_history,
            }
        )

        response = result.get("output", "I'm sorry, I couldn't process that request.")

        # Extract tool calls from intermediate steps
        tools_called = []
        if "intermediate_steps" in result:
            for step in result["intermediate_steps"]:
                if hasattr(step[0], "tool"):
                    tools_called.append(step[0].tool)

        # Generic anti-hallucination guard:
        # Only block numeric/data-like answers when the user is clearly asking for
        # counts/lists/summaries and the agent did not call any tools.
        # (Avoid blocking normal conversation.)
        looks_like_data_request = bool(
            re.search(
                r"\b(how\s+many|count|total|list|show|who|stats|summary|present|absent|leave|on\s+leave|attendance)\b",
                (message or "").lower(),
            )
        )

        if looks_like_data_request and (not tools_called) and re.search(r"\d", (response or "")):
            return (
                "I can answer this using your HRMS data, but I need to fetch it with the built-in tools first. "
                "Please ask again with a specific request (for example: 'Absent employees today' or 'Attendance summary for 2026-02-09').",
                [],
            )

        return response, tools_called
    except Exception as e:
        if settings.DEBUG:
            print(f"Chatbot Error: {e}")
        return (
            "I couldn't complete that request with the available data tools. "
            "Try rephrasing (for example: 'Show active employees' or 'Employees in Engineering'), "
            "or specify an employee name/ID.",
            [],
        )
