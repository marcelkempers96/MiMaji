"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useRef } from "react";
import { User, ChevronRight, MapPin, CreditCard, Bell, Shield, HelpCircle, LogOut, FileText, Star, Settings, Edit2, KeyRound } from "lucide-react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const menuItems = [
  { label: "My Orders", icon: FileText, href: "/orders" },
  { label: "Invoices", icon: FileText, href: "/invoices" },
  { label: "Account & Profile", icon: User, href: "/account-settings" },
  { label: "Saved Addresses", icon: MapPin, href: "/saved-addresses" },
  { label: "Payment Methods", icon: CreditCard, href: "/payment-methods" },
  { label: "Water Warriors Rewards", icon: Star, href: "/rewards" },
  { label: "Subscriptions", icon: Settings, href: "/subscriptions" },
  { label: "Notifications", icon: Bell, href: "/notifications" },
  { label: "Privacy & Security", icon: Shield, href: "/privacy" },
  { label: "Help & Support", icon: HelpCircle, href: "/support" },
];

export default function ProfilePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const loggingOutRef = useRef(false);

  // Redirect unauthenticated users to login (must be in useEffect, not during render)
  useEffect(() => {
    if (!authLoading && !user && !loggingOutRef.current) {
      router.push("/login?redirect=/profile");
    }
  }, [authLoading, user, router]);

  const handleLogout = async () => {
    loggingOutRef.current = true;
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/");
  };

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="Account" showBack={true} />
      </div>

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <ProfileContent
          user={user}
          editMode={editMode}
          setEditMode={setEditMode}
          editName={editName}
          setEditName={setEditName}
          onLogout={handleLogout}
        />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav isLoggedIn={!!user} />
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-8">My Account</h1>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <ProfileContent
                user={user}
                editMode={editMode}
                setEditMode={setEditMode}
                editName={editName}
                setEditName={setEditName}
                onLogout={handleLogout}
              />
            </div>
            <div>
              <div className="bg-surface shadow-card rounded-2xl p-6 sticky top-8">
                <h3 className="font-bold text-base text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/buy" className="block w-full bg-primary text-white rounded-xl py-3 text-center font-semibold text-sm hover:bg-[#1a5a9a] transition-colors">
                    Order Water
                  </Link>
                  <Link href="/orders" className="block w-full bg-primary-light text-primary rounded-xl py-3 text-center font-semibold text-sm hover:bg-primary hover:text-white transition-colors">
                    View Orders
                  </Link>
                  <Link href="/rewards" className="block w-full bg-[#FFF5EC] text-rating rounded-xl py-3 text-center font-semibold text-sm hover:bg-rating hover:text-white transition-colors">
                    My Rewards
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function ProfileContent({ user, editMode, setEditMode, editName, setEditName, onLogout }: {
  user: { phone: string; name: string; deliveryPin?: string } | null;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  editName: string;
  setEditName: (v: string) => void;
  onLogout: () => void;
}) {
  return (
    <>
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
        </div>
      </div>

      {/* Delivery Code */}
      {user?.deliveryPin && (
        <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-xl p-4 mb-4">
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide mb-2 text-center">Your Delivery Code</p>
          <div className="flex justify-center gap-2">
            {user.deliveryPin.split("").map((digit, i) => (
              <div key={i} className="w-11 h-13 bg-white rounded-xl flex items-center justify-center shadow-sm py-2">
                <span className="text-xl font-extrabold text-primary">{digit}</span>
              </div>
            ))}
          </div>
          <p className="text-text-secondary text-[10px] text-center mt-2">
            Share this code with the delivery driver to confirm your delivery.
          </p>
        </div>
      )}

      {/* Rewards Summary */}
      <Link href="/rewards">
        <div className="bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-4 mb-4 flex items-center gap-3 hover:shadow-card transition-shadow">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Star size={18} className="text-rating" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-text-primary">150 Reward Points</p>
            <p className="text-text-secondary text-xs">Water Cadet — Next: Water Ranger at 250 pts</p>
          </div>
          <ChevronRight size={18} className="text-text-secondary" />
        </div>
      </Link>

      {/* Menu Items */}
      <div className="bg-surface shadow-card rounded-xl overflow-hidden mb-4">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <div className={`flex items-center gap-3 px-5 py-4 hover:bg-background transition-colors ${i !== menuItems.length - 1 ? "border-b border-[#F0F0F0]" : ""}`}>
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
          onClick={onLogout}
          className="w-full bg-surface shadow-card rounded-xl flex items-center gap-3 px-5 py-4 text-cta-alt font-medium text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      )}
    </>
  );
}

function DesktopNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
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
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Dashboard</Link>
          ) : (
            <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

