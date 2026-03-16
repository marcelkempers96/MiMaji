"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  minimal?: boolean;
  variant?: "default" | "distributor" | "admin";
}

export default function Navbar({
  minimal = false,
  variant = "default",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (variant === "distributor") {
    return (
      <nav className="bg-blue-900 px-4 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-white text-base">
          💧 MiMaji
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-blue-700 text-white rounded-2xl px-2.5 py-0.5 text-[11px] font-semibold">
            Distributor
          </span>
        </div>
      </nav>
    );
  }

  if (variant === "admin") {
    return (
      <nav className="bg-blue-900 px-4 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-white text-base">
          💧 MiMaji Admin
        </span>
        <span className="text-blue-200 text-[11px]">admin@mimaji.co.ke</span>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white border-b border-blue-200 px-4 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[22px]">💧</span>
          <span className="font-display font-bold text-xl text-blue-900">
            MiMaji
          </span>
        </Link>

        {!minimal && (
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/kiosks"
                className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                Water Kiosks
              </Link>
              <Link
                href="/join/rider"
                className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                Become a Rider
              </Link>
              <Link
                href="/join/provider"
                className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                List Your Kiosk
              </Link>
              <Link
                href="/orders"
                className="text-blue-500 border border-blue-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors ml-1"
              >
                My Orders
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-blue-50"
            >
              <div
                className={`w-5 h-0.5 bg-blue-900 transition-all ${
                  menuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-blue-900 transition-all ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <div
                className={`w-5 h-0.5 bg-blue-900 transition-all ${
                  menuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {menuOpen && !minimal && (
        <div className="md:hidden bg-white border-b border-blue-200 px-4 py-3 space-y-1 animate-fade-in sticky top-14 z-40">
          {[
            { href: "/kiosks", label: "🏪 Water Kiosks & Shops", desc: "Find water near you" },
            { href: "/join/rider", label: "🚐 Become a Delivery Rider", desc: "Earn money delivering" },
            { href: "/join/provider", label: "🏭 List Your Kiosk", desc: "Join as a provider" },
            { href: "/orders", label: "📦 My Orders", desc: "Track your orders" },
            { href: "/distributor", label: "🔑 Distributor Login", desc: "Distributor portal" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block p-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="font-semibold text-blue-900 text-sm">
                {item.label}
              </div>
              <div className="text-text-light text-xs">{item.desc}</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
