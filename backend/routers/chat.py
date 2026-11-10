import uuid
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage

from ai_agent import get_agent
from services.conversation import load_conversation, save_conversation, reset_conversation

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/session")
async def create_session():
    """Create a new chat session. The session id doubles as the conversation chatid."""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}


@router.post("/{session_id}/message")
async def send_message(session_id: str, body: ChatRequest):
    """Run the AI agent on a user message and persist the conversation."""
    agent_app = get_agent()

    text = body.message.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    conv = await load_conversation(session_id)

    res = await agent_app.ainvoke({
        "messages": conv + [HumanMessage(content=text)],
        "telegram_chatid": None,
    })
    ai_response = res["messages"][-1].content

    await save_conversation(session_id, [
        {"content": text, "role": "USER"},
        {"content": ai_response, "role": "AI"},
    ])

    return {"reply": ai_response}


@router.post("/{session_id}/reset")
async def reset_session(session_id: str):
    """Clear a session's conversation history."""
    await reset_conversation(session_id)
    return {"status": "reset"}
