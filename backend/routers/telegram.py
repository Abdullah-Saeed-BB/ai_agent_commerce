from fastapi import APIRouter, Request, Response
from telegram import Update
from telegram.ext import (
    Application, 
    CommandHandler, 
    MessageHandler, 
    filters, 
    ContextTypes
)
import os

from dotenv import load_dotenv
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
# TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
TELEGRAM_WEBHOOK_URL = "https://hpvrf-150-228-11-75.run.pinggy-free.link/webhook/telegram"

ptb = Application.builder().token(TELEGRAM_TOKEN).build() 

# # To make command (e.g. /start)
# async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
#     await update.message.reply_text("Hello! I am running on a FastAPI Webhook.")
# ptb.add_handler(CommandHandler("start", start))

async def handle_response(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text
    username = update.effective_user.username
    chat_id = update.effective_chat.id

    response = "Hi this it title _What_ **I** can *do* for you"

    print(f"Received message '{text}' from {username} in chat {chat_id}")
    await context.bot.send_message(
        chat_id=chat_id,
        text=response,
        parse_mode="MarkdownV2"
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