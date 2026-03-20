"use client";

import { logo1, warehouse } from "@/assets/images";
import { Droplets, CheckCircle2, MessageCircle, Mail, ArrowRight, Shield, Star, Smartphone, Clock, Users, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

const benefits = [
  { icon: Users, label: "More Customers", desc: "People searching for water on their phone will find YOU. Reach customers you would never find otherwise." },
  { icon: Shield, label: "Zero Cost to Join", desc: "No upfront fees. No monthly charges. You only pay a small commission after you earn." },
  { icon: Smartphone, label: "You Stay in Control", desc: "Set your own prices. Manage your own stock. Turn off listings when you are busy. It is your business." },
  { icon: Star, label: "Instant M-Pesa Payments", desc: "Customers pay through the app. Your earnings hit your M-Pesa within 48 hours. No chasing invoices." },
  { icon: Truck, label: "Founding Partner Rate", desc: "Be one of the first 20 vendors to join and lock in a reduced commission rate for 12 months." },
  { icon: CheckCircle2, label: "MiMaji Verified Badge", desc: "Pass our quality check and earn a Vendor Verified badge. Customers trust you more, you get more orders." },
];

const questions = [
  "What is your business name?",
  "Who is the main contact person and their phone number?",
  "What is your email address?",
  "Where is your business located and what areas do you deliver to?",
  "What water products do you sell and at what prices?",
  "What is your M-Pesa number or till number?",
  "Do you have a business registration number? (optional, but builds trust)",
  "Any special requests? (delivery hours, coverage limits, etc.)",
];

const steps = [
  { num: "1", title: "Send Us Your Details", desc: "Answer the questions below via WhatsApp or email. It takes less than 5 minutes." },
  { num: "2", title: "We Set Up Your Listing", desc: "Our team creates your vendor profile, adds your products, and gets everything ready within 24 hours." },
  { num: "3", title: "Start Receiving Orders", desc: "Customers in your area find you, order through MiMaji, pay via M-Pesa, and you deliver and earn!" },
];

function VendorContent({ desktop }: { desktop?: boolean }) {
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <img src={warehouse.src} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={24} />
            <span className="font-bold text-lg">MiMaji</span>
          </div>
          <h1 className={`font-extrabold mb-2 ${desktop ? "text-3xl" : "text-xl"}`}>Partner With MiMaji</h1>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            Get more customers, earn more revenue. We handle the technology, the marketing, and the customer support. You focus on selling great water.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/254758434076?text=Hi%20MiMaji!%20I%20am%20interested%20in%20becoming%20a%20vendor%20partner."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-[#1fb855] transition-colors"
            >
              <MessageCircle size={18} />
              WhatsApp Us Now
            </a>
            <a
              href="mailto:vendors@mimaji.co.ke?subject=Vendor%20Partnership%20Enquiry"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-white/30 transition-colors"
            >
              <Mail size={18} />
              Email Us
            </a>
          </div>
        </div>
      </div>

      {/* What is MiMaji */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-2">What Is MiMaji?</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          MiMaji is a mobile app that brings customers directly to you. When someone in your area needs water, they open MiMaji, see your listing, and order from you. We handle the technology, the marketing, and the customer support. You focus on what you do best: selling great water.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">Why Join MiMaji?</h2>
        <div className={desktop ? "grid grid-cols-2 gap-4" : "space-y-3"}>
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary">{b.label}</p>
                  <p className="text-text-secondary text-xs">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">How It Works</h2>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">{s.num}</div>
              <div>
                <p className="font-bold text-sm text-text-primary">{s.title}</p>
                <p className="text-text-secondary text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Card with Questions */}
      <div className="bg-surface shadow-card rounded-2xl overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-[#25D366] to-[#1fb855] p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={20} />
            <h2 className="font-bold text-base">Get Started in 5 Minutes</h2>
          </div>
          <p className="text-white/90 text-sm">
            Send us your answers to the questions below via WhatsApp or email. We will get back to you within 24 hours with your vendor account ready to go.
          </p>
        </div>
        <div className="p-5">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-3">Answer these questions:</p>
          <div className="space-y-2 mb-5">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-background rounded-lg p-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                <p className="text-sm text-text-primary">{q}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/254758434076?text=Hi%20MiMaji!%20I%20would%20like%20to%20become%20a%20vendor%20partner.%0A%0A1.%20Business%20name:%0A2.%20Contact%20person%20%2B%20phone:%0A3.%20Email:%0A4.%20Location%20%2F%20delivery%20areas:%0A5.%20Products%20%2B%20prices:%0A6.%20M-Pesa%20number:%0A7.%20Business%20registration:%0A8.%20Special%20requests:"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#1fb855] transition-colors"
            >
              <MessageCircle size={18} />
              Send via WhatsApp
            </a>
            <a
              href="mailto:vendors@mimaji.co.ke?subject=Vendor%20Partnership%20Application&body=Hi%20MiMaji!%20I%20would%20like%20to%20become%20a%20vendor%20partner.%0A%0A1.%20Business%20name:%0A2.%20Contact%20person%20%2B%20phone:%0A3.%20Email:%0A4.%20Location%20/%20delivery%20areas:%0A5.%20Products%20%2B%20prices:%0A6.%20M-Pesa%20number:%0A7.%20Business%20registration:%0A8.%20Special%20requests:"
              className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
            >
              <Mail size={18} />
              Send via Email
            </a>
          </div>

          <div className="flex items-center gap-2 mt-4 bg-[#FFF5EC] rounded-lg p-3">
            <Clock size={16} className="text-[#F5A623] flex-shrink-0" />
            <p className="text-text-secondary text-xs">
              <strong className="text-text-primary">We respond within 24 hours.</strong> Your vendor listing can be live the same day.
            </p>
          </div>
        </div>
      </div>

      {/* Zero risk banner */}
      <div className="bg-primary-light rounded-xl p-4 mb-4 text-center">
        <p className="text-primary font-bold text-sm mb-1">Zero cost to join. You set your own prices.</p>
        <p className="text-text-secondary text-xs">No contracts, no lock in. Cancel anytime with 14 days notice.</p>
      </div>
    </>
  );
}

export default function VendorSignupPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="Become a Vendor" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <VendorContent />
        </div>
      </div>

      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/vendors" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Vendors</Link>
              <Link href="/vendor-signup" className="text-primary font-medium text-sm">Become a Vendor</Link>
              <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Become a MiMaji Vendor Partner</h1>
          <p className="text-text-secondary mb-8">Join our growing network of trusted water vendors across Nairobi.</p>
          <VendorContent desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}
