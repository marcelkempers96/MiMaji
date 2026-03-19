"use client";

import { MessageCircle, Phone, Mail, HelpCircle, ChevronRight, FileText, Truck, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const WHATSAPP_LINK = "https://wa.me/254758434076";

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Go to 'Order Water', select your preferred bottle type and size, add to cart, choose delivery address, and confirm. Pay via M-Pesa.",
  },
  {
    question: "What areas do you deliver to?",
    answer: "We currently deliver across Nairobi including Kilimani, Westlands, Karen, Lavington, CBD, South B/C, Eastlands, and more.",
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery takes 30-60 minutes within Nairobi. You can track your delivery in real-time.",
  },
  {
    question: "How do I pay?",
    answer: "We accept M-Pesa payments. You'll receive an STK push on your phone to complete the payment.",
  },
  {
    question: "Can I schedule a delivery?",
    answer: "Yes! Use the Schedule feature to set up recurring deliveries at your preferred time.",
  },
  {
    question: "How do rewards work?",
    answer: "Earn 1 point per KES 10 spent. Redeem points for free deliveries, discounts, and free water jugs. Rise through tiers from Water Cadet to Water Warrior!",
  },
  {
    question: "What if my order is late or damaged?",
    answer: "Contact us via WhatsApp immediately. We'll arrange a replacement or refund within 24 hours.",
  },
];

const quickActions = [
  { label: "Track My Order", icon: Truck, href: "/orders" },
  { label: "Payment Issues", icon: CreditCard, href: "/contact" },
  { label: "Order Problem", icon: FileText, href: "/contact" },
  { label: "General Help", icon: HelpCircle, href: "/contact" },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Help & Support" showBack={true} />
      </div>

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <SupportContent />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Help & Support</h1>
          <p className="text-text-secondary mb-8">How can we help you today?</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <SupportContent />
            </div>
            <div>
              <div className="bg-surface shadow-card rounded-2xl p-6 sticky top-8">
                <h3 className="font-bold text-base text-text-primary mb-4">Need Quick Help?</h3>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] text-white rounded-xl py-3 text-center font-semibold text-sm hover:bg-[#1fb855] transition-colors mb-3"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href="tel:+254758434076"
                  className="block w-full bg-primary text-white rounded-xl py-3 text-center font-semibold text-sm hover:bg-[#1a5a9a] transition-colors mb-3"
                >
                  Call Us
                </a>
                <a
                  href="mailto:hello@mimaji.co.ke"
                  className="block w-full bg-surface border border-[#E0E0E0] text-text-primary rounded-xl py-3 text-center font-semibold text-sm hover:bg-background transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function SupportContent() {
  return (
    <>
      {/* WhatsApp CTA */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#25D366] text-white rounded-xl p-5 mb-5 hover:bg-[#1fb855] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-base">Chat with us on WhatsApp</p>
            <p className="text-white/80 text-sm">+254 758 434 076 — 24/7 Support</p>
          </div>
        </div>
      </a>

      {/* Quick Actions */}
      <h2 className="font-bold text-base text-text-primary mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="bg-surface shadow-card rounded-xl p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <span className="font-medium text-sm text-text-primary">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Contact Methods */}
      <h2 className="font-bold text-base text-text-primary mb-3 md:hidden">Other Ways to Reach Us</h2>
      <div className="flex flex-col gap-3 mb-6 md:hidden">
        <a href="tel:+254758434076" className="bg-surface shadow-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Phone size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-text-primary">Call Us</p>
            <p className="text-text-secondary text-xs">+254 758 434 076</p>
          </div>
          <ChevronRight size={16} className="text-text-secondary" />
        </a>
        <a href="mailto:hello@mimaji.co.ke" className="bg-surface shadow-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Mail size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-text-primary">Email</p>
            <p className="text-text-secondary text-xs">hello@mimaji.co.ke</p>
          </div>
          <ChevronRight size={16} className="text-text-secondary" />
        </a>
      </div>

      {/* FAQs */}
      <h2 className="font-bold text-base text-text-primary mb-3">Frequently Asked Questions</h2>
      <div className="flex flex-col gap-3 mb-6">
        {faqs.map((faq) => (
          <details key={faq.question} className="bg-surface shadow-card rounded-xl overflow-hidden group">
            <summary className="px-4 py-4 flex items-center justify-between cursor-pointer list-none">
              <span className="font-medium text-sm text-text-primary pr-4">{faq.question}</span>
              <ChevronRight size={16} className="text-text-secondary flex-shrink-0 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-text-secondary text-sm">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo1" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/support" className="text-primary font-medium text-sm">Support</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
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
