"use client";

import { logo1, waterDeliveryMiMaji } from "@/assets/images";
import { Droplets, Heart, MapPin, Users, Globe, TrendingUp } from "lucide-react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Our Impact" showBack={true} />

      {/* Mobile Layout */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <ImpactContent />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-12">
          <ImpactContent />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function ImpactContent() {
  return (
    <>
      {/* Impact Main Image */}
      <div className="rounded-2xl overflow-hidden mb-4">
        <img src="/impactmain.png" alt="MiMaji community water impact" className="w-full h-48 md:h-72 object-cover rounded-2xl" />
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 md:p-10 text-white mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Heart size={28} className="text-white" />
          <h1 className="text-2xl md:text-4xl font-extrabold">Water is Life</h1>
        </div>
        <p className="text-white/80 text-sm md:text-base max-w-xl">
          At MiMaji, every order you place helps bring clean water to communities that need it most.
          Together, we&apos;re making a difference — one delivery at a time.
        </p>
      </div>

      {/* Our Promise */}
      <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-5 md:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Droplets size={28} className="text-[#2ECC71]" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg md:text-xl text-text-primary mb-2">Our Promise</h2>
            <p className="text-text-primary text-sm md:text-base font-medium">
              For every <span className="font-extrabold text-[#2ECC71]">100 Litres</span> delivered,
              we supply <span className="font-extrabold text-[#2ECC71]">10% (10 Litres)</span> of
              clean water to rural communities in Kenya.
            </p>
            <p className="text-text-secondary text-xs md:text-sm mt-2">
              That means every time you order, you&apos;re directly contributing to someone&apos;s access to clean, safe water.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <h2 className="font-bold text-base md:text-xl text-text-primary mb-3">Impact So Far</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Droplets size={24} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-primary">50,000L</p>
          <p className="text-text-secondary text-xs">Water Delivered</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Heart size={24} className="text-[#E8544E] mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-[#E8544E]">5,000L</p>
          <p className="text-text-secondary text-xs">Donated to Rural Areas</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Users size={24} className="text-[#F5A623] mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-[#F5A623]">2,500+</p>
          <p className="text-text-secondary text-xs">Families Served</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <MapPin size={24} className="text-[#2ECC71] mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-[#2ECC71]">12</p>
          <p className="text-text-secondary text-xs">Rural Communities</p>
        </div>
      </div>

      {/* MajiMap Project */}
      <div className="bg-surface shadow-card rounded-2xl p-5 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Globe size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-text-primary">MajiMap Project</h2>
            <p className="text-text-secondary text-xs">Mapping water access across Kenya</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          MajiMap is our initiative to map water access points, boreholes, and distribution networks
          across Kenya. By understanding where water is — and where it isn&apos;t — we can direct
          resources where they&apos;re needed most.
        </p>
        <div className="bg-primary-light rounded-xl p-4 mb-4">
          <h3 className="font-bold text-sm text-text-primary mb-2">How MajiMap Works</h3>
          <ul className="text-text-secondary text-sm space-y-2">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>GPS mapping of boreholes, kiosks, and water points across rural Kenya</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Real-time data on water quality, availability, and pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <Users size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Community-driven reporting and verification</span>
            </li>
            <li className="flex items-start gap-2">
              <Heart size={16} className="text-[#E8544E] mt-0.5 flex-shrink-0" />
              <span>Direct connection between urban customers and rural water needs</span>
            </li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl overflow-hidden min-h-[160px]">
          <img src="/majimap.png" alt="MajiMap - Mapping water access across Kenya" className="object-cover w-full h-full" />
        </div>
      </div>

      {/* How You Help */}
      <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-2xl p-5 md:p-8 mb-6">
        <h2 className="font-extrabold text-lg text-text-primary mb-4">How Your Order Helps</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">1</div>
            <div>
              <p className="font-bold text-sm text-text-primary">You Order Water</p>
              <p className="text-text-secondary text-xs">Place an order for purified water through MiMaji</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">2</div>
            <div>
              <p className="font-bold text-sm text-text-primary">We Deliver to You</p>
              <p className="text-text-secondary text-xs">Fast, reliable delivery to your door in Nairobi</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#2ECC71]">3</div>
            <div>
              <p className="font-bold text-sm text-text-primary">10% Goes to Rural Kenya</p>
              <p className="text-text-secondary text-xs">For every 100L delivered, 10L goes to communities without clean water access</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/buy"
        className="block w-full bg-primary text-white text-center rounded-xl py-4 font-bold text-sm hover:bg-[#1a5a9a] transition-colors"
      >
        Order Water & Make an Impact
      </Link>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/impact" className="text-primary font-medium text-sm">Impact</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
