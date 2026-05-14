from typing import TypedDict
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from db.session import AsyncSessionLocal
from sqlalchemy import select
from db.models import Conversation

async def load_conversation(chat_id: str):
    """Load conversations for a user"""
    try:
        with open("data/system_prompt.txt") as f:
            system_prompt = f.read()
    except Exception as e:
        print(f"Error while loading system prompt. Error: {e}")
        system_prompt = "You are a helpful assistant."

    conversation = [SystemMessage(content=system_prompt)]
    async with AsyncSessionLocal() as session:
        try:
            stmt = select(Conversation).\
                    where(Conversation.chatid == str(chat_id)).\
                    order_by(Conversation.created_at.desc()).\
                    limit(7)
            result = await session.execute(stmt)
            history = result.scalars().all()

            for content in history:
                if content.role == "USER":
                    conversation.append(HumanMessage(content=content.content))
                else:
                    conversation.append(AIMessage(content=content.content))
        except Exception as e:
            print(f"Error while loading conversations. Error: {e}")
            return []
    
    return conversation

class Message(TypedDict):
    content: str
    role: str

async def save_conversation(chat_id: str, messages: list[Message]):
    """Save conversation to database"""
    async with AsyncSessionLocal() as session:
        try:
            for message in messages:
                conversation = Conversation(
                    chatid=str(chat_id),
                    content=message["content"],
                    role=message["role"]
                )
                session.add(conversation)
            await session.commit()
        except Exception as e:
            print(f"Error while saving conversation. Error: {e}")
            return False
    
    return True