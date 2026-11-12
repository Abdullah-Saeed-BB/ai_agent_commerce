"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Plus, Loader2, Scissors } from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Message {
  role: "user" | "agent";
  content: string;
  images?: { id: string; url: string }[];
}

function renderContent(html: string) {
  const withBreaks = html.replace(/\n/g, "<br/>");
  const withTarget = withBreaks.replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" ',
  );
  return { __html: withTarget };
}

export default function ChatPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createSession = async () => {
    setMessages([]);
    setLoading(false);
    try {
      const res = await fetch(`${BACKEND_URL}/chat/session`, {
        method: "POST",
      });
      const data = await res.json();
      setSessionId(data.session_id);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  useEffect(() => {
    createSession();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || !sessionId || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          content: data.reply ?? "",
          images: data.images ?? [],
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Scissors className="text-[#d4af37]" size={22} />
            <span className="text-lg font-bold uppercase italic tracking-tighter">
              Silver <span className="text-[#d4af37]">Blade</span> AI Assistant
            </span>
          </Link>
          <button
            onClick={createSession}
            className="flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 text-sm font-bold uppercase tracking-widest text-[#d4af37] transition-colors hover:bg-white/5">
            <Plus size={16} /> New chat
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          {messages.length === 0 && !loading && (
            <div className="mt-16 space-y-3 text-center text-gray-500">
              <Scissors className="mx-auto text-[#d4af37]/50" size={40} />
              <p className="text-lg">
                Ask me about our services and barbers, or book an appointment.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}>
              <div
                className={`max-w-[85%] rounded-sm px-4 py-3 text-[15px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#d4af37] text-black"
                    : "border border-white/10 bg-white/5 text-[#ededed]"
                }`}>
                <div dangerouslySetInnerHTML={renderContent(m.content)} />
                {m.images && m.images.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {m.images.map((img) => (
                      <img
                        key={img.id}
                        src={`${BACKEND_URL}${img.url}`}
                        alt="Available schedule"
                        className="w-full mt-3 max-w-md rounded-sm border border-white/10 bg-white"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-gray-400">
                <Loader2 size={16} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-[15px] placeholder-gray-500 focus:border-[#d4af37]/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-sm bg-[#d4af37] px-5 py-3 font-bold uppercase tracking-widest text-black transition-all hover:bg-[#b8962d] disabled:cursor-not-allowed disabled:opacity-40">
              <Send size={18} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
