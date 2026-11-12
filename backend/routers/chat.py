import uuid
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Response
from langchain_core.messages import HumanMessage

from ai_agent import get_agent
from services.conversation import load_conversation, save_conversation, reset_conversation
from services.schedule_store import take_session_images, get_schedule_image

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.get("/schedule/{image_id}")
async def get_schedule(image_id: str):
    """Serve a schedule image generated during a chat session."""
    # URLs end in .png for a nicer download filename; the stored key is the
    # bare id, so strip the extension before looking up.
    data = get_schedule_image(image_id.removesuffix(".png"))
    if not data:
        raise HTTPException(status_code=404, detail="Schedule image not found")
    return Response(content=data, media_type="image/png")


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
        # The session id doubles as the chat id; tools use it to attach
        # generated artifacts (e.g. schedule images) to this session.
        "telegram_chatid": session_id,
    })
    ai_response = res["messages"][-1].content

    await save_conversation(session_id, [
        {"content": text, "role": "USER"},
        {"content": ai_response, "role": "AI"},
    ])

    images = [
        {"id": image_id, "url": f"/chat/schedule/{image_id}.png"}
        for image_id in take_session_images(session_id)
    ]

    return {"reply": ai_response, "images": images}


@router.post("/{session_id}/reset")
async def reset_session(session_id: str):
    """Clear a session's conversation history."""
    await reset_conversation(session_id)
    return {"status": "reset"}
