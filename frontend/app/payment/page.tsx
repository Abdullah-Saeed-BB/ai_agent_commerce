"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { BookingData } from "@/components/payment/types";
import { BookingForm } from "@/components/payment/BookingForm";
import { CheckoutForm } from "@/components/payment/CheckoutForm";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function PaymentContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const payment_intent_client_secret = searchParams.get(
    "payment_intent_client_secret",
  );

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking/${id}`,
      );
      if (!res.ok) {
        throw new Error("Failed to load booking");
      }
      const data = await res.json();
      setBooking(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Pending...";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-sm w-full">
          <p className="text-gray-600">No booking ID provided.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#111] font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Left Panel - Booking Info (Dark Theme) */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0a0a0a] text-[#ededed] p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col border-r border-white/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[400px] h-[400px] bg-[#d4af37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex-1 flex flex-col">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors mb-12 w-fit"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">
              Back to Home
            </span>
          </Link>

          <div className="mb-12 flex items-center gap-3">
            <Image
              src="/brand_logo_transparent.png"
              alt="Silver Blade Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight uppercase italic">
              Silver <span className="text-[#d4af37]">Blade</span>
            </h2>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase italic tracking-tight mb-8 text-white border-b border-white/10 pb-4">
              Booking Summary
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                    <div className="h-6 w-48 bg-white/5 rounded"></div>
                  </div>
                ))}
              </div>
            ) : booking ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">
                    Customer
                  </p>
                  <p className="text-lg font-medium">
                    {booking.customer_name || "Pending..."}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">
                    Service
                  </p>
                  <p className="text-lg font-medium flex items-center justify-between">
                    <span>{booking.service || "Pending..."}</span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">
                    Barber
                  </p>
                  <p className="text-lg font-medium">
                    {booking.barber?.name || "Pending..."}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">
                    Date & Time
                  </p>
                  <p className="text-lg font-medium">
                    {formatDate(booking.booking_datetime)}
                  </p>
                </div>
              </div>
            ) : null}

            {booking?.amount && (
              <div className="mt-12 pt-6 border-t border-white/10">
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                    Total due today
                  </p>
                  <p className="text-4xl font-bold text-[#d4af37]">
                    ${booking.amount}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Form / Status */}
      <div className="w-full md:w-[55%] lg:w-[60%] p-8 md:p-12 lg:p-16 flex items-center justify-center bg-[#111]">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#d4af37]" />
              <p className="font-bold uppercase tracking-widest text-sm">
                Loading details...
              </p>
            </div>
          ) : error || !booking ? (
            <div className="text-center bg-[#141414] p-10 rounded-sm shadow-sm border border-red-500/20">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight mb-3">
                Error
              </h2>
              <p className="text-red-400">{error || "Booking not found."}</p>
            </div>
          ) : booking.payment_status === "SUCCESSFUL" ? (
            <div className="text-center bg-[#141414] p-10 rounded-sm shadow-sm border border-green-500/20">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight mb-3">
                Payment Successful!
              </h2>
              <p className="text-gray-400 text-lg">
                Your information is complete and your booking is confirmed.
              </p>
            </div>
          ) : booking.payment_status === "CANCELED" ? (
            <div className="text-center bg-[#141414] p-10 rounded-sm shadow-sm border border-yellow-500/20">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight mb-3">
                Booking Cancelled
              </h2>
              <p className="text-gray-400 text-lg">
                This booking has been cancelled.
              </p>
            </div>
          ) : booking.payment_status === "FAILED" ? (
            <div className="text-center bg-[#141414] p-10 rounded-sm shadow-sm border border-red-500/20">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white uppercase italic tracking-tight mb-3">
                Payment Failed
              </h2>
              <p className="text-gray-400 text-lg">
                An error occurred during your payment. Please try again or
                contact support.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in w-full">
              {!booking.client_secret ||
              booking.payment_status !== "PENDING" ? (
                <BookingForm booking={booking} onSuccess={fetchBooking} />
              ) : (
                stripePromise && (
                  <Elements
                    stripe={stripePromise}
                    options={{ clientSecret: booking.client_secret! }}
                  >
                    <CheckoutForm clientSecret={booking.client_secret!} />
                  </Elements>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
          <div className="animate-pulse flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">
              Loading...
            </span>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
