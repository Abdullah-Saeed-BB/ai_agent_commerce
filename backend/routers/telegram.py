from services.conversation import load_conversation, save_conversation
from langchain_core.messages import HumanMessage
from fastapi import APIRouter, Request, Response
from telegram import Update
from telegram.ext import (
    Application, 
    MessageHandler, 
    filters, 
    ContextTypes
)
import os
from ai_agent import get_agent

from dotenv import load_dotenv
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")

ptb = Application.builder().token(TELEGRAM_TOKEN).build() 

async def handle_response(update: Update, context: ContextTypes.DEFAULT_TYPE):
    agent_app = get_agent()

    text = update.message.text
    username = update.effective_user.username
    chat_id = update.effective_chat.id

    conv = await load_conversation(chat_id)

    res = await agent_app.ainvoke({
        "messages": conv + [HumanMessage(content=text)]
    })
    ai_response = res["messages"][-1].content

    new_messages = [
        {"content": text, "role": "USER"},
        {"content": ai_response, "role": "AI"}
    ]
    is_saved = await save_conversation(chat_id, new_messages)
    
    print("Response:", ai_response, "\nSaved:", is_saved)

    try:
        await context.bot.send_message(
            chat_id=chat_id,
            text=ai_response,
            parse_mode="HTML"
        )
    except Exception as e:
        print(f"Error sending message: {e}")
        parsed_response = ai_response.\
            replace("<b>", "").replace("</b>", "").\
            replace("<i>", "").replace("</i>", "").\
            replace("<br/>", "").replace("<br>", "").\
            replace("<a>", "").replace("</a>", "").\
            replace("<u>", "").replace("</u>", "")
        await context.bot.send_message(
            chat_id=chat_id,
            text=parsed_response
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