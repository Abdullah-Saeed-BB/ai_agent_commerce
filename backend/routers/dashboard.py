from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, cast, Date
from datetime import datetime, timedelta
import jwt
import os

from db.session import get_db
from db.models import Barber, Booking, Services
from routers.auth import SECRET_KEY, ALGORITHM

router = APIRouter()
security = HTTPBearer()

async def get_current_barber(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        barber_id: str = payload.get("sub")
        if not barber_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return barber_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/stats")
async def get_dashboard_stats(barber_id: str = Depends(get_current_barber), db: AsyncSession = Depends(get_db)):
    now = datetime.now()
    seven_days_ago = now - timedelta(days=7)
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 1. Business: Bookings per day (last 7 days)
    bookings_per_day_query = (
        select(
            cast(Booking.booking_datetime, Date).label("date"),
            func.count(Booking.id).label("count")
        )
        .where(Booking.booking_datetime >= seven_days_ago)
        .group_by(cast(Booking.booking_datetime, Date))
        .order_by(cast(Booking.booking_datetime, Date))
    )
    result_bpd = await db.execute(bookings_per_day_query)
    bookings_per_day = [
        {"date": row.date.strftime("%Y-%m-%d"), "count": row.count} 
        for row in result_bpd.all()
    ]

    # Fill missing days with 0
    date_counts = {item["date"]: item["count"] for item in bookings_per_day}
    filled_bookings_per_day = []
    for i in range(7):
        day = (seven_days_ago + timedelta(days=i)).strftime("%Y-%m-%d")
        filled_bookings_per_day.append({"date": day, "count": date_counts.get(day, 0)})

    # 2. Business: Top 3 services this month
    top_services_query = (
        select(Services.name, func.count(Booking.id).label("count"))
        .join(Booking.service)
        .where(Booking.booking_datetime >= this_month_start)
        .group_by(Services.name)
        .order_by(desc("count"))
        .limit(3)
    )
    result_ts = await db.execute(top_services_query)
    top_services = [{"name": row.name, "count": row.count} for row in result_ts.all()]

    # 3. Barber: Appointments this month
    appt_this_month = await db.scalar(
        select(func.count(Booking.id))
        .where(Booking.barber_id == barber_id)
        .where(Booking.booking_datetime >= this_month_start)
    )

    # 4. Barber: Total appointments
    total_appt = await db.scalar(
        select(func.count(Booking.id))
        .where(Booking.barber_id == barber_id)
    )

    # 5. Barber: Next appointments
    next_appt_query = (
        select(Booking, Services.name.label("service_name"))
        .outerjoin(Services, Booking.service_id == Services.id)
        .where(Booking.barber_id == barber_id)
        .where(Booking.booking_datetime >= now)
        .order_by(Booking.booking_datetime.asc())
        .limit(5)
    )
    result_na = await db.execute(next_appt_query)
    next_appointments = []
    for row in result_na.all():
        booking = row.Booking
        service_name = row.service_name
        next_appointments.append({
            "id": str(booking.id),
            "customer_name": booking.customer_name or "Guest",
            "booking_datetime": booking.booking_datetime.isoformat() if booking.booking_datetime else None,
            "service": service_name or "N/A"
        })

    return {
        "business": {
            "bookings_per_day": filled_bookings_per_day,
            "top_services": top_services
        },
        "barber": {
            "appointments_this_month": appt_this_month or 0,
            "total_appointments": total_appt or 0,
            "next_appointments": next_appointments
        }
    }
