"use client";

import { useState, useEffect } from "react";
import { MapPin, User, Star, Phone, Share2, Droplets } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

export default function TrackPage() {
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);

  const trackContent = (
    <>
      <p className="text-text-secondary text-sm">
        Tracking your water delivery in <span className="font-bold">real-time</span>
      </p>
      <p className="text-xl font-bold text-text-primary mt-2">Arriving in {minutes} min</p>
      <div className="flex items-center gap-1 mt-1">
        <MapPin size={16} className="text-primary" />
        <span className="text-text-secondary text-sm">Kilimani, Nairobi</span>
      </div>

      {/* Map Placeholder */}
      <div className="h-48 md:h-64 bg-primary-light rounded-2xl mt-4 flex flex-col items-center justify-center">
        <MapPin size={32} className="text-primary" />
        <div className="border-t-2 border-dashed border-primary w-1/2 mx-auto mt-2" />
        <p className="text-primary/40 text-xs mt-2">Google Maps integration</p>
      </div>

      {/* Driver Card */}
      <div className="bg-surface shadow-card rounded-xl p-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <User size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary">Driver: Moses</p>
            <p className="text-text-secondary text-sm">KCX 246F - Toyota</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="text-rating" fill="currentColor" />
              ))}
              <span className="text-text-secondary text-xs ml-1">12:15pm</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Button variant="outline" className="flex-1">
            <Phone size={16} />
            Contact
          </Button>
          <button className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Share2 size={16} className="text-primary" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Track Order" />
        <div className="px-4 pt-4 max-w-md mx-auto">{trackContent}</div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Droplets size={28} className="text-primary" />
              <span className="text-2xl font-bold text-primary">MiMaji</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
              <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Track Your Delivery</h1>
          {trackContent}
        </div>
      </div>
    </div>
  );
}
