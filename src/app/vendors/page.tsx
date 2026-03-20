"use client";

import { logo1 } from "@/assets/images";
import { Droplets, Clock } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar title="Water Vendors" showBack={true} />

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <UpdatingMessage />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-4xl mx-auto px-8 py-12">
          <UpdatingMessage />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function UpdatingMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mb-6">
        <Droplets size={36} className="text-primary" />
      </div>
      <h2 className="text-xl font-extrabold text-text-primary mb-3">
        We Are Updating Our Vendor List
      </h2>
      <p className="text-text-secondary text-sm max-w-sm mb-6 leading-relaxed">
        We are carefully vetting and onboarding trusted water vendors across Nairobi to ensure you get the best quality water delivered to your door. Check back soon!
      </p>
      <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-8">
        <Clock size={16} />
        <span>Coming soon</span>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        <Link
          href="/buy"
          className="block w-full bg-primary text-white rounded-xl py-3.5 text-center font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
        >
          Order Water Now
        </Link>
        <Link
          href="/vendor-signup"
          className="block w-full bg-surface border-2 border-primary text-primary rounded-xl py-3.5 text-center font-semibold text-sm hover:bg-primary-light transition-colors"
        >
          Become a Vendor Partner
        </Link>
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center"><img src={logo1.src} alt="MiMaji" className="h-8 w-auto" /></Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/vendors" className="text-primary font-medium text-sm">Vendors</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Impact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
