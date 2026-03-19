"use client";

import { Droplets, ShoppingCart, MapPin, Truck, Gift, Star, Info, FileText, Mail, Phone, LogIn } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 md:hidden">
        {/* === MOBILE LAYOUT === */}

        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Droplets size={24} className="text-primary" />
            <span className="text-[20px] font-bold text-primary">MiMaji</span>
          </div>
          <Link href="/login" className="text-primary text-sm font-semibold">
            Log In
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-5">
          <h1 className="text-2xl font-extrabold leading-tight">
            Order Water Online
          </h1>
          <p className="text-white/80 text-sm mt-1">& Track Your Delivery</p>
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full px-6 py-3 mt-4 text-sm transition-colors"
          >
            <ShoppingCart size={18} />
            Order Now
          </Link>
        </div>

        {/* Action Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link href="/buy">
            <div className="bg-surface shadow-card rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Droplets size={22} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-text-primary">Order Water</span>
              <span className="text-text-secondary text-xs">Browse & buy</span>
            </div>
          </Link>
          <Link href="/orders">
            <div className="bg-surface shadow-card rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Truck size={22} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-text-primary">Track Order</span>
              <span className="text-text-secondary text-xs">View status</span>
            </div>
          </Link>
        </div>

        {/* Special Offers */}
        <h2 className="text-base font-bold text-text-primary mb-3">Special Offers</h2>
        <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-xl p-4 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Gift size={20} className="text-cta-alt" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">Bulk Order Discount</p>
              <p className="text-text-secondary text-xs mt-0.5">Order 3+ jugs and save up to 20%</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <Droplets size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">First Order Free Delivery</p>
              <p className="text-text-secondary text-xs mt-0.5">No delivery fee on your first order</p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <h2 className="text-base font-bold text-text-primary mb-3">Rewards</h2>
        <div className="bg-surface shadow-card rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <Star size={20} className="text-rating" />
            <span className="font-bold text-sm text-text-primary">MiMaji Rewards</span>
          </div>
          <p className="text-text-secondary text-xs mb-3">
            Earn points with every order. Redeem for free deliveries & discounts.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div className="h-full bg-rating rounded-full w-[30%]" />
            </div>
            <span className="text-xs text-text-secondary font-medium">150 / 500 pts</span>
          </div>
          <p className="text-xs text-text-secondary mt-2">Next reward: Free delivery at 500 pts</p>
        </div>

        {/* Footer */}
        <MobileFooter />
      </div>

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden md:block">
        <DesktopHome />
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <footer className="border-t border-[#E0E0E0] pt-6 pb-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <Link href="/buy" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Droplets size={16} />
          Order Water
        </Link>
        <Link href="/orders" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          My Orders
        </Link>
        <Link href="/subscriptions" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Subscriptions
        </Link>
        <Link href="/schedule" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Schedule
        </Link>
        <Link href="/profile" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Info size={16} />
          My Account
        </Link>
        <Link href="/support" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Mail size={16} />
          Support
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <Link href="/vendors" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <MapPin size={16} />
          Vendor Map
        </Link>
        <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Info size={16} />
          About MiMaji
        </Link>
        <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Docs
        </Link>
        <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Terms & Privacy
        </Link>
        <Link href="/vendor-login" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <LogIn size={16} />
          Vendor Login
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Contact Us</p>
        <a href="tel:+254700000000" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Phone size={14} />
          +254 700 000 000
        </a>
        <a href="mailto:hello@mimaji.co.ke" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Mail size={14} />
          hello@mimaji.co.ke
        </a>
      </div>

      <div className="border-t border-[#E0E0E0] pt-4 flex items-center justify-between">
        <p className="text-text-secondary/50 text-xs">&copy; 2026 MiMaji</p>
        <p className="text-text-secondary/50 text-xs">v2.2.0</p>
      </div>
    </footer>
  );
}

