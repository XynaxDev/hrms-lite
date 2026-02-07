"""
LangChain agent for HRMS chatbot with OpenRouter integration.
Uses controlled tool-calling architecture for secure database access.
"""

from typing import List, Tuple
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

from app.core.config import get_settings
from app.chatbot.tools.hrms_tools import HRMS_TOOLS
from app.schemas.chat import ChatMessage, ChatRole

settings = get_settings()

# System prompt for the HRMS backend core
SYSTEM_PROMPT = """You are HRMS Lite's Intelligent Core. You help HR managers and employees with workforce data and queries.

Your capabilities include:
- Providing recent organization activity and events
- Providing employee count and headcount information
- Showing department breakdowns and distributions
- Finding employees who are on leave
- Searching for specific employees by name, email, or role
- Showing attendance records and statistics
- Getting details about specific employees

IMPORTANT GUIDELINES:
1. Be professional, helpful, and concise in your responses
2. Use the available tools to fetch real data from the database
3. If asked about something you cannot do (like modifying salaries, firing employees, or accessing sensitive personal data), politely explain that those actions require administrative privileges
4. Always provide accurate information based on the database queries
5. When presenting lists, format them clearly for easy reading
6. If a query returns no results, suggest alternative searches or ask for clarification

Remember: You only have READ access to employee and attendance data. You cannot modify, create, or delete records through this interface."""


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
        temperature=0.7,
        max_tokens=1024,
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
        verbose=settings.DEBUG,
        handle_parsing_errors=True,
        max_iterations=5,
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
    """
    Get a response from the HRMS chatbot.

    Args:
        message: User's message
        history: Conversation history

    Returns:
        Tuple of (response text, list of tools called)
    """
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

        return response, tools_called

    except Exception as e:
        error_msg = (
            f"I'm having trouble connecting to my systems right now. Error: {str(e)}"
        )
        if settings.DEBUG:
            print(f"Chatbot Error: {e}")
        return error_msg, []
