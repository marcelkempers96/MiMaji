"use client";

import { logo1 } from "@/assets/images";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Droplets,
  MapPin,
  ChevronRight,
  Calendar,
  RefreshCw,
  FileText,
  MessageCircle,
  Star,
  Heart,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

const shortcuts = [
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "Subscriptions", icon: RefreshCw, href: "/subscriptions" },
  { label: "Order History", icon: FileText, href: "/orders" },
  { label: "Support", icon: MessageCircle, href: "/support" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { neighbourhood } = useLocation();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="max-w-md mx-auto md:hidden">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-xl font-bold text-text-primary">Welcome, {user.name}!</h1>
          <p className="text-text-secondary text-sm">{neighbourhood}</p>
        </div>
        <DashboardContent user={user} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
              <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
              <Link href="/support" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Support</Link>
              <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                {user.name}
              </Link>
            </nav>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-1">Welcome back, {user.name}!</h1>
          <p className="text-text-secondary mb-8">{neighbourhood}</p>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <DashboardContent user={user} desktop />
            </div>
            <div>
              <div className="bg-surface shadow-card rounded-2xl p-6 sticky top-8">
                <h3 className="font-bold text-base text-text-primary mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {shortcuts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href} className="flex items-center gap-3 py-2 hover:text-primary transition-colors">
                        <Icon size={18} className="text-primary" />
                        <span className="text-sm font-medium text-text-primary">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ user, desktop }: { user: { phone: string; name: string }; desktop?: boolean }) {
  return (
    <div className="px-4">
      {/* Action Cards */}
      <Link href="/buy">
        <div className="bg-surface shadow-card rounded-xl p-4 mb-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <Droplets size={24} className="text-primary" />
          <span className="font-bold text-text-primary flex-1">Order Water</span>
          <ChevronRight size={20} className="text-text-secondary" />
        </div>
      </Link>

      <Link href="/track">
        <div className="bg-surface shadow-card rounded-xl p-4 mb-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <MapPin size={24} className="text-primary" />
          <span className="font-bold text-text-primary flex-1">Track Order</span>
          <ChevronRight size={20} className="text-text-secondary" />
        </div>
      </Link>

      {/* Rewards */}
      <Link href="/rewards">
        <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-4 mb-3 flex items-center gap-3 hover:shadow-card transition-shadow">
          <Star size={24} className="text-rating" />
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">150 Reward Points</p>
            <p className="text-text-secondary text-xs">Water Cadet — Earn more!</p>
          </div>
          <ChevronRight size={20} className="text-text-secondary" />
        </div>
      </Link>

      {/* Special Offers */}
      <h2 className="text-[16px] font-semibold text-text-primary mt-6 mb-3">Special Offers</h2>
      <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-xl p-4 flex items-center mb-3">
        <div className="flex-1">
          <p className="font-bold text-text-primary">Discount on Bulk Orders</p>
          <p className="text-text-secondary text-sm">Save up to 20%</p>
        </div>
        <div className="flex gap-1">
          <Droplets size={24} className="text-primary opacity-60" />
          <Droplets size={20} className="text-primary opacity-40" />
          <Droplets size={16} className="text-primary opacity-20" />
        </div>
      </div>

      {/* Impact */}
      <Link href="/impact">
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-4 flex items-center gap-3 mb-3 hover:shadow-card transition-shadow">
          <Heart size={20} className="text-[#2ECC71]" />
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">Your Impact</p>
            <p className="text-text-secondary text-xs">Your orders help rural communities get clean water</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary" />
        </div>
      </Link>

      {/* Feature Shortcuts - mobile only */}
      {!desktop && (
        <div className="grid grid-cols-4 gap-2 mt-6">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-[11px] text-text-secondary">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
