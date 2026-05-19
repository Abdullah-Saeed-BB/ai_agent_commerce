"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Scissors, Star, Eye, EyeOff, LogIn } from "lucide-react";

export default function BarberLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Invalid email or password");
      }

      const data = await res.json();
      // Store in localStorage (client-side guard) and cookie (middleware guard)
      localStorage.setItem("barber_token", data.access_token);
      localStorage.setItem("barber_name", data.barber_name);
      document.cookie = `barber_token=${data.access_token}; path=/; max-age=${8 * 60 * 60}; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex items-center justify-center relative overflow-hidden selection:bg-[#d4af37] selection:text-black">
      {/* Background glow blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-[#d4af37]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/4 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-20 h-20 border-t-2 border-l-2 border-[#d4af37]/30 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-b-2 border-r-2 border-[#d4af37]/30 pointer-events-none" />

      <div className="w-full max-w-md px-6 py-8 relative z-10 animate-slide-up">
        {/* Brand header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/brand_logo_transparent.png"
              alt="Silver Blade Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              Silver <span className="text-[#d4af37]">Blade</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-5">
            <Star size={12} fill="currentColor" />
            <span>Barber Portal</span>
          </div>

          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-tight">
            Welcome{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f5e1a4] to-[#d4af37]">
              Back
            </span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to access your barber dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-sm p-8 backdrop-blur-sm relative">
          {/* Gold top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-sm text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            id="barber-login-form"
          >
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="barber@silverblade.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-[#d4af37]/60 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-gray-400"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-[#d4af37]/60 focus:bg-white/[0.07] transition-all"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#d4af37] transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="group w-full mt-2 px-8 py-4 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-widest hover:bg-[#b8962d] transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Scissors divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-white/5" />
            <Scissors size={14} className="text-[#d4af37]/40" />
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>

          <p className="mt-4 text-center text-xs text-gray-600 uppercase tracking-widest">
            © {new Date().getFullYear()} Silver Blade Barbershop
          </p>
        </div>
      </div>
    </div>
  );
}
