import uuid
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
from collections import defaultdict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from db.models import Booking, Barber, PaymentStatus
from services.get_slots import generate_slots

async def get_availability(
    db: AsyncSession,
    start_date: date,
    end_date: date,
    barber_id: Optional[uuid.UUID] = None
) -> List[Dict[str, Any]]:
    """
    Return available time slots between start_date and end_date.
    If barber_id is provided, only return slots where that barber is available.
    Otherwise, return slots where at least one barber is available.
    """
    all_slots = generate_slots()

    # 1. Fetch active barbers
    barber_stmt = select(Barber)
    if barber_id:
        barber_stmt = barber_stmt.where(Barber.id == barber_id)
    
    barbers_result = await db.execute(barber_stmt)
    active_barbers = barbers_result.scalars().all()
    
    if not active_barbers:
        return []
    
    barber_lookup = {b.id: b.name for b in active_barbers}

    # 2. Fetch existing bookings
    stmt = (
        select(Booking)
        .where(
            and_(
                func.date(Booking.booking_datetime) >= start_date,
                func.date(Booking.booking_datetime) <= end_date,
                Booking.payment_status.in_([PaymentStatus.PENDING, PaymentStatus.SUCCESSFUL])
            )
        )
    )
    result = await db.execute(stmt)
    bookings = result.scalars().all()

    # 3. Create map of {date: {time: set(booked_barber_ids)}}
    booked_map = defaultdict(lambda: defaultdict(set))
    for b in bookings:
        d_key = b.booking_datetime.date()
        t_key = b.booking_datetime.time()
        booked_map[d_key][t_key].add(b.barber_id)

    # 4. Build availability structure
    available_data = []
    
    current_date = start_date
    while current_date <= end_date:
        day_availability = []
        for slot_time in all_slots:
            free_barbers = [
                {"id": b_id, "name": b_name}
                for b_id, b_name in barber_lookup.items()
                if b_id not in booked_map[current_date][slot_time]
            ]
            
            if free_barbers:
                day_availability.append({
                    "time": slot_time.strftime("%H:%M"),
                    "available_barbers": free_barbers
                })
                
        if day_availability:
            available_data.append({
                "date": current_date.isoformat(),
                "available_slots": day_availability
            })
            
        current_date += timedelta(days=1)

    return available_data


async def create_booking(
    db: AsyncSession,
    customer_name: Optional[str] = None,
    booking_datetime: Optional[datetime] = None,
    service_id: Optional[uuid.UUID] = None,
    barber_id: Optional[uuid.UUID] = None,
    payment_id: Optional[str] = None,
    telegram_chatid: Optional[str] = None,
    arq_pool=None
) -> Booking:
    """
    Create a new booking and optionally schedule an auto-cancel task.
    """
    new_booking = Booking(
        payment_id=payment_id,
        service_id=service_id,
        barber_id=barber_id,
        booking_datetime=booking_datetime,
        customer_name=customer_name,
        telegram_chatid=telegram_chatid
    )
    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)

    if arq_pool:
        await arq_pool.enqueue_job(
            "cancel_booking_task",
            booking_id=str(new_booking.id),
            _defer_by=30 * 60,
        )

    return new_booking
