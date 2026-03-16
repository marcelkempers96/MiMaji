"use client";

import Link from "next/link";

interface NavbarProps {
  minimal?: boolean;
  variant?: "default" | "distributor" | "admin";
  zoneName?: string;
}

export default function Navbar({
  minimal = false,
  variant = "default",
}: NavbarProps) {
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
    <nav className="bg-white border-b border-blue-200 px-4 h-14 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-[22px]">💧</span>
        <span className="font-display font-bold text-xl text-blue-900">
          MiMaji
        </span>
      </Link>
      {!minimal && (
        <Link
          href="/orders"
          className="text-blue-500 border border-blue-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
        >
          My Orders
        </Link>
      )}
    </nav>
  );
}
