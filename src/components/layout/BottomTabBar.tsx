"use client";

import Link from "next/link";
import { Home, Clock, Wallet, MessageCircle, User } from "lucide-react";

interface BottomTabBarProps {
  activeTab?: string;
}

const tabs = [
  { key: "home", label: "Home", icon: Home, href: "/dashboard" },
  { key: "schedule", label: "Schedule", icon: Clock, href: "/schedule" },
  { key: "wallet", label: "Wallet", icon: Wallet, href: "/cart" },
  { key: "messages", label: "Messages", icon: MessageCircle, href: "/support" },
  { key: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function BottomTabBar({ activeTab }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-[#E0E0E0] flex items-center justify-around h-14 z-20 max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isActive ? "text-primary" : "text-text-secondary"
            }`}
          >
            <Icon size={24} strokeWidth={2} />
            <span className="text-[11px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
