"use client";

import { logo1, officeBottle, watertruck, watertank, watercleaning } from "@/assets/images";
import { Building2, Truck, Droplets, SprayCan, Phone, Mail, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";

const services = [
  {
    title: "Water Truck Delivery",
    description:
      "Reliable bulk water delivery for apartments, businesses, construction sites, schools, and other organizations that need a dependable supply. We deliver water in bulk directly to your location on a schedule that works for you.",
    image: watertruck,
    alt: "Water truck delivering clean water",
    icon: Truck,
    highlights: [
      "Bulk delivery for any volume",
      "Scheduled or on-demand",
      "Apartments, offices, schools & sites",
    ],
  },
  {
    title: "Water Tanks",
    description:
      "We supply water tanks in a wide range of sizes for residential, commercial, and agricultural use. Popular capacities include 500L, 1,000L, 2,500L, 5,000L, and 10,000L. Choose from vertical, horizontal, or rectangular loft designs — all made with UV-protected, food-grade materials.",
    image: watertank,
    alt: "Water storage tanks for residential and commercial use",
    icon: Droplets,
    highlights: [
      "500L to 10,000L+ capacities",
      "Vertical, horizontal & loft designs",
      "UV-protected, food-grade plastic",
    ],
  },
  {
    title: "Water Tank Cleaning",
    description:
      "Keep your stored water safe and clean with professional tank cleaning services. Regular cleaning helps maintain tank hygiene, prevents sediment build-up, and supports safe water storage for your home or business.",
    image: watercleaning,
    alt: "Professional water tank cleaning service",
    icon: SprayCan,
    highlights: [
      "Professional cleaning teams",
      "Sediment & algae removal",
      "Residential & commercial tanks",
    ],
  },
];

export default function CorporatePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar title="Corporate Solutions" showBack={true} />

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <CorporateContent user={user} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <CorporateContent user={user} desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function CorporateContent({ user, desktop }: { user: { name: string; phone: string } | null; desktop?: boolean }) {
  return (
    <>
      {/* Hero */}
      <div className={`bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl text-white relative overflow-hidden mb-8 ${desktop ? "p-12" : "p-6"}`}>
        <div className={`flex ${desktop ? "items-center gap-10" : "flex-col"}`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Building2 size={desktop ? 32 : 24} />
              <h1 className={`font-extrabold ${desktop ? "text-4xl" : "text-2xl"}`}>
                Corporate Water Solutions
              </h1>
            </div>
            <p className={`text-white/80 ${desktop ? "text-lg max-w-lg mt-3" : "text-sm mt-2"}`}>
              MiMaji supports businesses, institutions, property managers, and organizations with dependable water services — including bulk water delivery, water storage solutions, and tank cleaning services.
            </p>
            <div className={`flex gap-3 ${desktop ? "mt-6" : "mt-4"}`}>
              <Link
                href="/buy"
                className={`inline-flex items-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full transition-colors ${desktop ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"}`}
              >
                Order Now
              </Link>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full transition-colors ${desktop ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"}`}
              >
                Contact Us
              </Link>
            </div>
          </div>
          {desktop && (
            <div className="flex-shrink-0">
              <div className="w-[280px] h-[200px] rounded-2xl overflow-hidden">
                <img src={officeBottle.src} alt="Corporate water delivery" className="object-cover w-full h-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <h2 className={`font-extrabold text-text-primary ${desktop ? "text-3xl mb-2" : "text-xl mb-1"}`}>
        Our Services
      </h2>
      <p className={`text-text-secondary mb-6 ${desktop ? "text-base" : "text-sm"}`}>
        Everything your organization needs for reliable water supply and maintenance.
      </p>

      <div className={`${desktop ? "grid grid-cols-3 gap-6" : "flex flex-col gap-4"} mb-8`}>
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.title} className="bg-surface shadow-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className={`relative ${desktop ? "h-48" : "h-40"} bg-gray-100`}>
                <img
                  src={service.image.src}
                  alt={service.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Icon size={20} className="text-primary" />
                </div>
              </div>
              <div className="p-5">
                <h3 className={`font-bold text-text-primary ${desktop ? "text-lg" : "text-base"} mb-2`}>
                  {service.title}
                </h3>
                <p className="text-text-secondary text-sm mb-3">
                  {service.description}
                </p>
                <ul className="space-y-1.5">
                  {service.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-text-secondary">
                      <CheckCircle2 size={14} className="text-[#2ECC71] flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Why MiMaji for Business */}
      <div className={`bg-surface shadow-card rounded-2xl ${desktop ? "p-10" : "p-5"} mb-8`}>
        <h2 className={`font-bold text-text-primary ${desktop ? "text-2xl mb-6" : "text-lg mb-4"}`}>
          Why Businesses Choose MiMaji
        </h2>
        <div className={`${desktop ? "grid grid-cols-2 gap-6" : "flex flex-col gap-4"}`}>
          {[
            { title: "Scheduled Deliveries", desc: "Set up recurring delivery schedules that work around your operations." },
            { title: "Volume Discounts", desc: "Competitive pricing for bulk and regular orders." },
            { title: "Monthly Invoicing", desc: "Simplified billing with detailed monthly invoices for your records." },
            { title: "Dedicated Account Support", desc: "A point of contact for your organization's water needs." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-text-primary">{item.title}</p>
                <p className="text-text-secondary text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Tank Delivery Banner */}
      <div id="water-tanks" className={`bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-2xl overflow-hidden mb-8 ${desktop ? "flex items-stretch" : ""}`}>
        <div className={`${desktop ? "flex-1 p-10" : "p-5"}`}>
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={desktop ? 28 : 22} className="text-primary" />
            <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>
              Water Tank Delivery
            </h2>
          </div>
          <p className={`text-text-secondary ${desktop ? "text-base mb-4 max-w-lg" : "text-sm mb-3"}`}>
            Need a reliable water storage solution? MiMaji delivers water tanks directly to your home, office, or project site. We offer a wide range of tank sizes — from 500L for residential use up to 10,000L+ for commercial and agricultural needs.
          </p>
          <ul className={`space-y-2 ${desktop ? "mb-6" : "mb-4"}`}>
            {[
              "Fast delivery across Nairobi and surrounding areas",
              "Vertical, horizontal & loft tank designs available",
              "UV-protected, food-grade materials for safe water storage",
              "Professional installation support available on request",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                <CheckCircle2 size={16} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className={`flex ${desktop ? "items-center gap-4" : "flex-col gap-3"}`}>
            <Link
              href="/contact"
              className={`inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#1a5a9a] text-white font-bold rounded-full transition-colors ${desktop ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}`}
            >
              <Droplets size={18} />
              Order a Water Tank
            </Link>
            <a
              href="https://wa.me/254704476338?text=Hi%20MiMaji%2C%20I%27m%20interested%20in%20ordering%20a%20water%20tank.%20Can%20you%20share%20available%20sizes%20and%20pricing%3F"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold rounded-full transition-colors ${desktop ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}`}
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
          </div>
        </div>
        {desktop && (
          <div className="flex-1 min-h-[300px]">
            <img src={watertank.src} alt="Water tanks for delivery" className="w-full h-full object-cover" />
          </div>
        )}
        {!desktop && (
          <div className="h-48">
            <img src={watertank.src} alt="Water tanks for delivery" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className={`bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl text-white ${desktop ? "p-12" : "p-6"}`}>
        <h2 className={`font-extrabold ${desktop ? "text-3xl mb-3" : "text-xl mb-2"}`}>
          Contact Us for More Information
        </h2>
        <p className={`text-white/80 ${desktop ? "text-lg max-w-lg mb-6" : "text-sm mb-4"}`}>
          Speak with our team about water delivery, tank supply, and tank cleaning solutions for your organization.
        </p>
        <div className={`flex ${desktop ? "items-center gap-4" : "flex-col gap-3"}`}>
          <Link
            href="/contact"
            className={`inline-flex items-center justify-center gap-2 bg-white text-primary font-bold rounded-full transition-colors hover:bg-white/90 ${desktop ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}`}
          >
            <Phone size={18} />
            Contact Us
          </Link>
          <Link
            href={user ? "/account-settings" : "/login?mode=signup&corporate=true"}
            className={`inline-flex items-center justify-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full transition-colors ${desktop ? "px-8 py-4 text-base" : "px-6 py-3 text-sm"}`}
          >
            <Building2 size={18} />
            Sign Up as a Corporate Account
          </Link>
        </div>
        <div className={`flex ${desktop ? "items-center gap-6" : "flex-col gap-2"} mt-6 pt-4 border-t border-white/20`}>
          <a href="https://wa.me/254704476338" target="_blank" rel="noopener noreferrer" className="text-[#25D366] text-sm font-semibold flex items-center gap-2 hover:underline">
            <MessageCircle size={16} /> WhatsApp: +254 704 476 338
          </a>
          <a href="tel:+254704476338" className="text-white/70 text-sm flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={16} /> +254 704 476 338
          </a>
          <a href="mailto:support@mimaji.co.ke" className="text-white/70 text-sm flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={16} /> support@mimaji.co.ke
          </a>
        </div>
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center"><img src={logo1.src} alt="MiMaji" className="h-8 w-auto" /></Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/corporate" className="text-primary font-medium text-sm">Corporate</Link>
          <Link href="/vendors" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Vendors</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
