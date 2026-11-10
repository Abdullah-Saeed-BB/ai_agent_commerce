from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from arq import create_pool
from arq.connections import RedisSettings
from contextlib import asynccontextmanager
import uvicorn
import stripe
import os

from dotenv import load_dotenv
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Redis/ARQ is optional. When it's missing, the app still boots and the
    # auto-cancel background task is simply skipped (create_booking no-ops).
    pool = None
    try:
        pool = await create_pool(RedisSettings())
        await pool.ping()
        print("Connected to Redis — ARQ auto-cancel enabled.")
    except Exception as e:
        print(f"Redis/ARQ unavailable ({e}) — running without background auto-cancel.")
        pool = None

    app.state.arq_pool = pool

    yield

    if pool:
        await pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from routers import booking, stripe, test, chat, auth, dashboard

app.include_router(test.router, prefix="/test", tags=["test"])
app.include_router(booking.router, prefix="/booking", tags=["booking"])
app.include_router(stripe.router, prefix="/webhook", tags=["stripe"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
