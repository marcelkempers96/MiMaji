"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    jugs: 2,
    frequency: "Weekly",
    price: 760,
    originalPrice: 840,
    savings: 80,
    features: [
      "2 x 20L jugs per week",
      "Free delivery",
      "SMS delivery alerts",
      "Cancel anytime",
    ],
    popular: false,
  },
  {
    name: "Family",
    jugs: 4,
    frequency: "Weekly",
    price: 1440,
    originalPrice: 1680,
    savings: 240,
    features: [
      "4 x 20L jugs per week",
      "Free delivery",
      "Priority delivery slots",
      "SMS & WhatsApp alerts",
      "5% loyalty discount after 3 months",
      "Cancel anytime",
    ],
    popular: true,
  },
  {
    name: "Office",
    jugs: 8,
    frequency: "Weekly",
    price: 2720,
    originalPrice: 3360,
    savings: 640,
    features: [
      "8 x 20L jugs per week",
      "Free delivery",
      "Scheduled delivery window",
      "Dedicated account manager",
      "10% loyalty discount after 3 months",
      "Invoice & receipt support",
      "Cancel anytime",
    ],
    popular: false,
  },
];

export default function SubscriptionsPage() {
  const { user, isLoading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("weekly");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="text-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Water Subscription Plans</h1>
          <p className="text-text-mid text-sm lg:text-base mb-6">
            Save money with automatic weekly or monthly deliveries. Never run out of water again.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex bg-white rounded-full p-1" style={{ boxShadow: "var(--shadow-soft)" }}>
            <button
              onClick={() => setBillingCycle("weekly")}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                billingCycle === "weekly" ? "bg-blue-700 text-white" : "text-text-mid"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                billingCycle === "monthly" ? "bg-blue-700 text-white" : "text-text-mid"
              }`}
            >
              Monthly (Save 10%)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const displayPrice = billingCycle === "monthly" ? Math.round(plan.price * 4 * 0.9) : plan.price;
            const displayOriginal = billingCycle === "monthly" ? plan.originalPrice * 4 : plan.originalPrice;
            const displaySavings = displayOriginal - displayPrice;

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-6 relative ${plan.popular ? "ring-2 ring-blue-700" : ""}`}
                style={{ boxShadow: plan.popular ? "var(--shadow-elevated)" : "var(--shadow-card)" }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-bold text-blue-900 text-lg">{plan.name}</h3>
                  <div className="text-xs text-text-mid">{plan.jugs} jugs &middot; {plan.frequency}</div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-900">
                    KES {displayPrice.toLocaleString()}
                  </div>
                  <div className="text-xs text-text-light line-through">
                    KES {displayOriginal.toLocaleString()}
                  </div>
                  <div className="text-xs text-success font-semibold mt-1">
                    Save KES {displaySavings.toLocaleString()}/{billingCycle === "monthly" ? "month" : "week"}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-text-mid">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>

                {user ? (
                  <Button
                    size="lg"
                    variant={plan.popular ? "primary" : "outline"}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    {selectedPlan === plan.name ? "Selected!" : "Subscribe"}
                  </Button>
                ) : (
                  <Link href="/login" onClick={() => localStorage.setItem("mimaji-redirect", "/subscriptions")}>
                    <Button size="lg" variant={plan.popular ? "primary" : "outline"}>
                      Sign In to Subscribe
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-bold text-blue-900 text-lg mb-4 text-center">Why Subscribe?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Save Money", desc: "Up to 19% off regular prices with subscription discounts" },
              { title: "Never Run Out", desc: "Automatic deliveries on your preferred schedule" },
              { title: "Priority Delivery", desc: "Subscribers get first pick of delivery time slots" },
              { title: "Flexible Plans", desc: "Pause, skip, or cancel anytime — no contracts" },
            ].map((benefit) => (
              <div key={benefit.title} className="text-center p-4">
                <div className="font-semibold text-blue-900 text-sm mb-1">{benefit.title}</div>
                <div className="text-xs text-text-mid">{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Impact */}
        <div className="mt-6 bg-blue-50 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-blue-900 mb-2">Subscribers make the biggest impact</h3>
          <p className="text-text-mid text-sm">
            For every 100 litres delivered through subscriptions, we supply 10 litres (10%) to communities in rural Kenya.
            Your subscription helps us plan and deliver more water to those who need it most.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
