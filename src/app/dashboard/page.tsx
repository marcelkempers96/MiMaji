"use client";

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
} from "lucide-react";
import BottomTabBar from "@/components/layout/BottomTabBar";
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
      {/* Greeting Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-text-primary">
          Welcome, {user.name}!
        </h1>
        <p className="text-text-secondary text-sm">{neighbourhood}</p>
      </div>

      <div className="px-4">
        {/* Action Cards */}
        <Link href="/location">
          <div className="bg-surface shadow-card rounded-xl p-4 mb-3 flex items-center gap-3">
            <Droplets size={24} className="text-primary" />
            <span className="font-bold text-text-primary flex-1">Order Water</span>
            <ChevronRight size={20} className="text-text-secondary" />
          </div>
        </Link>

        <Link href="/track">
          <div className="bg-surface shadow-card rounded-xl p-4 mb-3 flex items-center gap-3">
            <MapPin size={24} className="text-primary" />
            <span className="font-bold text-text-primary flex-1">Track Order</span>
            <ChevronRight size={20} className="text-text-secondary" />
          </div>
        </Link>

        {/* Special Offers */}
        <h2 className="text-[16px] font-semibold text-text-primary mt-6 mb-3">
          Special Offers
        </h2>
        <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-xl p-4 flex items-center">
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

        {/* Feature Shortcuts */}
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
      </div>

      <BottomTabBar activeTab="home" />
    </div>
  );
}
