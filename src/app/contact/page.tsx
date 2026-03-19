"use client";

import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

const WHATSAPP_NUMBER = "+254758434076";
const WHATSAPP_LINK = `https://wa.me/254758434076`;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Contact Us" showBack={true} />

      {/* Mobile Layout */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <ContactContent />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Contact Us</h1>
          <p className="text-text-secondary mb-8">We&apos;re here to help. Reach out anytime.</p>
          <div className="grid grid-cols-2 gap-8">
            <ContactContent />
            <div className="bg-surface shadow-card rounded-2xl p-8">
              <h3 className="font-bold text-lg text-text-primary mb-4">Send us a message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="flex flex-col gap-4">
      {/* WhatsApp - Primary */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] text-white rounded-xl p-5 flex items-center gap-4 hover:bg-[#1fb855] transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={24} />
        </div>
        <div>
          <p className="font-bold text-base">WhatsApp Us</p>
          <p className="text-white/80 text-sm">+254 758 434 076</p>
          <p className="text-white/60 text-xs mt-0.5">24/7 — Fastest response</p>
        </div>
      </a>

      {/* Phone */}
      <a
        href="tel:+254758434076"
        className="bg-surface shadow-card rounded-xl p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <Phone size={22} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-text-primary">Call Us</p>
          <p className="text-text-secondary text-sm">+254 758 434 076</p>
        </div>
      </a>

      {/* Email */}
      <a
        href="mailto:hello@mimaji.co.ke"
        className="bg-surface shadow-card rounded-xl p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <Mail size={22} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-text-primary">Email</p>
          <p className="text-text-secondary text-sm">hello@mimaji.co.ke</p>
        </div>
      </a>

      {/* Location */}
      <div className="bg-surface shadow-card rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <MapPin size={22} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-text-primary">Location</p>
          <p className="text-text-secondary text-sm">Nairobi, Kenya</p>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-surface shadow-card rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
          <Clock size={22} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm text-text-primary">Operating Hours</p>
          <p className="text-text-secondary text-sm">Mon - Sun: 6:00 AM - 10:00 PM</p>
          <p className="text-text-secondary text-xs">WhatsApp support available 24/7</p>
        </div>
      </div>

      {/* Mobile contact form */}
      <div className="bg-surface shadow-card rounded-xl p-5 md:hidden">
        <h3 className="font-bold text-sm text-text-primary mb-3">Send us a message</h3>
        <ContactForm />
      </div>
    </div>
  );
}

function ContactForm() {
  return (
    <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        placeholder="Your name"
        className="w-full h-11 px-4 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary"
      />
      <input
        type="tel"
        placeholder="Phone number"
        className="w-full h-11 px-4 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary"
      />
      <textarea
        placeholder="Your message"
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary resize-none"
      />
      <button
        type="submit"
        className="w-full h-11 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2979C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
          <span className="text-2xl font-bold text-primary">MiMaji</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
          <Link href="/contact" className="text-primary font-medium text-sm">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