function DesktopHome() {
  return (
    <>
      {/* Desktop Nav */}
      <header className="bg-surface border-b border-[#E0E0E0]">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Droplets size={28} className="text-primary" />
            <span className="text-2xl font-bold text-primary">MiMaji</span>
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
            <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
            <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
            <Link href="/support" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Support</Link>
            <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-[#1a5a9a] text-white">
        <div className="max-w-6xl mx-auto px-8 py-20 flex items-center gap-12">
          <div className="flex-1">
            <h1 className="text-5xl font-extrabold leading-tight">
              Order Water Online<br />
              <span className="text-white/80">& Track Your Delivery</span>
            </h1>
            <p className="text-white/70 text-lg mt-4 max-w-md">
              Premium purified water delivered to your door in Nairobi. Pay with M-Pesa. Fast, reliable, local.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full px-8 py-4 text-base transition-colors"
              >
                <ShoppingCart size={20} />
                Order Now
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full px-8 py-4 text-base transition-colors"
              >
                <Truck size={20} />
                Track Order
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              {/* Decorative water bottles illustration */}
              <div className="w-72 h-72 bg-white/10 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <Droplets size={80} className="text-white/60 mx-auto" />
                  <p className="text-white/60 text-lg font-semibold mt-4">Pure Water</p>
                  <p className="text-white/40 text-sm">5L · 10L · 20L</p>
                </div>
              </div>
              {/* Floating delivery card */}
              <div className="absolute -bottom-4 -right-4 bg-surface rounded-xl shadow-lg p-4 w-48">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className="text-primary" />
                  <span className="text-text-primary text-xs font-bold">Your Water Delivery</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-extrabold text-lg">35 min</span>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 bg-primary-light rounded flex items-center justify-center">
                      <Droplets size={12} className="text-primary" />
                    </div>
                    <div className="w-6 h-6 bg-primary-light rounded flex items-center justify-center">
                      <Phone size={12} className="text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <Droplets size={28} className="text-primary" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Order Water</h3>
            <p className="text-text-secondary text-sm">Browse purified water in 5L, 10L & 20L. Hard jug or soft bottle.</p>
            <Link href="/buy" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">Shop Now →</Link>
          </div>
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <Truck size={28} className="text-primary" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Track Delivery</h3>
            <p className="text-text-secondary text-sm">Real-time tracking of your water delivery with driver info.</p>
            <Link href="/orders" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">My Orders →</Link>
          </div>
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-16 h-16 rounded-full bg-[#FFF5EC] flex items-center justify-center mx-auto mb-4">
              <Star size={28} className="text-rating" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Earn Rewards</h3>
            <p className="text-text-secondary text-sm">Get points with every order. Redeem for free deliveries & discounts.</p>
            <Link href="/orders" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">View Rewards →</Link>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="bg-surface py-16">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Special Offers</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-2xl p-8 flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Gift size={28} className="text-cta-alt" />
              </div>
              <div>
                <p className="font-bold text-lg text-text-primary">Bulk Order Discount</p>
                <p className="text-text-secondary text-sm mt-1">Order 3+ jugs and save up to 20% on your delivery</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-2xl p-8 flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Droplets size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg text-text-primary">First Order Free Delivery</p>
                <p className="text-text-secondary text-sm mt-1">No delivery fee on your first order — try MiMaji risk-free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Footer */}
      <footer className="bg-[#1A2A3A] text-white py-16">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={24} className="text-primary" />
                <span className="text-xl font-bold">MiMaji</span>
              </div>
              <p className="text-white/60 text-sm">Water delivered to your door in Nairobi. Fast, reliable, local.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/buy" className="text-white/60 text-sm hover:text-white transition-colors">Order Water</Link>
                <Link href="/orders" className="text-white/60 text-sm hover:text-white transition-colors">My Orders</Link>
                <Link href="/subscriptions" className="text-white/60 text-sm hover:text-white transition-colors">Subscriptions</Link>
                <Link href="/schedule" className="text-white/60 text-sm hover:text-white transition-colors">Schedule</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/vendors" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Map</Link>
                <Link href="#" className="text-white/60 text-sm hover:text-white transition-colors">About MiMaji</Link>
                <Link href="#" className="text-white/60 text-sm hover:text-white transition-colors">Docs</Link>
                <Link href="#" className="text-white/60 text-sm hover:text-white transition-colors">Terms & Privacy</Link>
                <Link href="/vendor-login" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Contact Us</h4>
              <div className="flex flex-col gap-2">
                <a href="tel:+254700000000" className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <Phone size={14} />
                  +254 700 000 000
                </a>
                <a href="mailto:hello@mimaji.co.ke" className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <Mail size={14} />
                  hello@mimaji.co.ke
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 flex items-center justify-between">
            <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
            <p className="text-white/40 text-xs">v2.2.0</p>
          </div>
        </div>
      </footer>
    </>
  );
}
