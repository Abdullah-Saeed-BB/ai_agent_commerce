import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Scissors,
  User,
  Clock,
  MapPin,
  Phone,
  Star,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Silver Blade Barbershop | Premium Grooming & Style",
  description:
    "Experience precision meets style at Silver Blade Barbershop. Traditional barbering with a modern touch.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-[#d4af37] selection:text-black scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Silver Blade Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold tracking-tighter uppercase italic">
                Silver <span className="text-[#d4af37]">Blade</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#services"
                className="text-sm font-medium hover:text-[#d4af37] transition-colors"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium hover:text-[#d4af37] transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium hover:text-[#d4af37] transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
              <Star size={14} fill="currentColor" />
              <span>Premium Grooming Experience</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-6 leading-tight animate-slide-up">
              Precision <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f5e1a4] to-[#d4af37]">
                Meets Style
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed animate-slide-up [animation-delay:200ms]">
              Experience the art of traditional barbering combined with modern
              techniques. We don't just cut hair; we craft confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:400ms]">
              <Link
                href="/payment"
                className="group w-full sm:w-auto px-10 py-4 bg-[#d4af37] text-black text-lg font-bold uppercase tracking-widest hover:bg-[#b8962d] transition-all rounded-sm flex items-center justify-center gap-2"
              >
                Book Appointment
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="#services"
                className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white text-lg font-bold uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all rounded-sm"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase italic mb-4">
                Our <span className="text-[#d4af37]">Expertise</span>
              </h2>
              <p className="text-gray-400 text-lg">
                From classic fades to modern styling, our master barbers provide
                unparalleled service tailored to your unique look.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[#d4af37] font-bold text-sm uppercase tracking-widest mb-2">
                View Prices
              </p>
              <div className="h-[2px] w-32 bg-[#d4af37] ml-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<Scissors className="text-[#d4af37]" size={32} />}
              title="Classic Haircut"
              price="$35+"
              description="Precision cut including consultation, wash, and styling."
            />
            <ServiceCard
              icon={<User className="text-[#d4af37]" size={32} />}
              title="Beard Trim"
              price="$25+"
              description="Professional shaping and lining for the modern gentleman."
            />
            <ServiceCard
              icon={<Clock className="text-[#d4af37]" size={32} />}
              title="Hot Towel Shave"
              price="$45+"
              description="Traditional straight razor shave with premium grooming products."
            />
            <ServiceCard
              icon={<Star className="text-[#d4af37]" size={32} />}
              title="Full Service"
              price="$70+"
              description="The ultimate grooming package: Haircut, beard, and shave."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-neutral-900 border border-white/5 rounded-sm overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Image
                    src="/logo.png"
                    alt="Silver Blade Logo Large"
                    width={400}
                    height={400}
                    className="grayscale contrast-150 scale-150"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-[#d4af37] font-bold text-5xl uppercase italic tracking-tighter">
                    EST. 2018
                  </p>
                </div>
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-[#d4af37] pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-[#d4af37] pointer-events-none" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight uppercase italic mb-8 leading-tight">
                Crafting Excellence <br />
                <span className="text-[#d4af37]">In Every Cut</span>
              </h2>
              <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                <p>
                  At Silver Blade Barbershop, we believe that a haircut is more
                  than just a routine—it's a statement. Founded on the
                  principles of traditional craftsmanship and modern
                  hospitality, our shop has become a sanctuary for those who
                  appreciate the finer things in life.
                </p>
                <p>
                  Our barbers are not just technicians; they are artists who
                  understand the geometry of style. We take the time to listen,
                  advise, and execute with surgical precision.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-1">15k+</h4>
                  <p className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">
                    Happy Clients
                  </p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white mb-1">3+</h4>
                  <p className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">
                    Master Barbers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/logo.png"
                  alt="Silver Blade Logo"
                  width={32}
                  height={32}
                />
                <span className="text-xl font-bold tracking-tighter uppercase italic">
                  Silver <span className="text-[#d4af37]">Blade</span>
                </span>
              </div>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Premium grooming services for the modern man. Precision,
                tradition, and excellence in every cut.
              </p>
              <div className="flex gap-4">
                <SocialIcon
                  icon={<InstagramIcon />}
                  href="https://www.instagram.com/silverblade_1/"
                />
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
                Quick Links
              </h4>
              <ul className="space-y-4 text-gray-500">
                <li>
                  <Link
                    href="#services"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="#about"
                    className="hover:text-[#d4af37] transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
                Contact
              </h4>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-[#d4af37] shrink-0" />
                  <span>
                    123 Grooming St, <br />
                    Barber City, BC 45678
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={20} className="text-[#d4af37] shrink-0" />
                  <span>(555) 123-4567</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">
                Hours
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li className="flex justify-between text-sm">
                  <span>Mon - Fri</span> <span>9am - 7pm</span>
                </li>
                <li className="flex justify-between text-sm">
                  <span>Saturday</span> <span>10am - 6pm</span>
                </li>
                <li className="flex justify-between text-[#d4af37] font-bold text-sm">
                  <span>Sunday</span> <span>Closed</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-xs uppercase tracking-widest">
            <p>
              &copy; {new Date().getFullYear()} Silver Blade Barbershop. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  price,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  price: string;
  description: string;
}) {
  return (
    <div className="group p-8 bg-white/5 border border-white/5 rounded-sm hover:border-[#d4af37]/30 transition-all hover:-translate-y-2">
      <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-xl font-bold uppercase italic tracking-tight">
          {title}
        </h3>
        <span className="text-[#d4af37] font-bold">{price}</span>
      </div>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37] transition-all bg-white/5"
    >
      {icon}
    </a>
  );
}

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
