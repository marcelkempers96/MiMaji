"use client";

import Link from "next/link";
import { useLang } from "@/lib/LangContext";
import { t, Lang } from "@/lib/i18n";

export default function Footer() {
  const { lang, setLang } = useLang();

  return (
    <footer className="bg-white border-t border-blue-100">
      {/* Main footer */}
      <div className="px-5 pt-8 pb-6">
        {/* Logo & tagline */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-blue-900">MiMaji</span>
          </div>
          <div className="text-text-mid text-sm">{t("footer.tagline", lang)}</div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-text-light mb-2">
              {lang === "en" ? "Quick Links" : "Viungo vya Haraka"}
            </div>
            <div className="space-y-2">
              <Link href="/kiosks" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.kiosks", lang)}
              </Link>
              <Link href="/track" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.track", lang)}
              </Link>
              <Link href="/orders" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.orders", lang)}
              </Link>
              <Link href="/impact" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("footer.impact", lang)}
              </Link>
              <Link href="/referrals" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.referrals", lang)}
              </Link>
            </div>
          </div>
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-text-light mb-2">
              {lang === "en" ? "Join Us" : "Jiunge Nasi"}
            </div>
            <div className="space-y-2">
              <Link href="/join/rider" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.rider", lang)}
              </Link>
              <Link href="/join/provider" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.provider", lang)}
              </Link>
              <Link href="/distributor" className="block text-text-mid hover:text-blue-700 transition-colors">
                {t("nav.distributor", lang)}
              </Link>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <div className="font-semibold text-xs uppercase tracking-wider text-text-light mb-2">
            {t("footer.contact", lang)}
          </div>
          <div className="space-y-1 text-sm text-text-mid">
            <div>WhatsApp: <a href="https://wa.me/254758434076" className="text-blue-700 hover:underline">+254 758 434 076</a></div>
            <div>hello@mimaji.co.ke</div>
            <div>Nairobi, Kenya</div>
          </div>
        </div>

        {/* Language selector */}
        <div className="mb-6">
          <div className="font-semibold text-xs uppercase tracking-wider text-text-light mb-2">
            {t("footer.language", lang)}
          </div>
          <div className="flex gap-2">
            {(["en", "sw"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  lang === l
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-blue-50 text-text-mid hover:bg-blue-100"
                }`}
              >
                {l === "en" ? "English" : "Kiswahili"}
              </button>
            ))}
          </div>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap gap-4 text-xs text-text-light mb-4">
          <Link href="#" className="hover:text-blue-700">{t("footer.privacy", lang)}</Link>
          <Link href="#" className="hover:text-blue-700">{t("footer.terms", lang)}</Link>
          <Link href="#" className="hover:text-blue-700">{t("footer.faq", lang)}</Link>
          <Link href="#" className="hover:text-blue-700">{t("footer.about", lang)}</Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-50 px-5 py-3 flex items-center justify-between">
        <span className="text-text-light text-[11px]">
          &copy; {new Date().getFullYear()} MiMaji. {t("footer.rights", lang)}
        </span>
        <span className="text-text-light text-[11px]">mimaji.co.ke</span>
      </div>
    </footer>
  );
}
