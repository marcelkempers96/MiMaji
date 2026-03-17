"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/lib/LangContext";
import { t } from "@/lib/i18n";
import Button from "./Button";

export default function PromoPopup() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("mimaji-promo-dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("mimaji-promo-dismissed", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto p-6 animate-slide-up" style={{ boxShadow: "0 -8px 40px rgba(26, 58, 92, 0.15)" }}>
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-text-mid hover:bg-blue-100 transition-colors"
        >
          &times;
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">
            {t("promo.title", lang)}
          </h2>
        </div>

        {/* First order offer */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-blue-900 text-sm mb-1">
                {t("promo.first_order", lang)}
              </div>
              <div className="text-xs text-text-mid">
                {lang === "en"
                  ? "No code needed — automatically applied on your first order."
                  : "Hakuna kodi inayohitajika — inatumika moja kwa moja kwenye oda yako ya kwanza."}
              </div>
            </div>
          </div>
        </div>

        {/* Referral program */}
        <div className="bg-blue-700 rounded-2xl p-4 mb-5 text-white">
          <div className="font-bold text-sm mb-2">
            {t("promo.referral_title", lang)}
          </div>
          <div className="text-xs text-blue-200 leading-relaxed">
            {t("promo.referral_desc", lang)}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2">
              <div className="font-bold text-sm">1</div>
              <div className="text-[9px] text-blue-200">
                {lang === "en" ? "friend = 10L" : "rafiki = 10L"}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <div className="font-bold text-sm">5</div>
              <div className="text-[9px] text-blue-200">
                {lang === "en" ? "friends = 60L" : "marafiki = 60L"}
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-2">
              <div className="font-bold text-sm">3</div>
              <div className="text-[9px] text-blue-200">
                {lang === "en" ? "free jugs!" : "mitungi bure!"}
              </div>
            </div>
          </div>
        </div>

        <Button size="lg" onClick={handleDismiss}>
          {t("promo.got_it", lang)}
        </Button>
      </div>
    </div>
  );
}
