"use client";

import { User, ChevronRight, MapPin, CreditCard, Bell, Shield, HelpCircle, LogOut, FileText, Star } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { label: "My Orders", icon: FileText, href: "/orders" },
  { label: "Saved Addresses", icon: MapPin, href: "/location" },
  { label: "Payment Methods", icon: CreditCard, href: "#" },
  { label: "Rewards", icon: Star, href: "/orders" },
  { label: "Notifications", icon: Bell, href: "#" },
  { label: "Privacy & Security", icon: Shield, href: "#" },
  { label: "Help & Support", icon: HelpCircle, href: "/support" },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Account" showBack={true} />

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Profile Card */}
        <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center">
              <User size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              {user ? (
                <>
                  <p className="font-bold text-lg text-text-primary">{user.name}</p>
                  <p className="text-text-secondary text-sm">{user.phone}</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-text-primary">Guest</p>
                  <Link href="/login" className="text-primary text-sm font-semibold">
                    Log in to your account
                  </Link>
                </>
              )}
            </div>
            <Link href="#" className="text-primary text-sm font-semibold">Edit</Link>
          </div>
        </div>

        {/* Rewards Summary */}
        <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Star size={18} className="text-rating" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">150 Reward Points</p>
            <p className="text-text-secondary text-xs">Next: Free delivery at 250 pts</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary" />
        </div>

        {/* Menu Items */}
        <div className="bg-surface shadow-card rounded-xl overflow-hidden mb-4">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center gap-3 px-5 py-4 ${i !== menuItems.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}>
                  <Icon size={20} className="text-text-secondary" />
                  <span className="flex-1 text-sm font-medium text-text-primary">{item.label}</span>
                  <ChevronRight size={18} className="text-text-secondary" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={handleLogout}
            className="w-full bg-surface shadow-card rounded-xl flex items-center gap-3 px-5 py-4 text-cta-alt font-medium text-sm"
          >
            <LogOut size={20} />
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
