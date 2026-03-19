"use client";

import { logo1 } from "@/assets/images";
import { Droplets, CheckCircle2, Users, Smartphone, Star, Rocket, Clock, Shield, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const benefits = [
  { label: "More Customers", desc: "People searching for water on their phone will find YOU \u2014 customers you\u2019d never reach otherwise." },
  { label: "Zero Cost to Join", desc: "No upfront fees. No monthly charges. You only pay a small commission AFTER you earn." },
  { label: "You Stay in Control", desc: "Set your own prices. Manage your own stock. Turn off listings when you\u2019re busy. It\u2019s YOUR business." },
  { label: "Instant M-Pesa Payments", desc: "Customers pay through the app. Your earnings hit your M-Pesa within 48 hours. No chasing invoices." },
  { label: "Founding Partner Rate", desc: "Be one of the first 20 vendors to join and lock in a REDUCED commission rate for 12 months." },
  { label: "MiMaji Verified Badge", desc: "Pass our quality check and get a \u201cVendor Verified\u201d badge \u2014 customers trust you more, you get more orders." },
];

const commissionTable = [
  { product: "20L Refills, 5L, 10L", takes: "10%", keeps: "90%", founding: "8% for 12 months" },
  { product: "New 20L Bottles, 18.9L", takes: "12%", keeps: "88%", founding: "10% for 12 months" },
  { product: "Hard Bottles, Cartons", takes: "15%", keeps: "85%", founding: "12% for 12 months" },
  { product: "Tankers (2,000L+)", takes: "8%", keeps: "92%", founding: "6% for 12 months" },
];

const steps = [
  { step: "1", icon: "📋", title: "Fill In The Form", desc: "Your details, products & prices" },
  { step: "2", icon: "🤝", title: "We Create Your Account", desc: "We set up your listing & send confirmation within 48 hours" },
  { step: "3", icon: "🚀", title: "Start Receiving Orders", desc: "Customers find you, order, pay via M-Pesa \u2014 you deliver & earn!" },
];

const formFields = [
  { num: 1, field: "Business name", why: "To display on the app" },
  { num: 2, field: "Contact person + phone number", why: "So we can reach you about orders" },
  { num: 3, field: "Email address", why: "For your account & monthly statements" },
  { num: 4, field: "Location / delivery area", why: "To show you to nearby customers" },
  { num: 5, field: "Business registration (optional)", why: "Builds trust \u2014 not required to start" },
  { num: 6, field: "Product list + your prices", why: "To create your listing on the app" },
  { num: 7, field: "M-Pesa number or till number", why: "So we can pay you!" },
  { num: 8, field: "Any special requests", why: "Delivery hours, coverage limits, etc." },
];

const faqs = [
  { q: "Do I need a smartphone?", a: "No. Orders can be sent to you via WhatsApp or SMS. A smartphone helps but isn\u2019t required to start." },
  { q: "What if I run out of stock?", a: "Just mark products as unavailable in your dashboard (or tell us via WhatsApp). No penalty for being out of stock." },
  { q: "Will you compete with me?", a: "Never. MiMaji is a marketplace. We list vendors \u2014 we don\u2019t sell water ourselves. We succeed when YOU succeed." },
  { q: "Can I leave at any time?", a: "Yes. 14 days\u2019 notice. No lock-in contracts. No exit fees." },
];

export default function VendorSignupPage() {
  const content = (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Droplets size={24} />
          <span className="font-bold text-lg">MiMaji</span>
        </div>
        <p className="text-white/80 text-xs mb-3">Clean Water, One Tap Away &bull; mimaji.co.ke</p>
        <h1 className="text-xl md:text-2xl font-extrabold mb-2">Partner With MiMaji</h1>
        <p className="text-white/90 text-sm">Get more customers, earn more. We handle the technology, marketing, and support. You focus on selling great water.</p>
      </div>

      {/* What is MiMaji */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-2">What Is MiMaji?</h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          MiMaji is a mobile app that brings customers directly to YOU. When someone in your area needs water, they open MiMaji, see YOUR listing, and order from YOU. We handle the technology, the marketing, and the customer support. You focus on what you do best: selling great water.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">Why Join MiMaji?</h2>
        <div className="space-y-3">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-text-primary">{b.label}</p>
                <p className="text-text-secondary text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">How Much Does It Cost?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E0E0E0]">
                <th className="text-left py-2 text-xs font-semibold text-text-secondary">Product</th>
                <th className="text-left py-2 text-xs font-semibold text-text-secondary">MiMaji Takes</th>
                <th className="text-left py-2 text-xs font-semibold text-text-secondary">You Keep</th>
                <th className="text-left py-2 text-xs font-semibold text-text-secondary">Founding Rate</th>
              </tr>
            </thead>
            <tbody>
              {commissionTable.map((row) => (
                <tr key={row.product} className="border-b border-[#F0F0F0] last:border-0">
                  <td className="py-2 text-text-primary font-medium text-xs">{row.product}</td>
                  <td className="py-2 text-text-secondary text-xs">{row.takes}</td>
                  <td className="py-2 text-[#2ECC71] font-bold text-xs">{row.keeps}</td>
                  <td className="py-2 text-primary font-semibold text-xs">{row.founding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-[#FFF5EC] rounded-lg p-3 mt-4">
          <p className="text-text-secondary text-xs">
            <strong className="text-text-primary">Example:</strong> You sell a 20L refill for KSh 290. MiMaji takes KSh 29 (10%). You keep KSh 261. As a Founding Partner, you&apos;d keep KSh 267 (8%). For 50 refills a week, that&apos;s KSh 13,050\u201313,350 in your pocket.
          </p>
        </div>
      </div>

      {/* How to Get Started */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">How To Get Started</h2>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-lg">{s.icon}</div>
              <div>
                <p className="font-bold text-sm text-text-primary">Step {s.step}: {s.title}</p>
                <p className="text-text-secondary text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What We Need From You */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">What We Need From You</h2>
        <p className="text-text-secondary text-xs mb-4">
          Fill in the info below. You can do it on your phone (WhatsApp the answers to <a href="https://wa.me/254758434076" className="text-primary font-semibold">+254 758 434 076</a>), or by email to <a href="mailto:vendor@mimaji.co.ke" className="text-primary font-semibold">vendor@mimaji.co.ke</a>.
        </p>
        <div className="space-y-2">
          {formFields.map((f) => (
            <div key={f.num} className="flex items-start gap-3 bg-background rounded-lg p-3">
              <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{f.num}</span>
              <div>
                <p className="font-semibold text-sm text-text-primary">{f.field}</p>
                <p className="text-text-secondary text-xs">{f.why}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h2 className="font-bold text-base text-text-primary mb-4">Common Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <p className="font-bold text-sm text-text-primary">Q: {faq.q}</p>
              <p className="text-text-secondary text-sm mt-1">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white text-center mb-4">
        <Droplets size={32} className="mx-auto mb-2" />
        <h2 className="text-lg font-extrabold mb-2">Ready to Join?</h2>
        <p className="text-white/80 text-sm mb-4">Contact us to get started. We&apos;ll have your listing live within 48 hours.</p>
        <div className="flex flex-col gap-2">
          <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1fb855] transition-colors">
            WhatsApp: +254 758 434 076
          </a>
          <a href="mailto:vendor@mimaji.co.ke" className="bg-white/20 text-white rounded-xl py-3 font-semibold text-sm hover:bg-white/30 transition-colors">
            Email: vendor@mimaji.co.ke
          </a>
        </div>
      </div>

      <p className="text-text-secondary/50 text-xs text-center">Zero cost to join &bull; You set your own prices &bull; Get paid via M-Pesa within 48 hours</p>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Become a Vendor" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
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
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Become a MiMaji Vendor Partner</h1>
          {content}
        </div>
        <footer className="bg-[#1A2A3A] text-white py-12">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
