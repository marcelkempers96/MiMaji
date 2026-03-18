"use client";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/order/OrderForm";
import HowItWorks from "@/components/order/HowItWorks";
import PromoPopup from "@/components/shared/PromoPopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero — soft gradient */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-5 pt-10 pb-14">
        <h1 className="text-[28px] font-bold text-blue-900 leading-tight mb-2">
          Fresh water,
          <br />
          delivered today.
        </h1>
        <p className="text-text-mid text-sm mb-6">
          20-litre jugs &middot; Nairobi &middot; From KES 360
        </p>

        {/* Hero banner image */}
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(26, 58, 92, 0.1)" }}>
          <Image
            src="/images/hero-banner.png"
            alt="Order water online and track your delivery — 20L water jugs with live delivery tracking"
            width={1400}
            height={800}
            className="w-full h-auto rounded-2xl"
            priority
          />
        </div>
      </section>

      <OrderForm />
      <HowItWorks />

      {/* Impact banner */}
      <section className="mx-4 mb-6 bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-blue-900 text-sm mb-1">
              Every order gives back
            </div>
            <div className="text-xs text-text-mid leading-relaxed">
              For every 100 litres ordered, we supply 10% (10 litres) to communities
              across Kenya facing water scarcity.{" "}
              <a href="/impact" className="text-blue-700 font-semibold">
                Learn more &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <PromoPopup />
    </div>
  );
}
