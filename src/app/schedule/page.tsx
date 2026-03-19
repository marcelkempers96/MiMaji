"use client";

import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Schedule" />
        <div className="max-w-md mx-auto flex flex-col items-center justify-center px-6 pt-32">
          <Calendar size={48} className="text-text-secondary" />
          <p className="text-lg font-bold text-text-primary mt-4">Coming Soon</p>
          <p className="text-text-secondary text-sm mt-2 text-center">
            Schedule your water deliveries in advance. Set recurring orders so you never run out.
          </p>
          <Link href="/subscriptions" className="text-primary font-semibold text-sm mt-4">
            Check out Subscription Plans →
          </Link>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/logo1.png" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
              <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-20 text-center">
          <Calendar size={64} className="text-text-secondary mx-auto" />
          <p className="text-2xl font-bold text-text-primary mt-6">Schedule — Coming Soon</p>
          <p className="text-text-secondary mt-2 max-w-md mx-auto">
            Schedule your water deliveries in advance. Set recurring orders so you never run out of water.
          </p>
          <Link href="/subscriptions" className="inline-block bg-primary text-white rounded-full px-8 py-3 font-bold text-sm mt-6 hover:bg-[#1a5a9a] transition-colors">
            Check out Subscription Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
