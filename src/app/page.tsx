"use client";

import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderForm from "@/components/order/OrderForm";
import HowItWorks from "@/components/order/HowItWorks";
import PromoPopup from "@/components/shared/PromoPopup";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero — block color */}
      <section className="bg-blue-900 px-5 pt-8 pb-12">
        <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
          Fresh water,
          <br />
          delivered today.
        </h1>
        <p className="text-blue-200 text-sm mb-6">
          20-litre jugs · Nairobi · From KES 360
        </p>

        {/* Hero banner image */}
        <div className="relative w-full rounded-xl overflow-hidden">
          <Image
            src="/images/hero-banner.png"
            alt="Order water online and track your delivery — 20L water jugs with live delivery tracking"
            width={1400}
            height={800}
            className="w-full h-auto rounded-xl"
            priority
          />
        </div>
      </section>

      <OrderForm />
      <HowItWorks />

      {/* Impact banner */}
      <section className="mx-4 mb-6 bg-blue-50 rounded-2xl p-5 border border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <div className="font-bold text-blue-900 text-sm mb-1">
              Every order gives back
            </div>
            <div className="text-xs text-text-mid leading-relaxed">
              For every 100 litres ordered, we supply 10% (10 litres) to communities
              across Kenya facing water scarcity.{" "}
              <a href="/impact" className="text-blue-500 font-semibold">
                Learn more →
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
