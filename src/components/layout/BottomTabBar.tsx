"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, ClipboardList, User } from "lucide-react";

const tabs = [
  { key: "home", label: "Home", icon: Home, href: "/" },
  { key: "buy", label: "Order", icon: ShoppingCart, href: "/buy" },
  { key: "orders", label: "Orders", icon: ClipboardList, href: "/orders" },
  { key: "profile", label: "Account", icon: User, href: "/profile" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (tab: (typeof tabs)[number]) => {
    if (tab.href === "/") return pathname === "/" || pathname === "/dashboard";
    return pathname.startsWith(tab.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-[#E0E0E0] z-20 md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                active ? "text-primary" : "text-text-secondary"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[11px] ${active ? "font-bold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
