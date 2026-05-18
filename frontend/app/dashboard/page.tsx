"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Star, Calendar, TrendingUp, Users, Clock, Briefcase, Scissors } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DashboardStats = {
  business: {
    bookings_per_day: { date: string; count: number }[];
    top_services: { name: string; count: number }[];
  };
  barber: {
    appointments_this_month: number;
    total_appointments: number;
    next_appointments: {
      id: string;
      customer_name: string;
      booking_datetime: string;
      service: string;
    }[];
  };
};

export default function DashboardPage() {
  const router = useRouter();
  const [barberName, setBarberName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("barber_token");
    if (!token) {
      router.replace("/dashboard/login");
      return;
    }
    setBarberName(localStorage.getItem("barber_name"));
    setReady(true);

    // Fetch stats
    fetchStats(token);
  }, [router]);

  async function fetchStats(token: string) {
    try {
      const res = await fetch("http://localhost:8000/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
        }
        return;
      }
      const data = await res.json();
      
      // format dates for the chart
      if (data.business && data.business.bookings_per_day) {
        data.business.bookings_per_day = data.business.bookings_per_day.map((d: any) => {
          const dateObj = new Date(d.date);
          return {
            ...d,
            dayName: dateObj.toLocaleDateString("en-US", { weekday: 'short' })
          };
        });
      }

      setStats(data);
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("barber_token");
    localStorage.removeItem("barber_name");
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
                  <Star size={12} className="text-[#d4af37]" fill="currentColor" />
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

      {/* Main content */}
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2">
            Welcome back, <span className="text-[#d4af37]">{barberName}</span>
          </h1>
          <p className="text-gray-500 text-sm">Here is what's happening with your business today.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <span className="w-8 h-8 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: BARBER INFO */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Barber Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-sm relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar size={48} />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">This Month</p>
                  <h3 className="text-3xl font-black text-white">{stats.barber.appointments_this_month}</h3>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-5 rounded-sm relative overflow-hidden group hover:border-[#d4af37]/30 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase size={48} />
                  </div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total</p>
                  <h3 className="text-3xl font-black text-[#d4af37]">{stats.barber.total_appointments}</h3>
                </div>
              </div>

              {/* Next Appointments */}
              <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock size={18} className="text-[#d4af37]" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Next Appointments</h2>
                </div>
                
                {stats.barber.next_appointments.length > 0 ? (
                  <div className="space-y-4">
                    {stats.barber.next_appointments.map((appt) => (
                      <div key={appt.id} className="flex items-start justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="text-white font-medium">{appt.customer_name}</p>
                          <p className="text-gray-500 text-xs mt-1">{appt.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#d4af37]">
                            {new Date(appt.booking_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(appt.booking_datetime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No upcoming appointments.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: BUSINESS INFO */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Chart */}
              <div className="bg-white/5 border border-white/10 rounded-sm p-6 h-96 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp size={18} className="text-[#d4af37]" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Weekly Bookings</h2>
                </div>
                
                <div className="flex-1 w-full h-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.business.bookings_per_day} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="dayName" 
                        stroke="#ffffff50" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff50" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#ffffff20', borderRadius: '4px' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#d4af37" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Services */}
              <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Scissors size={18} className="text-[#d4af37]" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">Top Services This Month</h2>
                </div>
                
                {stats.business.top_services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.business.top_services.map((service, idx) => (
                      <div key={idx} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[#d4af37] text-xs font-black">#{idx + 1}</span>
                          <p className="text-sm text-gray-300 font-medium">{service.name}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-sm">
                          {service.count}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No services booked this month.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-red-400">
            Failed to load dashboard data.
          </div>
        )}
      </main>
    </div>
  );
}
