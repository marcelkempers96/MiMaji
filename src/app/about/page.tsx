"use client";

import { logo1 } from "@/assets/images";
import { Droplets, Heart, Users, Globe, Truck, Shield, ChevronRight, MapPin, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function AboutUsPage() {
  const content = (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-light to-[#BBDEFB] rounded-2xl p-6 mb-6 text-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Droplets size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary mb-2">About MiMaji</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Bringing clean, safe water to every household across Nairobi — powered by technology, driven by purpose.
        </p>
      </div>

      {/* A Note from the Team */}
      <div className="bg-surface shadow-card rounded-xl p-6 mb-4">
        <h3 className="font-bold text-base text-text-primary mb-3 flex items-center gap-2">
          <Heart size={18} className="text-[#E74C3C]" />
          A Note from the Team
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-3">
          At MiMaji, we started with a simple but urgent question: why is it still so difficult for communities to get reliable, clean water delivered to their homes? Having seen the daily struggles people face — from unreliable supply chains to unsafe sources — we knew something had to change.
        </p>
        <p className="text-text-secondary text-sm leading-relaxed mb-3">
          That drive led us to build MiMaji — a platform designed from the ground up to make water delivery seamless, transparent, and accessible to everyone. We combine local vendor networks with smart technology to ensure that no matter where you are in Nairobi, quality water is just a few taps away.
        </p>
        <p className="text-text-secondary text-sm leading-relaxed">
          But we are not stopping at convenience. Every delivery we make contributes to a larger vision: building water infrastructure that serves communities for generations. For every 100 litres we deliver, 10 litres go directly to underserved rural communities. Because access to water is not a privilege — it is a right.
        </p>
      </div>

      {/* What We Do */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <h3 className="font-bold text-base text-text-primary mb-4">What We Do</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <Truck size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">On-Demand Water Delivery</p>
              <p className="text-text-secondary text-xs">Order water jugs delivered to your doorstep within 30–45 minutes across Nairobi.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-[#2ECC71]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">Verified Local Vendors</p>
              <p className="text-text-secondary text-xs">Every vendor on our platform is vetted for water quality standards and service reliability.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5EC] flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-rating" />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">Seamless M-PESA Payments</p>
              <p className="text-text-secondary text-xs">Pay securely via M-PESA — either through automatic STK push or manual Paybill.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E5F5] flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-[#9C27B0]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-text-primary">Corporate & Bulk Orders</p>
              <p className="text-text-secondary text-xs">Businesses can set up corporate accounts for invoiced, scheduled bulk water deliveries.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Impact */}
      <Link href="/impact">
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-5 mb-4 hover:shadow-card transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Globe size={24} className="text-[#2ECC71]" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">Our Impact</p>
              <p className="text-text-secondary text-xs">For every 100L delivered, 10L goes to rural communities. See how your orders are making a difference.</p>
            </div>
            <ChevronRight size={18} className="text-[#2ECC71]" />
          </div>
        </div>
      </Link>

      {/* Explore More */}
      <div className="bg-surface shadow-card rounded-xl overflow-hidden mb-4">
        <Link href="/corporate">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F0F0] hover:bg-background transition-colors">
            <Users size={20} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">Corporate Solutions</span>
            <ChevronRight size={18} className="text-text-secondary" />
          </div>
        </Link>
        <Link href="/rewards">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F0F0] hover:bg-background transition-colors">
            <Heart size={20} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">Water Warriors Rewards</span>
            <ChevronRight size={18} className="text-text-secondary" />
          </div>
        </Link>
        <Link href="/blog">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F0F0] hover:bg-background transition-colors">
            <Globe size={20} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">Blog & Insights</span>
            <ChevronRight size={18} className="text-text-secondary" />
          </div>
        </Link>
        <Link href="/contact">
          <div className="flex items-center gap-3 px-5 py-4 hover:bg-background transition-colors">
            <MapPin size={20} className="text-text-secondary" />
            <span className="flex-1 text-sm font-medium text-text-primary">Contact Us</span>
            <ChevronRight size={18} className="text-text-secondary" />
          </div>
        </Link>
      </div>

      {/* M-PESA Payment Info */}
      <div className="bg-[#FFF5EC] rounded-xl p-4 mb-4">
        <p className="text-xs font-bold text-text-primary mb-2">MiMaji M-PESA Payment</p>
        <div className="bg-white rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-xs text-text-secondary">Send Money To</span>
            <span className="text-xs font-bold text-text-primary font-mono">0704476338</span>
          </div>
        </div>
        <p className="text-text-secondary text-[10px] mt-2">Paste your M-PESA confirmation code so we can track your order.</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="About Us" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">About Us</h1>
          {content}
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/about" className="text-primary font-medium text-sm">About Us</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Our Impact</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
        </nav>
      </div>
    </header>
  );
}
