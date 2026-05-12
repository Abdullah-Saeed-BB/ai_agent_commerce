from fastapi import APIRouter, Request, Response
from sqlalchemy import select
from telegram import Update
from telegram.ext import (
    Application, 
    CommandHandler, 
    MessageHandler, 
    filters, 
    ContextTypes
)
import os
from db.session import AsyncSessionLocal
from db.models import Conversation, ConversationRole

from dotenv import load_dotenv
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
# TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
TELEGRAM_WEBHOOK_URL = "https://gontn-150-228-11-17.run.pinggy-free.link/webhook/telegram"

ptb = Application.builder().token(TELEGRAM_TOKEN).build() 

# # To make command (e.g. /start)
# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     await update.message.reply_text("Hello! I am running on a FastAPI Webhook.")
# ptb.add_handler(CommandHandler("start", start))

async def handle_response(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    username = update.effective_user.username
    chat_id = update.effective_chat.id

    response = fr"Hi you \({text[:10]}\.\.\.\) this it title _What_ **I** can *do* for you"

    print(f"Received message '{text}' from {username} in chat {chat_id}")

    async with AsyncSessionLocal() as session:
        # Retrieve history
        stmt = select(Conversation).\
            where(Conversation.chatid == str(chat_id)).\
            order_by(Conversation.created_at.desc()).\
            limit(7)
            
        result = await session.execute(stmt)
        history = result.scalars().all()
        
        # print(f"--- Conversation History for {chat_id} ---")
        # for msg in history:
        #     print(f"[{msg.created_at.strftime('%b, %d %H:%M:%S')}] {msg.role}: {msg.content}")
        # print("--- End of History ---")

        # Save User Message
        user_msg = Conversation(
            chatid=str(chat_id),
            content=text,
            role=ConversationRole.USER
        )
        session.add(user_msg)
        
        # Save AI Message
        ai_msg = Conversation(
            chatid=str(chat_id),
            content=response,
            role=ConversationRole.AI
        )
        session.add(ai_msg)
        
        await session.commit()

    try:
        await context.bot.send_message(
            chat_id=chat_id,
            text=response,
            parse_mode="MarkdownV2"
        )
    except Exception as e:
        print(f"Error sending message: {e}")
        await context.bot.send_message(
            chat_id=chat_id,
            text=response
        )

ptb.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_response))

# Routers
router = APIRouter()

@router.post("/telegram")
async def telegram_webhook(request: Request):
    """The actual endpoint Telegram hits"""
    data = await request.json()
    update = Update.de_json(data, ptb.bot)
    await ptb.process_update(update)
    return Response(status_code=200)