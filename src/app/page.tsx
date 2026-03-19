"use client";

import { Droplets, ShoppingCart, MapPin, Truck, Gift, Star, Info, FileText, Mail, Phone, LogIn, Heart, Trophy, MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import AuthLink from "@/components/AuthLink";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

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
          {user ? (
            <Link href="/dashboard" className="text-primary text-sm font-semibold">
              Hi, {user.name}
            </Link>
          ) : (
            <Link href="/login" className="text-primary text-sm font-semibold">
              Log In
            </Link>
          )}
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-5">
          <h1 className="text-2xl font-extrabold leading-tight">
            Order Water Online
          </h1>
          <p className="text-white/80 text-sm mt-1">& Track Your Delivery</p>
          <p className="text-white/60 text-xs mt-2">Premium purified water delivered to your door in Nairobi. Pay with M-Pesa.</p>
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full px-6 py-3 mt-4 text-sm transition-colors"
          >
            <ShoppingCart size={18} />
            Order Now
          </Link>
          {/* IMAGE SUGGESTION: Hero banner with Nairobi skyline + water delivery truck/bottles */}
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
          <AuthLink href="/orders">
            <div className="bg-surface shadow-card rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                <Truck size={22} className="text-primary" />
              </div>
              <span className="font-bold text-sm text-text-primary">My Orders</span>
              <span className="text-text-secondary text-xs">Track & view</span>
            </div>
          </AuthLink>
        </div>

        {/* How It Works */}
        <h2 className="text-base font-bold text-text-primary mb-3">How It Works</h2>
        <div className="bg-surface shadow-card rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</div>
            <div>
              <p className="font-bold text-sm text-text-primary">Choose Your Water</p>
              <p className="text-text-secondary text-xs">Hard jug 20L or soft bottle 5L/10L/20L</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</div>
            <div>
              <p className="font-bold text-sm text-text-primary">Pay with M-Pesa</p>
              <p className="text-text-secondary text-xs">Secure STK push payment to your phone</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#2ECC71] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</div>
            <div>
              <p className="font-bold text-sm text-text-primary">Get It Delivered</p>
              <p className="text-text-secondary text-xs">Track your delivery in real-time. Average 35 min.</p>
            </div>
          </div>
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
        <h2 className="text-base font-bold text-text-primary mb-3">Water Warriors Rewards</h2>
        <Link href="/rewards">
          <div className="bg-surface shadow-card rounded-xl p-4 mb-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Star size={20} className="text-rating" />
              <span className="font-bold text-sm text-text-primary">Earn Points with Every Order</span>
            </div>
            <p className="text-text-secondary text-xs mb-3">
              Rise from Water Cadet to Water Warrior! Earn points, get free deliveries, discounts & free water.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                <div className="h-full bg-rating rounded-full w-[30%]" />
              </div>
              <span className="text-xs text-text-secondary font-medium">150 / 500 pts</span>
            </div>
            <p className="text-xs text-primary font-semibold mt-2">View Rewards →</p>
          </div>
        </Link>

        {/* Impact */}
        <Link href="/impact">
          <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-4 mb-5 hover:shadow-card transition-shadow">
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-[#2ECC71]" />
              <div>
                <p className="font-bold text-sm text-text-primary">Water is Life</p>
                <p className="text-text-secondary text-xs">For every 100L, we supply 10L to rural communities</p>
                <p className="text-[#2ECC71] text-xs font-semibold mt-1">Learn about our impact →</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Footer */}
        <MobileFooter />
      </div>

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden md:block">
        <DesktopHome user={user} />
      </div>
    </div>
  );
}

function MobileFooter() {
  return (
    <footer className="border-t border-[#E0E0E0] pt-6 pb-4">
      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <Link href="/buy" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Droplets size={16} />
          Order Water
        </Link>
        <AuthLink href="/orders" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          My Orders
        </AuthLink>
        <Link href="/subscriptions" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Subscriptions
        </Link>
        <Link href="/rewards" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Trophy size={16} />
          Rewards
        </Link>
        <AuthLink href="/profile" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Info size={16} />
          My Account
        </AuthLink>
        <Link href="/support" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Mail size={16} />
          Support
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <Link href="/impact" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Heart size={16} />
          Our Impact
        </Link>
        <Link href="/vendors" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <MapPin size={16} />
          Vendor Map
        </Link>
        <Link href="/contact" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Phone size={16} />
          Contact
        </Link>
        <Link href="/vendor-login" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <LogIn size={16} />
          Vendor Login
        </Link>
      </div>

      <div className="flex flex-col gap-2 mb-6">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Contact Us</p>
        <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#25D366] text-sm font-semibold hover:underline transition-colors">
          <MessageCircle size={14} />
          WhatsApp: +254 758 434 076
        </a>
        <a href="tel:+254758434076" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Phone size={14} />
          +254 758 434 076
        </a>
        <a href="mailto:hello@mimaji.co.ke" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Mail size={14} />
          hello@mimaji.co.ke
        </a>
      </div>

      <div className="border-t border-[#E0E0E0] pt-4 flex items-center justify-between">
        <p className="text-text-secondary/50 text-xs">&copy; 2026 MiMaji</p>
        <p className="text-text-secondary/50 text-xs">v2.3.0</p>
      </div>
    </footer>
  );
}

