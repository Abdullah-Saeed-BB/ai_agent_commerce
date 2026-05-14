import pickle
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
import requests

from dotenv import load_dotenv
load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
print("telegram webhook:", TELEGRAM_WEBHOOK_URL)

ptb = Application.builder().token(TELEGRAM_TOKEN).build() 

def clean_br_tag(text: str):
    return text.replace("<br/>", "\n").replace("<br>", "\n").replace("</br>", "\n")

def send_bill_to_telegram(chat_id, pdf_buffer, filename="invoice.pdf"):
    token = TELEGRAM_TOKEN
    url = f"https://api.telegram.org/bot{token}/sendDocument"
    
    files = {
        'document': (filename, pdf_buffer, 'application/pdf')
    }
    data = {
        'chat_id': chat_id,
        'caption': "Here is your booking receipt from Silver Blade! ✂️"
    }
    
    response = requests.post(url, data=data, files=files)
    return response.json()

def send_photo_to_telegram(chat_id, photo_buffer, filename="image.png"):
    token = TELEGRAM_TOKEN
    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    
    files = {
        'photo': (filename, photo_buffer, 'image/png')
    }
    data = {
        'chat_id': chat_id,
    }
    
    response = requests.post(url, data=data, files=files)
    return response.json()

CONV_PATH = "./.data/conv_7.pkl"
async def handle_response(update: Update, context: ContextTypes.DEFAULT_TYPE):
    agent_app = get_agent()

    text = update.message.text
    username = update.effective_user.username
    chat_id = update.effective_chat.id

    conv = await load_conversation(chat_id)

    res = await agent_app.ainvoke({
        "messages": conv + [HumanMessage(content=text)],
        "telegram_chatid": str(chat_id)
    })
    with open(CONV_PATH, "wb") as file:
        pickle.dump(res, file)
    ai_response = res["messages"][-1].content

    new_messages = [
        {"content": ai_response, "role": "AI"},
        {"content": text, "role": "USER"}
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
            replace("<br/>", "\n").replace("</br>", "\n").\
            replace("<br>", "\n").\
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