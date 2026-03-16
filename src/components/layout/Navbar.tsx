"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/i18n";

interface NavbarProps {
  minimal?: boolean;
  variant?: "default" | "distributor" | "admin";
}

export default function Navbar({
  minimal = false,
  variant = "default",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang } = useLang();

  if (variant === "distributor") {
    return (
      <nav className="bg-blue-900 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white text-base">💧 MiMaji</span>
        <span className="bg-blue-700 text-white rounded-2xl px-2.5 py-0.5 text-[11px] font-semibold">
          {t("nav.distributor", lang)}
        </span>
      </nav>
    );
  }

  if (variant === "admin") {
    return (
      <nav className="bg-blue-900 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white text-base">💧 MiMaji Admin</span>
        <span className="text-blue-200 text-[11px]">admin@mimaji.co.ke</span>
      </nav>
    );
  }

  const navLinks = [
    { href: "/kiosks", label: t("nav.kiosks", lang), icon: "🏪", desc: lang === "en" ? "Find water near you" : "Pata maji karibu nawe" },
    { href: "/track", label: t("nav.track", lang), icon: "📍", desc: lang === "en" ? "Live delivery tracking" : "Fuatilia uwasilishaji" },
    { href: "/join/rider", label: t("nav.rider", lang), icon: "🚐", desc: lang === "en" ? "Earn money delivering" : "Pata pesa kwa kusambaza" },
    { href: "/join/provider", label: t("nav.provider", lang), icon: "🏭", desc: lang === "en" ? "Join as a provider" : "Jiunge kama msambazaji" },
    { href: "/impact", label: t("nav.impact", lang), icon: "🌍", desc: lang === "en" ? "Our community impact" : "Athari yetu kwa jamii" },
    { href: "/referrals", label: t("nav.referrals", lang), icon: "🤝", desc: lang === "en" ? "Get free water" : "Pata maji bure" },
    { href: "/orders", label: t("nav.orders", lang), icon: "📦", desc: lang === "en" ? "View order history" : "Tazama historia ya oda" },
  ];

  return (
    <>
      <nav className="bg-white border-b border-blue-200 px-4 h-14 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[22px]">💧</span>
          <span className="font-bold text-xl text-blue-900">MiMaji</span>
        </Link>

        {!minimal && (
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/kiosks" className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.kiosks", lang)}
              </Link>
              <Link href="/track" className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.track", lang)}
              </Link>
              <Link href="/impact" className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.impact", lang)}
              </Link>
              <Link href="/join/rider" className="text-text-mid text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.rider", lang)}
              </Link>
              <Link href="/signup" className="bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-900 transition-colors ml-1">
                {t("nav.signup", lang)}
              </Link>
              <Link href="/orders" className="text-blue-500 border border-blue-500 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors">
                {t("nav.orders", lang)}
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-blue-50"
              aria-label="Menu"
            >
              <div className={`w-5 h-[2px] bg-blue-900 transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <div className={`w-5 h-[2px] bg-blue-900 transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <div className={`w-5 h-[2px] bg-blue-900 transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && !minimal && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-blue-200 z-40 lg:hidden animate-fade-in max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="p-4 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <span className="text-xl w-8 text-center">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-blue-900 text-sm">{item.label}</div>
                    <div className="text-text-light text-xs">{item.desc}</div>
                  </div>
                </Link>
              ))}

              <div className="border-t border-blue-100 my-2 pt-2" />

              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-700 text-white"
              >
                <span className="text-xl w-8 text-center">👤</span>
                <div>
                  <div className="font-semibold text-sm">{t("nav.signup", lang)}</div>
                  <div className="text-blue-200 text-xs">{lang === "en" ? "Create your account" : "Fungua akaunti"}</div>
                </div>
              </Link>

              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50"
              >
                <span className="text-xl w-8 text-center">🔑</span>
                <div>
                  <div className="font-semibold text-blue-900 text-sm">{t("nav.login", lang)}</div>
                  <div className="text-text-light text-xs">{lang === "en" ? "Sign in to your account" : "Ingia kwenye akaunti"}</div>
                </div>
              </Link>

              <Link
                href="/distributor"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50"
              >
                <span className="text-xl w-8 text-center">🔐</span>
                <div>
                  <div className="font-semibold text-blue-900 text-sm">{t("nav.distributor", lang)}</div>
                  <div className="text-text-light text-xs">{lang === "en" ? "Distributor portal" : "Lango la msambazaji"}</div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
