"use client";

import { logo1, waterDelivery, waterDeliveryMiMaji, threeBottles, trackOrder, rewards, officeBottle, impactWaterIsLife, mimajiLocations, mpesa1, order1, dev1, warehouse, clean1, webicon } from "@/assets/images";
import { Droplets, ShoppingCart, MapPin, Truck, Gift, Info, FileText, Mail, Phone, LogIn, Heart, Trophy, MessageCircle, Users, Building2, Handshake, Scale, Shield, Cookie, CheckCircle2 } from "lucide-react";

import Link from "next/link";
import AuthLink from "@/components/AuthLink";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { WhatsAppMobileBanner } from "@/components/WhatsAppBanner";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getRewardsSummary, initRewards } from "@/lib/rewards";

export default function HomePage() {
  const { user } = useAuth();
  const [freeLitres, setFreeLitres] = useState(0);

  useEffect(() => {
    if (user?.id) {
      initRewards(user.id);
      const summary = getRewardsSummary(user.id);
      setFreeLitres(summary.freeLitres);
    }
  }, [user?.id]);

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-md mx-auto px-4 md:hidden">
        {/* === MOBILE LAYOUT === */}

        {/* Header */}
        <div className="flex items-center justify-between py-4 bg-white -mx-4 px-4 sticky top-0 z-10">
          <div className="flex items-center">
            <img src={logo1.src} alt="MiMaji" className="h-[70px] w-auto" />
          </div>
          {user ? (
            <Link href="/dashboard" className="text-primary text-sm font-semibold">
              {user.name}&apos;s Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-primary text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-[#1a5a9a] transition-colors">
              Log In
            </Link>
          )}
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
          <img src={webicon.src} alt="" className="absolute top-4 right-4 w-20 h-20 opacity-15 object-contain" />
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
          <img src={waterDelivery.src} alt="Water delivery in Nairobi" className="mt-4 rounded-xl w-full h-auto" />
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

        {/* Locations Banner */}
        <div className="bg-surface shadow-card rounded-xl overflow-hidden mb-5">
          <div className="w-full">
            <img src={mimajiLocations.src} alt="MiMaji delivery locations across Nairobi" className="w-full h-auto object-contain" />
          </div>
          <div className="p-4">
            <p className="font-bold text-sm text-text-primary mb-1">Delivering from 30 Locations Across Nairobi</p>
            <p className="text-text-secondary text-xs mb-2">
              We partner with verified vendors across the city to ensure fast, reliable delivery wherever you are.
            </p>
            <Link href="/vendors" className="text-primary text-xs font-semibold hover:underline">
              See all vendors →
            </Link>
          </div>
        </div>

        {/* How It Works */}
        <h2 className="text-base font-bold text-text-primary mb-3">How It Works</h2>
        <div className="bg-surface shadow-card rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={threeBottles.src} alt="Choose water" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">Choose Your Water</p>
              <p className="text-text-secondary text-xs">Hard jug 20L or soft bottle 5L/10L/20L</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={mpesa1.src} alt="M-Pesa" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary">Pay with M-Pesa</p>
              <p className="text-text-secondary text-xs">Quick & easy mobile payment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              <img src={dev1.src} alt="Delivery" className="w-full h-full object-contain" />
            </div>
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
        <h2 className="text-base font-bold text-text-primary mb-3">Rewards & Referrals</h2>
        <Link href="/rewards">
          <div className="bg-surface shadow-card rounded-xl p-4 mb-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <Gift size={20} className="text-[#2ECC71]" />
              <span className="font-bold text-sm text-text-primary">Refer Friends, Get Free Water</span>
            </div>
            <p className="text-text-secondary text-xs mb-3">
              Get 1L free on sign up. Refer friends and both earn 5L free when they order 10L+. Earn up to 60L!
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
                <div className="h-full bg-[#2ECC71] rounded-full" style={{ width: `${Math.min((freeLitres / 50) * 100, 100)}%` }} />
              </div>
              <span className="text-xs text-text-secondary font-medium">{freeLitres}L / 50L</span>
            </div>
            <p className="text-xs text-primary font-semibold mt-2">View Rewards →</p>
          </div>
        </Link>

        {/* Corporate / Office Water */}
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-white" />
            <div>
              <p className="font-bold text-sm text-white">Water for Your Office</p>
              <p className="text-white/70 text-xs">Scheduled deliveries, volume discounts & monthly invoicing</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <Link
              href="/buy"
              className="bg-cta-alt text-white text-center rounded-full px-4 py-2 text-xs font-bold hover:bg-[#d44a44] transition-colors whitespace-nowrap"
            >
              Order for Office
            </Link>
            <Link
              href={user ? "/account-settings" : "/login?mode=signup&corporate=true"}
              className="bg-white/20 text-white text-center rounded-full px-4 py-2 text-xs font-bold hover:bg-white/30 transition-colors whitespace-nowrap"
            >
              Set Up Corporate Account
            </Link>
          </div>
        </div>

        {/* Water Quality Guide */}
        <Link href="/water-guide">
          <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-xl overflow-hidden mb-3 hover:shadow-card transition-shadow">
            <div className="flex gap-1 h-24">
              <img src={warehouse.src} alt="MiMaji warehouse" className="w-1/2 object-cover" />
              <img src={clean1.src} alt="Clean water quality" className="w-1/2 object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Droplets size={16} className="text-primary" />
                <p className="font-bold text-sm text-text-primary">Water Quality Guide</p>
              </div>
              <p className="text-text-secondary text-xs">
                Learn what makes water safe to drink — E. coli, TDS, pH, turbidity & more. Know what to look for when ordering water in Nairobi.
              </p>
              <p className="text-primary text-xs font-semibold mt-2">Read the full guide →</p>
            </div>
          </div>
        </Link>

        {/* Impact - Water is Life */}
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

        {/* WhatsApp Banner */}
        <WhatsAppMobileBanner />

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
        <Link href="/water-guide" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Droplets size={16} />
          Water Guide
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

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <Link href="/vendor-signup" className="flex items-center gap-2 text-primary text-sm font-semibold hover:text-[#1a5a9a] transition-colors">
          <Handshake size={16} />
          Sign Up as Vendor
        </Link>
        <Link href="/terms" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Scale size={16} />
          Terms of Use
        </Link>
        <Link href="/privacy" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Shield size={16} />
          Privacy Policy
        </Link>
        <Link href="/cancellation" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <FileText size={16} />
          Refund Policy
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
        <a href="mailto:support@mimaji.co.ke" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
          <Mail size={14} />
          support@mimaji.co.ke
        </a>
      </div>

      <div className="bg-primary-light rounded-xl p-3 mb-4">
        <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">M-PESA Payment Details</p>
        <p className="text-text-primary text-sm">Till Number: <span className="font-bold">123456</span></p>
        <p className="text-text-primary text-sm">Account No: <span className="font-bold">Your Phone Number</span></p>
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
          <div className="flex items-center">
            <img src={logo1.src} alt="MiMaji" className="h-[70px] w-auto" />
          </div>
          <nav className="flex items-center gap-8">
            <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
            <AuthLink href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</AuthLink>
            <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
            <Link href="/support" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Support</Link>
            {user ? (
              <Link href="/dashboard" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                {user.name}&apos;s Dashboard
              </Link>
            ) : (
              <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-[#1a5a9a] text-white relative overflow-hidden">
        <img src={webicon.src} alt="" className="absolute top-8 right-8 w-40 h-40 opacity-10 object-contain" />
        <div className="max-w-6xl mx-auto px-8 py-20 flex items-center gap-12 relative">
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
            <div className="relative">
              <div className="w-[400px] h-[260px] rounded-3xl flex items-center justify-center overflow-hidden">
                <img src={waterDelivery.src} alt="MiMaji water delivery" className="object-cover w-full h-full rounded-3xl" />
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
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <img src={order1.src} alt="Choose water" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Choose Your Water</h3>
              <p className="text-text-secondary text-sm">Browse hard jugs and soft bottles in 5L, 10L, and 20L sizes</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <img src={mpesa1.src} alt="M-Pesa payment" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Pay with M-Pesa</h3>
              <p className="text-text-secondary text-sm">Quick & easy mobile payment via M-Pesa</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                <img src={dev1.src} alt="Delivery" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-text-primary text-lg mb-2">Get It Delivered</h3>
              <p className="text-text-secondary text-sm">Track your delivery in real-time. Average delivery in 35 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Banner */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        <div className="bg-surface shadow-card rounded-2xl overflow-hidden flex items-center gap-0">
          <div className="flex-1 p-10">
            <h2 className="text-2xl font-extrabold text-text-primary mb-3">Delivering from 30 Locations Across Nairobi</h2>
            <p className="text-text-secondary text-base mb-6 max-w-md">
              We partner with verified vendors across the city to ensure fast, reliable delivery wherever you are.
            </p>
            <Link href="/vendors" className="text-primary text-sm font-semibold hover:underline">
              See all vendors →
            </Link>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={mimajiLocations.src} alt="MiMaji delivery locations across Nairobi" className="w-full max-h-[300px] object-contain" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4">
              <img src={threeBottles.src} alt="Order Water" className="object-cover w-full h-full" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Order Water</h3>
            <p className="text-text-secondary text-sm">Browse purified water in 5L, 10L & 20L. Hard jug or soft bottle.</p>
            <Link href="/buy" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">Shop Now →</Link>
          </div>
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4">
              <img src={trackOrder.src} alt="Track Delivery" className="object-cover w-full h-full" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">Track Delivery</h3>
            <p className="text-text-secondary text-sm">Real-time tracking of your water delivery with driver info.</p>
            <AuthLink href="/orders" className="text-primary text-sm font-semibold mt-4 inline-block hover:underline">My Orders →</AuthLink>
          </div>
          <div className="bg-surface shadow-card rounded-2xl p-8 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4">
              <img src={rewards.src} alt="Earn Rewards" className="object-cover w-full h-full" />
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

      {/* Office Ordering Banner */}
      <section className="bg-gradient-to-br from-primary to-[#1a5a9a] text-white">
        <div className="max-w-6xl mx-auto px-8 py-16 flex items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Building2 size={28} />
              <h2 className="text-3xl font-extrabold">Water for Your Office</h2>
            </div>
            <p className="text-white/80 text-lg mt-2 max-w-md">
              Keep your team hydrated with scheduled water deliveries. Corporate accounts available with volume discounts and monthly invoicing.
            </p>
            <div className="flex gap-4 mt-6">
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 bg-cta-alt hover:bg-[#d44a44] text-white font-bold rounded-full px-8 py-4 text-base transition-colors"
              >
                <ShoppingCart size={20} />
                Order for Office
              </Link>
              <Link
                href={user ? "/account-settings" : "/login?mode=signup&corporate=true"}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-full px-8 py-4 text-base transition-colors"
              >
                <Building2 size={20} />
                Set Up Corporate Account
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-[350px] h-[250px] rounded-3xl overflow-hidden">
              <img src={officeBottle.src} alt="Office water delivery" className="object-cover w-full h-full rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Water Quality Guide Banner */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        <Link href="/water-guide">
          <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow flex items-stretch">
            <div className="flex-1 p-10">
              <div className="flex items-center gap-3 mb-3">
                <Droplets size={24} className="text-primary" />
                <h2 className="text-2xl font-extrabold text-text-primary">Water Quality Guide</h2>
              </div>
              <p className="text-text-secondary text-base mb-2 max-w-md">
                Learn what makes water safe to drink — E. coli, TDS, pH, turbidity & more. Know what to look for when ordering water in Nairobi. Understand the key indicators of water safety and how MiMaji ensures every drop meets quality standards.
              </p>
              <span className="text-primary text-sm font-semibold">Read the full guide →</span>
            </div>
            <div className="flex-1 flex gap-1 min-h-[200px]">
              <img src={warehouse.src} alt="MiMaji warehouse" className="w-1/2 object-cover" />
              <img src={clean1.src} alt="Clean water quality" className="w-1/2 object-cover" />
            </div>
          </div>
        </Link>
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
            <div className="w-[400px] h-[280px] rounded-2xl overflow-hidden">
              <img src={impactWaterIsLife.src} alt="Community water access" className="object-cover w-full h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <DesktopFooter />
    </>
  );
}
