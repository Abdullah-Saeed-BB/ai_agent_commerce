"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="#"
            onClick={closeMenu}
            className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Image
              src="/brand_logo_transparent.png"
              alt="Silver Blade Logo"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tighter uppercase italic">
              Silver <span className="text-[#d4af37]">Blade</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/chat"
              className="flex items-center gap-1.5 text-sm hover:text-[#d4af37] transition-colors">
              <Sparkles size={16} />
              AI Assistant
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium hover:text-[#d4af37] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 -mr-2 text-[#ededed] hover:text-[#d4af37] transition-colors">
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
            <Link
              href="/chat"
              onClick={closeMenu}
              className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium rounded-sm hover:bg-white/5 hover:text-[#d4af37] transition-colors">
              <Sparkles size={16} />
              AI Assistant
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="px-3 py-3 text-sm font-medium rounded-sm hover:bg-white/5 hover:text-[#d4af37] transition-colors">
                {link.label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={closeMenu}
              className="mt-2 px-3 py-3 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-widest text-center rounded-sm">
              Try the AI Assistant
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