function DesktopHome({ user }: { user: { phone: string; name: string } | null }) {
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
            <AuthLink href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</AuthLink>
            <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
            <Link href="/support" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Support</Link>
            {user ? (
              <Link href="/dashboard" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                Hi, {user.name}
              </Link>
            ) : (
              <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
            )}
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
              <AuthLink
                href="/orders"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full px-8 py-4 text-base transition-colors"
              >
                <Truck size={20} />
                Track Order
              </AuthLink>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            {/* IMAGE SUGGESTION: Photo of 20L water bottles (hard jug + soft bottle) on a clean background */}
            <div className="relative">
              <div className="w-72 h-72 bg-white/10 rounded-3xl flex items-center justify-center">
                <div className="text-center">
                  <Droplets size={80} className="text-white/60 mx-auto" />
                  <p className="text-white/60 text-lg font-semibold mt-4">Pure Water</p>
                  <p className="text-white/40 text-sm">5L · 10L · 20L</p>
                </div>
              </div>
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

      {/* How It Works */}
      <section className="bg-surface py-16">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Choose Your Water</h3>
              <p className="text-text-secondary text-sm">Browse hard jugs and soft bottles in 5L, 10L, and 20L sizes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Pay with M-Pesa</h3>
              <p className="text-text-secondary text-sm">Secure payment via STK push directly to your phone</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#2ECC71] text-white text-2xl font-extrabold flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Get It Delivered</h3>
              <p className="text-text-secondary text-sm">Track your delivery in real-time. Average delivery in 35 minutes</p>
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
            <AuthLink href="/orders" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">My Orders →</AuthLink>
          </div>
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-16 h-16 rounded-full bg-[#FFF5EC] flex items-center justify-center mx-auto mb-4">
              <Star size={28} className="text-rating" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Earn Rewards</h3>
            <p className="text-text-secondary text-sm">Join Water Warriors! Earn points with every order for free water & discounts.</p>
            <Link href="/rewards" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">View Rewards →</Link>
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

      {/* Impact Section */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-10 flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Heart size={28} className="text-[#2ECC71]" />
              <h2 className="text-2xl font-extrabold text-text-primary">Water is Life</h2>
            </div>
            <p className="text-text-secondary text-base mb-4">
              For every <span className="font-bold text-[#2ECC71]">100 Litres</span> delivered, we supply <span className="font-bold text-[#2ECC71]">10 Litres</span> to rural communities in Kenya.
            </p>
            <Link href="/impact" className="inline-flex items-center gap-2 bg-[#2ECC71] text-white rounded-full px-6 py-3 font-bold text-sm hover:bg-[#27ae60] transition-colors">
              Learn About Our Impact →
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            {/* IMAGE SUGGESTION: Photo of clean water being provided to a rural community / children drinking water */}
            <div className="w-64 h-48 bg-white/60 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Users size={48} className="text-[#2ECC71]/40 mx-auto mb-2" />
                <p className="text-[#2ECC71]/60 text-sm font-medium">2,500+ families served</p>
                <p className="text-text-secondary/40 text-[10px] mt-1">[ Place image: Rural community water access ]</p>
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
              <p className="text-white/60 text-sm mb-4">Water delivered to your door in Nairobi. Fast, reliable, local.</p>
              <p className="text-white/40 text-xs">For every 100L delivered, 10L goes to rural communities.</p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/buy" className="text-white/60 text-sm hover:text-white transition-colors">Order Water</Link>
                <AuthLink href="/orders" className="text-white/60 text-sm hover:text-white transition-colors">My Orders</AuthLink>
                <Link href="/subscriptions" className="text-white/60 text-sm hover:text-white transition-colors">Subscriptions</Link>
                <Link href="/rewards" className="text-white/60 text-sm hover:text-white transition-colors">Water Warriors Rewards</Link>
                <Link href="/schedule" className="text-white/60 text-sm hover:text-white transition-colors">Schedule Delivery</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/impact" className="text-white/60 text-sm hover:text-white transition-colors">Our Impact</Link>
                <Link href="/vendors" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Map</Link>
                <Link href="/contact" className="text-white/60 text-sm hover:text-white transition-colors">Contact Us</Link>
                <Link href="/support" className="text-white/60 text-sm hover:text-white transition-colors">Help & Support</Link>
                <Link href="/vendor-login" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Login</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Contact Us</h4>
              <div className="flex flex-col gap-2">
                <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="text-[#25D366] text-sm font-semibold hover:text-[#1fb855] transition-colors flex items-center gap-2">
                  <MessageCircle size={14} />
                  WhatsApp (24/7)
                </a>
                <a href="tel:+254758434076" className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-2">
                  <Phone size={14} />
                  +254 758 434 076
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
            <p className="text-white/40 text-xs">v2.3.0</p>
          </div>
        </div>
      </footer>
    </>
  );
}
