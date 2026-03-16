"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { t, Lang } from "@/lib/i18n";

export default function Footer() {
  const { lang, setLang } = useLang();

  return (
    <footer className="bg-blue-900 text-white">
      {/* Main footer */}
      <div className="px-5 pt-8 pb-6">
        {/* Logo & tagline */}
        <div className="mb-6">
          <div className="font-bold text-lg mb-1">💧 MiMaji</div>
          <div className="text-blue-200 text-sm">{t("footer.tagline", lang)}</div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-blue-200 mb-2">
              {lang === "en" ? "Quick Links" : "Viungo vya Haraka"}
            </div>
            <div className="space-y-2">
              <Link href="/kiosks" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.kiosks", lang)}
              </Link>
              <Link href="/track" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.track", lang)}
              </Link>
              <Link href="/orders" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.orders", lang)}
              </Link>
              <Link href="/impact" className="block text-blue-100 hover:text-white transition-colors">
                {t("footer.impact", lang)}
              </Link>
              <Link href="/referrals" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.referrals", lang)}
              </Link>
            </div>
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-blue-200 mb-2">
              {lang === "en" ? "Join Us" : "Jiunge Nasi"}
            </div>
            <div className="space-y-2">
              <Link href="/join/rider" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.rider", lang)}
              </Link>
              <Link href="/join/provider" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.provider", lang)}
              </Link>
              <Link href="/distributor" className="block text-blue-100 hover:text-white transition-colors">
                {t("nav.distributor", lang)}
              </Link>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <div className="font-bold text-xs uppercase tracking-wider text-blue-200 mb-2">
            {t("footer.contact", lang)}
          </div>
          <div className="space-y-1 text-sm text-blue-100">
            <div>📲 WhatsApp: <a href="https://wa.me/254758434076" className="underline hover:text-white">+254 758 434 076</a></div>
            <div>📧 hello@mimaji.co.ke</div>
            <div>📍 Nairobi, Kenya</div>
          </div>
        </div>

        {/* Language selector */}
        <div className="mb-6">
          <div className="font-bold text-xs uppercase tracking-wider text-blue-200 mb-2">
            🌐 {t("footer.language", lang)}
          </div>
          <div className="flex gap-2">
            {(["en", "sw"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  lang === l
                    ? "bg-white text-blue-900"
                    : "bg-white/10 text-blue-200 hover:bg-white/20"
                }`}
              >
                {l === "en" ? "English" : "Kiswahili"}
              </button>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap gap-4 text-xs text-blue-200 mb-4">
          <Link href="#" className="hover:text-white">{t("footer.privacy", lang)}</Link>
          <Link href="#" className="hover:text-white">{t("footer.terms", lang)}</Link>
          <Link href="#" className="hover:text-white">{t("footer.faq", lang)}</Link>
          <Link href="#" className="hover:text-white">{t("footer.about", lang)}</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-700 px-5 py-3 flex items-center justify-between">
        <span className="text-blue-200 text-[11px]">
          © {new Date().getFullYear()} MiMaji. {t("footer.rights", lang)}
        </span>
        <span className="text-blue-200 text-[11px]">mimaji.co.ke</span>
      </div>
    </footer>
  );
}
