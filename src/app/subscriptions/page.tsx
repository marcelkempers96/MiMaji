"use client";

import { logo1 } from "@/assets/images";
import { useState } from "react";
import { Check, Star, Truck, Clock, Shield, Gift } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { MessageCircle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerJug: number;
  popular?: boolean;
  deliveries: string;
  benefits: string[];
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Individuals & Couples",
    price: 500,
    pricePerJug: 250,
    deliveries: "2x 20L/month (or 2x 18.9L for KES 430)",
    benefits: [
      "2x 20L purified water per month",
      "Or 2x 18.9L for KES 430/mo (save 37%)",
      "Choose hard or soft bottles",
      "Free delivery on all orders",
      "M-Pesa auto-pay",
      "Pause or cancel anytime",
      "Save 34% vs one-off orders",
    ],
  },
  {
    id: "family",
    name: "Family",
    description: "3–6 People",
    price: 900,
    pricePerJug: 225,
    popular: true,
    deliveries: "4x 20L/month (or 4x 18.9L for KES 800)",
    benefits: [
      "4x 20L purified water per month",
      "Or 4x 18.9L for KES 800/mo (save 41%)",
      "Choose hard or soft bottles",
      "Free delivery on all orders",
      "M-Pesa auto-pay",
      "Pause or cancel anytime",
      "Save 41% vs one-off orders",
      "Priority delivery",
    ],
  },
  {
    id: "family-plus",
    name: "Family+",
    description: "Large Households",
    price: 1600,
    pricePerJug: 200,
    deliveries: "8x 20L/month (or 8x 18.9L for KES 1,450)",
    benefits: [
      "8x 20L purified water per month",
      "Or 8x 18.9L for KES 1,450/mo (save 47%)",
      "Choose hard or soft bottles",
      "Free delivery on all orders",
      "M-Pesa auto-pay",
      "Pause or cancel anytime",
      "Save 47% vs one-off orders",
      "Priority delivery",
      "Flexible reschedule anytime",
    ],
  },
  {
    id: "office",
    name: "Office",
    description: "Businesses",
    price: 2200,
    pricePerJug: 183,
    deliveries: "12x 20L/month (or 20x for KES 3,400)",
    benefits: [
      "12x 20L purified water per month",
      "Or scale to 20x 20L for KES 3,400/mo (save 55%)",
      "Choose hard or soft bottles",
      "Free delivery on all orders",
      "M-Pesa auto-pay",
      "Pause or cancel anytime",
      "Save 52% vs one-off orders",
      "Priority delivery (under 30 min)",
      "Monthly invoicing available",
      "Dedicated account manager",
    ],
  },
];

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("family");
  const [jugsCount, setJugsCount] = useState(4);
  const [subscribed, setSubscribed] = useState(false);
  const [activeSub, setActiveSub] = useState<{ planName: string; jugs?: number } | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("mimaji_subscription");
        if (raw) {
          const sub = JSON.parse(raw);
          // We can't check user here (not yet available), will re-check in effect
          if (sub) return { planName: sub.planName, jugs: sub.jugsPerMonth };
        }
      }
    } catch {}
    return null;
  });
  const router = useRouter();
  const { user } = useAuth();

  // Water preference for subscriptions
  const [waterType, setWaterType] = useState<"soft" | "hard">("soft");
  const [bottleType, setBottleType] = useState<"refill" | "new">("refill");

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    const isCustom = selectedPlan === "custom";
    const displayTotal = isCustom ? jugsCount * 280 : plan.price;
    const planDesc = isCustom
      ? `Custom Plan (${jugsCount} x 20L jugs/month = KES ${displayTotal}/month)`
      : `${plan.name} Plan — ${plan.description} at KES ${plan.price.toLocaleString()}/month`;

    const msg = encodeURIComponent(
      `Hi MiMaji! I'd like to subscribe to the ${planDesc}.\n\n` +
      `Water type: ${waterType === "hard" ? "Hard Jug" : "Soft Bottle"}\n` +
      `Bottle option: ${bottleType === "new" ? "New bottles" : "Refill (exchange)"}\n\n` +
      (user ? `Name: ${user.name}\nPhone: ${user.phone}\n\n` : "") +
      `Please activate my subscription.`
    );
    window.open(`https://wa.me/254704476338?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Subscription Plans" showBack={true} />
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <SubscriptionContent selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} onSubscribe={handleSubscribe} subscribed={subscribed} jugsCount={jugsCount} setJugsCount={setJugsCount} activeSub={activeSub} waterType={waterType} setWaterType={setWaterType} bottleType={bottleType} setBottleType={setBottleType} />
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
          <SubscriptionContent selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} onSubscribe={handleSubscribe} subscribed={subscribed} desktop jugsCount={jugsCount} setJugsCount={setJugsCount} activeSub={activeSub} waterType={waterType} setWaterType={setWaterType} bottleType={bottleType} setBottleType={setBottleType} />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function SubscriptionContent({ selectedPlan, setSelectedPlan, onSubscribe, subscribed, desktop, jugsCount, setJugsCount, activeSub, waterType, setWaterType, bottleType, setBottleType }: { selectedPlan: string; setSelectedPlan: (id: string) => void; onSubscribe: () => void; subscribed: boolean; desktop?: boolean; jugsCount: number; setJugsCount: (n: number) => void; activeSub: { planName: string; jugs?: number } | null; waterType: "soft" | "hard"; setWaterType: (t: "soft" | "hard") => void; bottleType: "refill" | "new"; setBottleType: (t: "refill" | "new") => void }) {
  return (
    <>
      {/* Why Subscribe */}
      {!desktop && (
        <>
          <h2 className="text-base font-bold text-text-primary mb-1">Monthly Water Plans</h2>
          <p className="text-text-secondary text-sm mb-4">Never run out of water. Save more with a plan.</p>
        </>
      )}

      {/* Water Preference Selectors */}
      <div className={`mb-5 ${desktop ? "grid grid-cols-2 gap-4" : "space-y-3"}`}>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Water Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setWaterType("soft")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                waterType === "soft" ? "border-primary bg-primary-light text-primary" : "border-gray-200 bg-white text-text-primary"
              }`}
            >
              Soft Bottle
            </button>
            <button
              onClick={() => setWaterType("hard")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                waterType === "hard" ? "border-primary bg-primary-light text-primary" : "border-gray-200 bg-white text-text-primary"
              }`}
            >
              Hard Jug
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Bottle Option</p>
          <div className="flex gap-2">
            <button
              onClick={() => setBottleType("refill")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                bottleType === "refill" ? "border-[#2ECC71] bg-[#E8F5E9] text-[#2ECC71]" : "border-gray-200 bg-white text-text-primary"
              }`}
            >
              Refill (Exchange)
            </button>
            <button
              onClick={() => setBottleType("new")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-center transition-all border-2 ${
                bottleType === "new" ? "border-primary bg-primary-light text-primary" : "border-gray-200 bg-white text-text-primary"
              }`}
            >
              New Bottles
            </button>
          </div>
        </div>
      </div>

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

      {/* Active Subscription Banner */}
      {activeSub && (
        <div className="bg-[#E8F5E9] border border-[#2ECC71]/30 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Check size={18} className="text-[#2ECC71]" />
            <p className="font-bold text-text-primary text-sm">Active Subscription</p>
          </div>
          <p className="text-text-secondary text-xs">
            You are currently on the <span className="font-semibold text-text-primary">{activeSub.planName}</span>
            {activeSub.jugs ? ` (${activeSub.jugs} jugs/month)` : ""}. Contact us via WhatsApp to make changes.
          </p>
        </div>
      )}

      {/* Plans */}
      <div className={desktop ? "grid grid-cols-2 lg:grid-cols-4 gap-5" : "flex flex-col gap-3"}>
        {plans.map((plan) => {
          const displayPrice = plan.price;
          return (
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
                <div className="text-right flex-shrink-0">
                  <span className="font-extrabold text-xl text-text-primary">
                    KES {displayPrice.toLocaleString()}
                  </span>
                  <p className="text-text-secondary text-xs">/month</p>
                </div>
              )}
            </div>

            {desktop && (
              <div className="mt-3 mb-4">
                <span className="font-extrabold text-2xl text-text-primary">
                  KES {displayPrice.toLocaleString()}
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
        );
        })}
      </div>

      {/* Custom Plan with Slider */}
      <div className="mt-5">
        <div
          onClick={() => setSelectedPlan("custom")}
          className={`bg-surface shadow-card rounded-xl p-5 cursor-pointer transition-all ${
            selectedPlan === "custom" ? "border-2 border-[#2ECC71]" : "border-2 border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-text-primary text-base">Custom Plan</span>
            <span className="bg-[#2ECC71] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">Flexible</span>
          </div>
          <p className="text-text-secondary text-sm">Choose exactly how many bottles you need per month.</p>

          <div className="mt-3 bg-primary-light rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-primary">20L Jugs per month</span>
              <span className="text-sm font-bold text-primary">{jugsCount} jugs — KES {(jugsCount * 280).toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              value={jugsCount}
              onChange={(e) => { setJugsCount(parseInt(e.target.value)); setSelectedPlan("custom"); }}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-text-secondary mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {["Choose any quantity (1-25 jugs/month)", "Free delivery on all orders", "M-Pesa auto-pay", "Pause or cancel anytime", "KES 280 per 20L jug refill"].map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs text-text-secondary">
                <Check size={14} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Estate & Tank Subscriptions */}
      <div className="mt-5 bg-gradient-to-r from-[#FFF5EC] to-[#FFE8D4] rounded-xl p-5">
        <h3 className="font-bold text-text-primary text-base mb-1">Estate & Tank Subscriptions</h3>
        <p className="text-text-secondary text-sm mb-3">For large volumes — estates, compounds, and commercial properties.</p>
        <div className={`${desktop ? "grid grid-cols-4" : "grid grid-cols-2"} gap-3 mb-4`}>
          {[
            { vol: "1,000L", price: "KES 3,000", rate: "KES 3.0/L" },
            { vol: "2,000L", price: "KES 3,500", rate: "KES 1.75/L" },
            { vol: "5,000L", price: "KES 7,500", rate: "KES 1.50/L" },
            { vol: "10,000L", price: "KES 12,000", rate: "KES 1.20/L" },
          ].map((t) => (
            <div key={t.vol} className="bg-white/70 rounded-lg p-3 text-center">
              <p className="font-extrabold text-text-primary">{t.vol}</p>
              <p className="font-bold text-primary text-sm">{t.price}</p>
              <p className="text-[#2ECC71] text-[10px] font-semibold">{t.rate}</p>
            </div>
          ))}
        </div>
        <a
          href="https://wa.me/254704476338"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#F5A623] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#e09520] transition-colors"
        >
          <MessageCircle size={16} />
          Enquire via WhatsApp
        </a>
      </div>

      <div className={desktop ? "max-w-md mx-auto mt-8" : "mt-6"}>
        <button
          onClick={onSubscribe}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl py-3.5 font-bold text-sm transition-colors"
        >
          <MessageCircle size={18} />
          Subscribe via WhatsApp — KES {(selectedPlan === "custom" ? jugsCount * 280 : plans.find((p) => p.id === selectedPlan)?.price || 0).toLocaleString()}/mo
        </button>
        <p className="text-text-secondary text-xs text-center mt-3">
          All subscriptions include free delivery, M-Pesa auto-pay, and you can pause or cancel anytime.
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
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
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

