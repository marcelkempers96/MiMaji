"use client";

import { useState } from "react";
import { Check, Star, Truck, Clock, Shield, Gift } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  popular?: boolean;
  deliveries: string;
  benefits: string[];
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "20 Jugs / Month",
    price: 2800,
    deliveries: "4 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water jugs",
      "Weekly delivery schedule",
      "Free delivery on all orders",
      "Basic rewards (1.5x points)",
      "WhatsApp order support",
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    description: "40 Jugs / Month",
    price: 4800,
    popular: true,
    deliveries: "8 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water jugs",
      "Twice-weekly delivery schedule",
      "Free delivery on all orders",
      "Enhanced rewards (2x points)",
      "Priority delivery (under 30 min)",
      "Flexible reschedule anytime",
      "10% off additional orders",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    description: "60 Jugs / Month",
    price: 6500,
    deliveries: "12 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water jugs",
      "3x weekly delivery schedule",
      "Free delivery on all orders",
      "Premium rewards (3x points)",
      "Priority delivery (under 20 min)",
      "Flexible reschedule anytime",
      "15% off additional orders",
      "Free 5L bottles for office/events",
      "Dedicated account manager",
      "Water Warrior status included",
    ],
  },
];

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("standard");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Subscription Plans" showBack={true} />
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <SubscriptionContent selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-text-primary mb-2">Subscription Plans</h1>
            <p className="text-text-secondary max-w-lg mx-auto">
              Save money with a monthly water plan. Free delivery, bonus rewards points, and never run out of water.
            </p>
          </div>
          <SubscriptionContent selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function SubscriptionContent({ selectedPlan, setSelectedPlan, desktop }: { selectedPlan: string; setSelectedPlan: (id: string) => void; desktop?: boolean }) {
  return (
    <>
      {/* Why Subscribe */}
      {!desktop && (
        <>
          <h2 className="text-base font-bold text-text-primary mb-1">Monthly Water Plans</h2>
          <p className="text-text-secondary text-sm mb-4">Never run out of water. Save more with a plan.</p>
        </>
      )}

      {/* Benefits Banner */}
      <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-xl p-4 mb-5 flex items-start gap-3">
        <Gift size={24} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm text-text-primary">Why Subscribe?</p>
          <ul className="text-text-secondary text-xs mt-1 space-y-1">
            <li className="flex items-center gap-1.5"><Truck size={12} /> Free delivery on every order</li>
            <li className="flex items-center gap-1.5"><Star size={12} /> Up to 3x bonus reward points</li>
            <li className="flex items-center gap-1.5"><Clock size={12} /> Priority delivery under 30 min</li>
            <li className="flex items-center gap-1.5"><Shield size={12} /> Cancel or pause anytime</li>
          </ul>
        </div>
      </div>

      {/* Plans */}
      <div className={desktop ? "grid grid-cols-3 gap-6" : "flex flex-col gap-3"}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`bg-surface shadow-card rounded-xl p-5 cursor-pointer transition-all ${
              selectedPlan === plan.id ? "border-2 border-primary" : "border-2 border-transparent"
            } ${desktop ? "flex flex-col" : ""}`}
          >
            <div className={desktop ? "" : "flex items-start justify-between"}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-text-primary text-base">{plan.name}</span>
                  {plan.popular && (
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Most Popular
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm">{plan.description}</p>
                <p className="text-text-secondary text-xs mt-0.5">{plan.deliveries}</p>
              </div>
              {!desktop && (
                <div className="text-right">
                  <span className="font-extrabold text-xl text-text-primary">
                    KES {plan.price.toLocaleString()}
                  </span>
                  <p className="text-text-secondary text-xs">/month</p>
                </div>
              )}
            </div>

            {desktop && (
              <div className="mt-3 mb-4">
                <span className="font-extrabold text-3xl text-text-primary">
                  KES {plan.price.toLocaleString()}
                </span>
                <span className="text-text-secondary text-sm">/month</span>
              </div>
            )}

            {/* Benefits List */}
            <ul className={`mt-3 space-y-2 ${desktop ? "flex-1" : ""}`}>
              {plan.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-xs text-text-secondary">
                  <Check size={14} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            {desktop && (
              <button
                className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  selectedPlan === plan.id
                    ? "bg-primary text-white"
                    : "bg-primary-light text-primary hover:bg-primary hover:text-white"
                }`}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className={desktop ? "max-w-md mx-auto mt-8" : "mt-6"}>
        <Button fullWidth>
          Subscribe Now
        </Button>
        <p className="text-text-secondary text-xs text-center mt-3">
          Cancel or pause anytime. No long-term commitment required.
        </p>
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo1.png" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/subscriptions" className="text-primary font-medium text-sm">Subscriptions</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
