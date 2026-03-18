"use client";

import Link from "next/link";
import {
  Droplets,
  ShoppingCart,
  Truck,
  Gift,
  Star,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  User,
  Headphones,
  Calendar,
  ClipboardList,
  Info,
  LogIn,
  ArrowRight,
} from "lucide-react";

/* ─── Mobile Header ─── */
function MobileHeader() {
  return (
    <header className="flex items-center justify-between px-5 py-4 md:hidden">
      <div className="flex items-center gap-2">
        <Droplets className="w-6 h-6 text-blue-700" />
        <span className="text-lg font-bold text-blue-700">MiMaji</span>
      </div>
      <Link href="/login" className="text-blue-700 text-sm font-semibold">
        Log In
      </Link>
    </header>
  );
}

/* ─── Desktop Navigation ─── */
function DesktopNav() {
  return (
    <nav className="hidden md:block bg-white border-b border-blue-100">
      <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-7 h-7 text-blue-700" />
          <span className="text-2xl font-bold text-blue-900">MiMaji</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#" className="text-text-mid text-sm font-medium hover:text-blue-700 transition-colors">
            Order Water
          </Link>
          <Link href="/orders" className="text-text-mid text-sm font-medium hover:text-blue-700 transition-colors">
            My Orders
          </Link>
          <Link href="#" className="text-text-mid text-sm font-medium hover:text-blue-700 transition-colors">
            Subscriptions
          </Link>
          <Link href="#" className="text-text-mid text-sm font-medium hover:text-blue-700 transition-colors">
            Support
          </Link>
          <Link
            href="/login"
            className="bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-500 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Mobile Hero Card ─── */
function MobileHero() {
  return (
    <div className="px-4 mb-5 md:hidden">
      <div className="bg-gradient-to-br from-blue-700 to-[#1a5a9a] rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold text-white mb-1">Order Water Online</h1>
        <p className="text-white/80 text-sm mb-4">&amp; Track Your Delivery</p>
        <Link
          href="#"
          className="inline-flex items-center gap-2 bg-[#E8553A] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#d44a31] transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Order Now
        </Link>
      </div>
    </div>
  );
}

/* ─── Desktop Hero ─── */
function DesktopHero() {
  return (
    <section className="hidden md:block bg-gradient-to-r from-blue-700 to-[#1a5a9a]">
      <div className="max-w-6xl mx-auto px-6 py-20 flex items-center">
        {/* Left column */}
        <div className="flex-1">
          <h1 className="text-5xl font-extrabold text-white mb-2 leading-tight">
            Order Water Online
          </h1>
          <p className="text-white/80 text-xl mb-3">&amp; Track Your Delivery</p>
          <p className="text-white/70 text-sm mb-8 max-w-md">
            Get fresh, clean water delivered right to your doorstep. Choose from 5L, 10L, and 20L
            options with real-time delivery tracking.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-[#E8553A] text-white px-6 py-3 rounded-full text-base font-bold hover:bg-[#d44a31] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Order Now
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 bg-white/15 text-white px-6 py-3 rounded-full text-base font-bold hover:bg-white/25 transition-colors"
            >
              <Truck className="w-5 h-5" />
              Track Order
            </Link>
          </div>
        </div>

        {/* Right column — decorative */}
        <div className="flex-1 flex justify-center relative">
          <div className="w-72 h-72 bg-white/10 rounded-2xl flex flex-col items-center justify-center">
            <Droplets className="w-20 h-20 text-white/80 mb-3" />
            <span className="text-white text-xl font-bold">Pure Water</span>
            <span className="text-white/70 text-sm mt-1">5L &middot; 10L &middot; 20L</span>
          </div>
          {/* Floating delivery card */}
          <div className="absolute bottom-4 right-4 bg-white rounded-xl px-4 py-3 shadow-elevated">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              <div>
                <div className="text-xs text-text-mid">Estimated delivery</div>
                <div className="text-lg font-bold text-blue-900">35 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Action Tabs (Mobile) ─── */
function ActionTabs() {
  return (
    <div className="px-4 mb-5 md:hidden">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <Droplets className="w-5 h-5 text-blue-700" />
          </div>
          <div className="font-bold text-sm text-blue-900">Order Water</div>
          <div className="text-xs text-text-mid mt-0.5">Fresh &amp; clean delivery</div>
        </div>
        <div className="bg-white rounded-xl p-4 flex flex-col items-center text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
            <Truck className="w-5 h-5 text-blue-700" />
          </div>
          <div className="font-bold text-sm text-blue-900">Track Order</div>
          <div className="text-xs text-text-mid mt-0.5">Live delivery updates</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Features Grid (Desktop) ─── */
function FeaturesGrid() {
  const features = [
    {
      icon: <Droplets className="w-7 h-7 text-blue-700" />,
      bg: "bg-blue-50",
      title: "Order Water",
      desc: "Fresh, clean water delivered to your doorstep in minutes.",
      link: "#",
    },
    {
      icon: <Truck className="w-7 h-7 text-green-600" />,
      bg: "bg-green-50",
      title: "Track Delivery",
      desc: "Real-time GPS tracking so you know exactly when to expect your water.",
      link: "/track",
    },
    {
      icon: <Star className="w-7 h-7 text-yellow-500" />,
      bg: "bg-yellow-50",
      title: "Earn Rewards",
      desc: "Collect points with every order and redeem for free deliveries.",
      link: "#",
    },
  ];

  return (
    <section className="hidden md:block max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-2xl p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow"
          >
            <div className={`w-16 h-16 rounded-full ${f.bg} flex items-center justify-center mx-auto mb-4`}>
              {f.icon}
            </div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">{f.title}</h3>
            <p className="text-sm text-text-mid mb-4">{f.desc}</p>
            <Link href={f.link} className="text-blue-700 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Special Offers ─── */
function SpecialOffers() {
  return (
    <section className="md:bg-[var(--color-bg)] md:py-16">
      {/* Mobile */}
      <div className="px-4 mb-5 md:hidden">
        <h2 className="text-base font-bold text-blue-900 mb-3">Special Offers</h2>
        <div className="space-y-3">
          <OfferCard
            gradient="from-blue-700 to-blue-500"
            icon={<Gift className="w-5 h-5 text-blue-700" />}
            iconBg="bg-white"
            title="Bulk Order Discount"
            desc="Order 3+ jugs and save up to 20%"
            mobile
          />
          <OfferCard
            gradient="from-[#F5A67A] to-[#F0C8A8]"
            icon={<Droplets className="w-5 h-5 text-[#E8553A]" />}
            iconBg="bg-white"
            title="First Order Free Delivery"
            desc="No delivery fee on your first order"
            mobile
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Special Offers</h2>
        <div className="grid grid-cols-2 gap-6">
          <OfferCard
            gradient="from-blue-700 to-blue-500"
            icon={<Gift className="w-6 h-6 text-blue-700" />}
            iconBg="bg-white"
            title="Bulk Order Discount"
            desc="Order 3+ jugs and save up to 20%"
          />
          <OfferCard
            gradient="from-[#F5A67A] to-[#F0C8A8]"
            icon={<Droplets className="w-6 h-6 text-[#E8553A]" />}
            iconBg="bg-white"
            title="First Order Free Delivery"
            desc="No delivery fee on your first order"
          />
        </div>
      </div>
    </section>
  );
}

function OfferCard({
  gradient,
  icon,
  iconBg,
  title,
  desc,
  mobile,
}: {
  gradient: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  mobile?: boolean;
}) {
  const size = mobile ? "p-4 rounded-xl" : "p-8 rounded-2xl";
  const iconSize = mobile ? "w-10 h-10" : "w-14 h-14";

  return (
    <div className={`bg-gradient-to-r ${gradient} ${size} flex items-center gap-4`}>
      <div className={`${iconSize} rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className={`font-bold text-white ${mobile ? "text-sm" : "text-lg"}`}>{title}</div>
        <div className={`text-white/80 ${mobile ? "text-xs" : "text-sm"} mt-0.5`}>{desc}</div>
      </div>
    </div>
  );
}

/* ─── Rewards (Mobile) ─── */
function RewardsSection() {
  return (
    <div className="px-4 mb-5 md:hidden">
      <h2 className="text-base font-bold text-blue-900 mb-3">Rewards</h2>
      <div className="bg-white rounded-xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-sm text-blue-900">MiMaji Rewards</span>
        </div>
        <p className="text-xs text-text-mid mb-3">
          Earn points with every order and redeem them for free deliveries and discounts.
        </p>
        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
          <div className="h-2 bg-yellow-500 rounded-full" style={{ width: "30%" }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-mid">150 / 500 pts</span>
          <span className="text-xs text-text-mid">Next reward: Free delivery at 500 pts</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile Footer ─── */
function MobileFooter() {
  const linkRows = [
    [
      { icon: <Droplets className="w-4 h-4" />, label: "Order Water", href: "#" },
      { icon: <ClipboardList className="w-4 h-4" />, label: "My Orders", href: "/orders" },
      { icon: <Calendar className="w-4 h-4" />, label: "Subscriptions", href: "#" },
      { icon: <Calendar className="w-4 h-4" />, label: "Schedule", href: "#" },
      { icon: <User className="w-4 h-4" />, label: "My Account", href: "#" },
      { icon: <Headphones className="w-4 h-4" />, label: "Support", href: "#" },
    ],
    [
      { icon: <MapPin className="w-4 h-4" />, label: "Vendor Map", href: "/kiosks" },
      { icon: <Info className="w-4 h-4" />, label: "About MiMaji", href: "#" },
      { icon: <FileText className="w-4 h-4" />, label: "Docs", href: "#" },
      { icon: <Shield className="w-4 h-4" />, label: "Terms & Privacy", href: "#" },
      { icon: <LogIn className="w-4 h-4" />, label: "Vendor Login", href: "/distributor" },
    ],
  ];

  return (
    <footer className="border-t border-blue-100 px-4 pt-6 pb-20 md:hidden">
      {linkRows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
          {row.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 text-text-mid text-sm hover:text-blue-700 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      ))}

      {/* Contact */}
      <div className="mt-4 mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-mid">
          <Phone className="w-4 h-4" />
          <a href="tel:+254758434076" className="hover:text-blue-700">+254 758 434 076</a>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-mid">
          <Mail className="w-4 h-4" />
          <a href="mailto:hello@mimaji.co.ke" className="hover:text-blue-700">hello@mimaji.co.ke</a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between text-xs text-text-light">
        <span>&copy; 2026 MiMaji</span>
        <span>v2.2.0</span>
      </div>
    </footer>
  );
}

/* ─── Desktop Footer ─── */
function DesktopFooter() {
  return (
    <footer className="hidden md:block bg-[#1A2A3A]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-8">
          {/* Col 1: Logo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">MiMaji</span>
            </div>
            <p className="text-white/60 text-sm">
              Fresh, clean water delivered to your doorstep. Serving Nairobi and beyond.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Links</h4>
            <div className="space-y-2">
              {["Order Water", "My Orders", "Subscriptions", "Schedule"].map((l) => (
                <Link key={l} href="#" className="block text-white/60 text-sm hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Company</h4>
            <div className="space-y-2">
              {[
                { label: "Vendor Map", href: "/kiosks" },
                { label: "About", href: "#" },
                { label: "Docs", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Vendor Login", href: "/distributor" },
              ].map((l) => (
                <Link key={l.label} href={l.href} className="block text-white/60 text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:+254758434076" className="hover:text-white transition-colors">+254 758 434 076</a>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@mimaji.co.ke" className="hover:text-white transition-colors">hello@mimaji.co.ke</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-white/60 text-sm">&copy; 2026 MiMaji. All rights reserved.</span>
          <span className="text-white/60 text-sm">v2.2.0</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Headers */}
      <MobileHeader />
      <DesktopNav />

      {/* Heroes */}
      <MobileHero />
      <DesktopHero />

      {/* Action cards */}
      <ActionTabs />
      <FeaturesGrid />

      {/* Offers */}
      <SpecialOffers />

      {/* Rewards (mobile only) */}
      <RewardsSection />

      {/* Footers */}
      <MobileFooter />
      <DesktopFooter />
    </div>
  );
}
