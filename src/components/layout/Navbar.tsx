"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/i18n";
import { useAuth } from "@/lib/AuthContext";

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
  const { user } = useAuth();

  if (variant === "distributor") {
    return (
      <nav className="bg-white px-5 py-3.5 flex items-center justify-between shadow-sm">
        <span className="font-bold text-blue-700 text-base">MiMaji</span>
        <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-[11px] font-semibold">
          {t("nav.distributor", lang)}
        </span>
      </nav>
    );
  }

  if (variant === "admin") {
    return (
      <nav className="bg-white px-5 py-3.5 flex items-center justify-between shadow-sm">
        <span className="font-bold text-blue-700 text-base">MiMaji Admin</span>
        <span className="text-text-light text-[11px]">admin@mimaji.co.ke</span>
      </nav>
    );
  }

  const navLinks = [
    { href: "/kiosks", label: t("nav.kiosks", lang), desc: lang === "en" ? "Find water near you" : "Pata maji karibu nawe" },
    { href: "/track", label: t("nav.track", lang), desc: lang === "en" ? "Live delivery tracking" : "Fuatilia uwasilishaji" },
    { href: "/orders", label: t("nav.orders", lang), desc: lang === "en" ? "View order history" : "Tazama historia ya oda" },
    { href: "/subscriptions", label: lang === "en" ? "Subscriptions" : "Usajili", desc: lang === "en" ? "Weekly water plans" : "Mipango ya maji ya kila wiki" },
    { href: "/referrals", label: t("nav.referrals", lang), desc: lang === "en" ? "Get free water" : "Pata maji bure" },
    { href: "/join/rider", label: t("nav.rider", lang), desc: lang === "en" ? "Earn money delivering" : "Pata pesa kwa kusambaza" },
    { href: "/join/provider", label: t("nav.provider", lang), desc: lang === "en" ? "Join as a provider" : "Jiunge kama msambazaji" },
  ];

  return (
    <>
      <nav className="bg-white px-5 h-14 flex items-center justify-between sticky top-0 z-50 shadow-sm max-w-full">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-blue-900">MiMaji</span>
        </Link>

        {!minimal && (
          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/kiosks" className="text-text-mid text-xs font-medium px-3 py-2 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.kiosks", lang)}
              </Link>
              <Link href="/track" className="text-text-mid text-xs font-medium px-3 py-2 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {t("nav.track", lang)}
              </Link>
              <Link href="/subscriptions" className="text-text-mid text-xs font-medium px-3 py-2 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {lang === "en" ? "Plans" : "Mipango"}
              </Link>
              <Link href="/contact" className="text-text-mid text-xs font-medium px-3 py-2 rounded-full hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {lang === "en" ? "Contact" : "Wasiliana"}
              </Link>

              {user ? (
                <>
                  <Link href="/orders" className="text-blue-700 bg-blue-50 px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors">
                    {t("nav.orders", lang)}
                  </Link>
                  <Link href="/profile" className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold hover:bg-blue-500 transition-colors ml-1">
                    {user.fullName[0]}
                  </Link>
                </>
              ) : (
                <Link href="/login" className="bg-blue-700 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-blue-500 transition-colors ml-2 shadow-sm">
                  {t("nav.login", lang)}
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-full hover:bg-blue-50"
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
          <div className="fixed inset-0 bg-black/15 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed top-14 left-0 right-0 bg-white z-40 lg:hidden animate-fade-in max-h-[80vh] overflow-y-auto" style={{ boxShadow: "0 8px 30px rgba(26, 58, 92, 0.1)" }}>
            <div className="p-4 space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-blue-900 text-sm">{item.label}</div>
                    <div className="text-text-light text-xs">{item.desc}</div>
                  </div>
                </Link>
              ))}

              <div className="border-t border-blue-50 my-2 pt-2" />

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50"
              >
                <div>
                  <div className="font-semibold text-blue-900 text-sm">{lang === "en" ? "Contact Us" : "Wasiliana Nasi"}</div>
                  <div className="text-text-light text-xs">{lang === "en" ? "Get in touch" : "Wasiliana nasi"}</div>
                </div>
              </Link>

              <Link
                href="/support"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50"
              >
                <div>
                  <div className="font-semibold text-blue-900 text-sm">{lang === "en" ? "Help & Support" : "Msaada"}</div>
                  <div className="text-text-light text-xs">{lang === "en" ? "FAQ & support" : "Maswali na msaada"}</div>
                </div>
              </Link>

              <div className="border-t border-blue-50 my-2 pt-2" />

              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                    {user.fullName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 text-sm">{user.fullName}</div>
                    <div className="text-text-light text-xs">{lang === "en" ? "View profile" : "Tazama wasifu"}</div>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-blue-700 text-white shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-sm">{t("nav.login", lang)}</div>
                    <div className="text-blue-200 text-xs">{lang === "en" ? "Sign in or create account" : "Ingia au fungua akaunti"}</div>
                    </div>
                  </Link>
              )}

              <Link
                href="/vendor"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50"
              >
                <div>
                  <div className="font-semibold text-blue-900 text-sm">{lang === "en" ? "Vendor Portal" : "Lango la Muuzaji"}</div>
                  <div className="text-text-light text-xs">{lang === "en" ? "Manage your kiosk" : "Simamia kibanda chako"}</div>
                </div>
              </Link>

              <Link
                href="/distributor"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50"
              >
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
