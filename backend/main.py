from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from arq import create_pool
from arq.connections import RedisSettings
from contextlib import asynccontextmanager
from routers.telegram import ptb, TELEGRAM_WEBHOOK_URL
import uvicorn
import stripe
import os

from dotenv import load_dotenv
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = await create_pool(RedisSettings())
    app.state.arq_pool = pool

    # Check if Redis is available
    try:
        await pool.ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    if not redis_ok:
        raise RuntimeError("Redis is not working")

    # Check if ARQ workers are available
    worker_keys = await pool.keys("arq:queue:*")
    if not worker_keys:
        raise RuntimeError("No ARQ workers detected")

    # Set webhook for Telegram bot
    await ptb.bot.set_webhook(
        url=TELEGRAM_WEBHOOK_URL,
        allowed_updates=["message", "callback_query"]
    )
    async with ptb:
        await ptb.start()
        yield
        await ptb.stop()    

    await pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from routers import booking, stripe, test, telegram

app.include_router(test.router, prefix="/test", tags=["test"])
app.include_router(booking.router, prefix="/booking", tags=["booking"])
app.include_router(stripe.router, prefix="/webhook", tags=["stripe"])
app.include_router(telegram.router, prefix="/webhook", tags=["telegram"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)