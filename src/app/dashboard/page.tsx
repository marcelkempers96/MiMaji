"use client";

import { logo1 } from "@/assets/images";
import { useEffect, useState } from "react";
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
  Download,
  X,
  User,
  Receipt,
  Home,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { getRewardsSummaryAsync } from "@/lib/rewards";
import { fetchUserOrders, mapOrderStatus } from "@/lib/orders";

const shortcuts = [
  { label: "Schedule", icon: Calendar, href: "/schedule" },
  { label: "Subscriptions", icon: RefreshCw, href: "/subscriptions" },
  { label: "Order History", icon: FileText, href: "/orders" },
  { label: "Invoices", icon: Receipt, href: "/invoices" },
  { label: "Account & Profile", icon: User, href: "/account-settings" },
  { label: "Saved Addresses", icon: MapPin, href: "/saved-addresses" },
  { label: "Homepage", icon: Home, href: "/" },
  { label: "Support", icon: MessageCircle, href: "/support" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { neighbourhood } = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
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
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
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

function DashboardContent({ user, desktop }: { user: { id: string; phone: string; name: string }; desktop?: boolean }) {
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [freeLitres, setFreeLitres] = useState(0);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      getRewardsSummaryAsync(user.id).then((summary) => {
        setFreeLitres(summary.freeLitres);
      });

      // Fetch active orders count
      fetchUserOrders(user.id).then((orders) => {
        const active = orders.filter((o) => {
          const status = mapOrderStatus(o.status);
          return status !== "Delivered" && status !== "Cancelled";
        });
        setActiveOrderCount(active.length);
      });
    }
  }, [user?.id]);

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

      <Link href="/orders">
        <div className="bg-surface shadow-card rounded-xl p-4 mb-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <FileText size={24} className="text-primary" />
          <span className="font-bold text-text-primary flex-1">
            My Orders{activeOrderCount > 0 && <span className="text-primary"> ({activeOrderCount})</span>}
          </span>
          <ChevronRight size={20} className="text-text-secondary" />
        </div>
      </Link>

      {/* Rewards */}
      <Link href="/rewards">
        <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-4 mb-3 flex items-center gap-3 hover:shadow-card transition-shadow">
          <Star size={24} className="text-rating" />
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">{freeLitres}L Free Water Earned</p>
            <p className="text-text-secondary text-xs">Refer friends & earn more!</p>
          </div>
          <ChevronRight size={20} className="text-text-secondary" />
        </div>
      </Link>

      {/* Install App Block */}
      <button
        onClick={() => setShowInstallPopup(true)}
        className="w-full bg-gradient-to-r from-primary to-[#1a5a9a] rounded-xl p-4 mb-3 flex items-center gap-3 text-left hover:shadow-card transition-shadow"
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Download size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-white">Install MiMaji App</p>
          <p className="text-white/70 text-xs">Add to your home screen for quick access</p>
        </div>
        <ChevronRight size={20} className="text-white/60" />
      </button>

      {/* Install App Popup */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-text-primary">Install MiMaji</h3>
              <button onClick={() => setShowInstallPopup(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-4">
              <p className="text-text-secondary text-sm mb-4">
                MiMaji works like an app! Add it to your home screen for instant access.
              </p>

              {/* iPhone Instructions */}
              <div className="mb-5">
                <h4 className="font-bold text-sm text-text-primary mb-2">iPhone (Safari)</h4>
                <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
                  <li>Open <span className="font-semibold text-text-primary">mimaji.co.ke</span> in Safari</li>
                  <li>Tap the <span className="font-semibold text-text-primary">Share</span> button (square with arrow)</li>
                  <li>Scroll down and tap <span className="font-semibold text-text-primary">&quot;Add to Home Screen&quot;</span></li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add&quot;</span> to confirm</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div className="mb-5">
                <h4 className="font-bold text-sm text-text-primary mb-2">Android (Chrome)</h4>
                <ol className="text-text-secondary text-sm space-y-2 list-decimal list-inside">
                  <li>Open <span className="font-semibold text-text-primary">mimaji.co.ke</span> in Chrome</li>
                  <li>Tap the <span className="font-semibold text-text-primary">three dots menu</span> (top right)</li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add to Home Screen&quot;</span> or <span className="font-semibold text-text-primary">&quot;Install App&quot;</span></li>
                  <li>Tap <span className="font-semibold text-text-primary">&quot;Add&quot;</span> to confirm</li>
                </ol>
              </div>

              <div className="bg-primary-light rounded-xl p-3">
                <p className="text-primary text-xs font-medium text-center">
                  Once installed, MiMaji will appear as an app icon on your home screen!
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setShowInstallPopup(false)}
                className="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Your Impact */}
      <YourImpact />

      {/* Feature Shortcuts - mobile only */}
      {!desktop && (
        <div className="grid grid-cols-4 gap-3 mt-6">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-[11px] text-text-secondary text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YourImpact() {
  const { user } = useAuth();
  const [totalLitres, setTotalLitres] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserOrders(user.id).then((orders) => {
      let litres = 0;
      for (const order of orders) {
        if (order.status !== "cancelled") {
          for (const item of order.order_items || []) {
            const sizeMatch = item.name?.match(/(\d+)L/i);
            if (sizeMatch) {
              litres += parseInt(sizeMatch[1]) * (item.quantity || 1);
            }
          }
        }
      }
      setTotalLitres(litres);
    });
  }, [user?.id]);

  const donatedLitres = Math.floor(totalLitres * 0.1); // 10% goes to rural communities

  return (
    <Link href="/impact">
      <div className="bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-4 mb-3 hover:shadow-card transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <Heart size={20} className="text-[#2ECC71]" />
          <p className="font-bold text-sm text-text-primary">Your Impact</p>
          <ChevronRight size={18} className="text-text-secondary ml-auto" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-lg p-2.5 text-center">
            <p className="text-lg font-extrabold text-primary">{totalLitres}L</p>
            <p className="text-text-secondary text-[10px]">Total Litres Ordered</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2.5 text-center">
            <p className="text-lg font-extrabold text-[#2ECC71]">{donatedLitres}L</p>
            <p className="text-text-secondary text-[10px]">Donated to Communities</p>
          </div>
        </div>
        <p className="text-text-secondary text-[10px] mt-2 text-center">
          For every 100L you order, 10L goes to rural communities in Kenya
        </p>
      </div>
    </Link>
  );
}
