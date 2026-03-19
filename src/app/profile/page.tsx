"use client";

import { useState } from "react";
import { User, ChevronRight, MapPin, CreditCard, Bell, Shield, HelpCircle, LogOut, FileText, Star, Settings, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

const menuItems = [
  { label: "My Orders", icon: FileText, href: "/orders" },
  { label: "Account & Profile", icon: User, href: "/account-settings" },
  { label: "Saved Addresses", icon: MapPin, href: "/saved-addresses" },
  { label: "Payment Methods", icon: CreditCard, href: "/payment-methods" },
  { label: "Water Warriors Rewards", icon: Star, href: "/rewards" },
  { label: "Subscriptions", icon: Settings, href: "/subscriptions" },
  { label: "Notifications", icon: Bell, href: "#" },
  { label: "Privacy & Security", icon: Shield, href: "/privacy" },
  { label: "Help & Support", icon: HelpCircle, href: "/support" },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
        <DesktopNav />
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
  user: { phone: string; name: string } | null;
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
              editMode ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-text-primary outline-none focus:border-primary"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="text-primary text-xs font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="text-text-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-bold text-lg text-text-primary">{user.name}</p>
                  <p className="text-text-secondary text-sm">{user.phone}</p>
                </>
              )
            ) : (
              <>
                <p className="font-bold text-text-primary">Guest</p>
                <Link href="/login" className="text-primary text-sm font-semibold">
                  Log in to your account
                </Link>
              </>
            )}
          </div>
          {user && !editMode && (
            <button onClick={() => setEditMode(true)} className="text-primary">
              <Edit2 size={18} />
            </button>
          )}
        </div>
      </div>

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

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo1.png" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
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
