from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import jwt

from db.session import get_db
from db.models import Barber

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    barber_name: str


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ── POST /auth/login ───────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Validate barber email and password against the database.
    Returns a JWT access token on success.
    Note: passwords are compared as plain text — hash them in production.
    """
    result = await db.execute(
        select(Barber).where(Barber.email == body.email)
    )
    barber = result.scalar_one_or_none()

    if not barber or barber.password != body.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        data={"sub": str(barber.id), "email": barber.email, "name": barber.name}
    )

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        barber_name=barber.name,
    )
