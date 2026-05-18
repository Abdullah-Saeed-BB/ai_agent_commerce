"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Scissors, LogOut, Star } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [barberName, setBarberName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("barber_token");
    if (!token) {
      router.replace("/dashboard/login");
      return;
    }
    setBarberName(localStorage.getItem("barber_name"));
    setReady(true);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("barber_token");
    localStorage.removeItem("barber_name");
    // Clear the middleware cookie too
    document.cookie = "barber_token=; path=/; max-age=0; SameSite=Lax";
    router.replace("/dashboard/login");
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Image
                src="/brand_logo_transparent.png"
                alt="Silver Blade Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="text-lg font-black tracking-tighter uppercase italic">
                Silver <span className="text-[#d4af37]">Blade</span>
              </span>
              <span className="hidden sm:block text-white/20 text-xs font-bold uppercase tracking-widest ml-2">
                / Dashboard
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {barberName && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Star
                    size={12}
                    className="text-[#d4af37]"
                    fill="currentColor"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-300">
                    {barberName}
                  </span>
                </div>
              )}
              <button
                id="dashboard-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#d4af37] border border-white/10 hover:border-[#d4af37]/30 rounded-sm transition-all"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content — empty for now */}
      <main className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="text-center animate-slide-up relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-white/5 border border-white/10 mb-8">
            <Scissors size={36} className="text-[#d4af37]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f5e1a4] to-[#d4af37]">
              Dashboard
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-sm mx-auto">
            Content coming soon. You&apos;re successfully authenticated,{" "}
            <span className="text-[#d4af37] font-bold">{barberName}</span>.
          </p>
        </div>
      </main>
    </div>
  );
}
