import os
# import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
# from sqlalchemy.orm import selectinload

from db.session import get_db
# from db.models import Booking, PaymentStatus
# from services.generate_bill import generate_bill
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN")


@router.get("/instagram")
async def verify_webhook(request: Request):
    params = request.query_params

    print("`verify_webhook` | Params:", params)

    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return int(challenge)

    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/instagram")
async def instagram_webhook(request: Request):
    data = await request.json()

    print("`instagram_webhook` | Data:", data)

    if "entry" in data:
        for entry in data["entry"]:
            print("  `instagram_webhook` | entry:", entry)
            for messaging_event in entry.get("messaging", []):
                print("    `instagram_webhook` | messaging_event:", messaging_event)
                if "message" in messaging_event:
                    sender_id = messaging_event["sender"]["id"]
                    print("      `instagram_webhook` | sender_id:", sender_id)

                    message = messaging_event["message"]
                    message_text = message.get("text")

                    print(f"Message from {sender_id}: {message_text}")

    return {"status": "ok"}