import React, { useState, useEffect } from "react";
import { BookingData, ServiceData, BarberData } from "./types";

interface BookingFormProps {
  booking: BookingData;
  onSuccess: () => void;
}

interface AvailableSlot {
  time: string;
  available_barbers: { id: string; name: string }[];
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replaceAll("_", " ")
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState(booking.customer_name || "");
  const [service, setService] = useState(booking.service || "");
  const [barber, setBarber] = useState(booking.barber?.name || "");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [services, setServices] = useState<ServiceData[]>([]);
  const [barbers, setBarbers] = useState<BarberData[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse existing datetime if available
  useEffect(() => {
    if (booking.booking_datetime) {
      const dt = new Date(booking.booking_datetime);
      const tzOffset = dt.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(dt.getTime() - tzOffset)
        .toISOString()
        .slice(0, 10);
      setBookingDate(localISOTime);

      const hours = dt.getHours().toString().padStart(2, "0");
      const minutes = dt.getMinutes().toString().padStart(2, "0");
      setBookingTime(`${hours}:${minutes}`);
    }
  }, [booking.booking_datetime]);

  // Fetch initial data
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/data/services`)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/data/barbers`)
      .then((res) => res.json())
      .then((data) => setBarbers(data))
      .catch(console.error);
  }, []);

  // Fetch slots when date or barber changes
  useEffect(() => {
    if (bookingDate) {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/availability?date=${bookingDate}`;

      if (barber) {
        const barberObj = barbers.find((b) => b.name === barber);
        if (barberObj) {
          url += `&barber_id=${barberObj.id}`;
        }
      }

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.available_slots) {
            setAvailableSlots(data.available_slots);
            // If the selected time is no longer available, clear it
            if (bookingTime && !data.available_slots.includes(bookingTime)) {
              // We don't clear it immediately in case it's their existing booked slot
            }
          }
        })
        .catch(console.error);
    } else {
      setAvailableSlots([]);
    }
  }, [bookingDate, barber, barbers, bookingTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!customerName || !service || !barber || !bookingDate || !bookingTime) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    // Combine date and time
    const combinedDateTime = `${bookingDate}T${bookingTime}:00`;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/${booking.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: customerName,
            service: service,
            barber: barber,
            booking_datetime: combinedDateTime,
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.detail || "Failed to update booking");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#141414] p-8 rounded-sm shadow-sm border border-white/5"
    >
      <h2 className="text-xl font-bold uppercase italic tracking-tight mb-6 text-white border-b border-white/10 pb-4">
        Complete Booking Details
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-5 text-gray-300">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Customer Name
          </label>
          <input
            type="text"
            className="w-full border border-white/10 bg-black/50 text-white rounded-sm p-3 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Service
          </label>
          <select
            className="w-full border border-white/10 bg-black/50 text-white rounded-sm p-3 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all appearance-none"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            <option value="" className="bg-[#141414]">
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.name} className="bg-[#141414]">
                {toTitleCase(s.name)} (${s.price})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Barber
          </label>
          <select
            className="w-full border border-white/10 bg-black/50 text-white rounded-sm p-3 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all appearance-none"
            value={barber}
            onChange={(e) => setBarber(e.target.value)}
            required
          >
            <option value="" className="bg-[#141414]">
              Select a barber
            </option>
            {barbers.map((b) => (
              <option key={b.id} value={b.name} className="bg-[#141414]">
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full border border-white/10 bg-black/50 text-white rounded-sm p-3 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              style={{ colorScheme: "dark" }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Time
            </label>
            <select
              className="w-full border border-white/10 bg-black/50 text-white rounded-sm p-3 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all appearance-none disabled:opacity-50"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              required
              disabled={!bookingDate}
            >
              <option value="" className="bg-[#141414]">
                Select a time
              </option>
              {bookingTime &&
                !availableSlots.some((slot) => slot.time === bookingTime) && (
                  <option value={bookingTime} className="bg-[#141414]">
                    {bookingTime}
                  </option>
                )}
              {availableSlots.map((slot) => (
                <option
                  key={slot.time}
                  value={slot.time}
                  className="bg-[#141414]"
                >
                  {slot.time} |{" "}
                  {slot.available_barbers.map((b) => b.name).join(", ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#d4af37] text-black font-bold uppercase tracking-widest py-4 px-6 mt-4 rounded-sm hover:bg-[#b8962d] transition-all disabled:opacity-50"
        >
          {loading ? "Saving..." : "Confirm Details"}
        </button>
      </div>
    </form>
  );
};
