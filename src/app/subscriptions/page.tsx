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
    id: "everyday",
    name: "Everyday Plan",
    description: "2–20 Jugs / Month",
    price: 560,
    pricePerJug: 280,
    deliveries: "Flexible — choose 2 to 20 jugs per month",
    benefits: [
      "20L purified water (hard or soft)",
      "Choose your own quantity (2-20 jugs)",
      "Choose refill (exchange) or new bottles",
      "KES 280/jug refill — save vs one-off (KES 300)",
      "Free delivery on all orders",
      "Flexible delivery schedule",
      "Cancel or pause anytime",
      "WhatsApp order support",
    ],
  },
  {
    id: "basic",
    name: "Basic Plan",
    description: "20 Jugs / Month",
    price: 5200,
    pricePerJug: 260,
    deliveries: "4 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water (hard or soft)",
      "Refill (exchange) or new bottles",
      "KES 260/jug — save KES 40 per jug",
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
    price: 9600,
    pricePerJug: 240,
    popular: true,
    deliveries: "8 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water (hard or soft)",
      "Refill (exchange) or new bottles",
      "KES 240/jug — save KES 60 per jug",
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
    price: 13200,
    pricePerJug: 220,
    deliveries: "12 deliveries/month (5 jugs each)",
    benefits: [
      "20L purified water (hard or soft)",
      "Refill (exchange) or new bottles",
      "KES 220/jug — best price, save KES 80 per jug",
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
  const [jugsCount, setJugsCount] = useState(4);
  const [subscribed, setSubscribed] = useState(false);
  const [activeSub, setActiveSub] = useState<{ planName: string; jugs?: number } | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  // Check for active subscription
  useState(() => {
    try {
      const raw = localStorage.getItem("mimaji_subscription");
      if (raw) {
        const sub = JSON.parse(raw);
        if (sub && user && sub.userId === user?.id) {
          setActiveSub({ planName: sub.planName, jugs: sub.jugsPerMonth });
          setSubscribed(true);
        }
      }
    } catch {}
  });

  // Water preference for subscriptions
  const [waterType, setWaterType] = useState<"soft" | "hard">("soft");
  const [bottleType, setBottleType] = useState<"refill" | "new">("refill");

  const handleSubscribe = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    const isEveryday = selectedPlan === "everyday";
    const displayTotal = isEveryday ? jugsCount * plan.pricePerJug : plan.price;
    const planDesc = isEveryday
      ? `Everyday Plan (${jugsCount} jugs/month at KES ${plan.pricePerJug}/jug = KES ${displayTotal}/month)`
      : `${plan.name} — ${plan.description} at KES ${plan.price.toLocaleString()}/month`;

    const msg = encodeURIComponent(
      `Hi MiMaji! I'd like to subscribe to the ${planDesc}.\n\n` +
      `Water type: ${waterType === "hard" ? "Hard Jug" : "Soft Bottle"}\n` +
      `Bottle option: ${bottleType === "new" ? "New bottles" : "Refill (exchange)"}\n\n` +
      (user ? `Name: ${user.name}\nPhone: ${user.phone}\n\n` : "") +
      `Please activate my subscription.`
    );
    window.open(`https://wa.me/254758434076?text=${msg}`, "_blank");
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
          const isEveryday = plan.id === "everyday";
          const displayPrice = isEveryday ? jugsCount * (plans.find(p => p.id === "everyday")?.pricePerJug || 280) : plan.price;
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
                  {isEveryday && (
                    <span className="bg-[#2ECC71] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      For Everyone
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-sm">{plan.description}</p>
                <p className="text-text-secondary text-xs mt-0.5">{plan.deliveries}</p>
              </div>
              {!desktop && (
                <div className="text-right">
                  <span className="font-extrabold text-xl text-text-primary">
                    KES {displayPrice.toLocaleString()}
                  </span>
                  <p className="text-text-secondary text-xs">/month</p>
                  {isEveryday && <p className="text-[#2ECC71] text-[10px] font-semibold">KES 280/jug</p>}
                </div>
              )}
            </div>

            {desktop && (
              <div className="mt-3 mb-4">
                <span className="font-extrabold text-2xl text-text-primary">
                  KES {displayPrice.toLocaleString()}
                </span>
                <span className="text-text-secondary text-sm">/month</span>
                {isEveryday && <p className="text-[#2ECC71] text-xs font-semibold mt-0.5">KES 280/jug</p>}
              </div>
            )}

            {/* Everyday Plan Jug Selector */}
            {isEveryday && selectedPlan === "everyday" && (
              <div className="mt-3 mb-2 bg-primary-light rounded-lg p-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-primary">Jugs per month</span>
                  <span className="text-sm font-bold text-primary">{jugsCount} jugs</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={jugsCount}
                  onChange={(e) => setJugsCount(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-text-secondary mt-1">
                  <span>2</span>
                  <span>10</span>
                  <span>20</span>
                </div>
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

      <div className={desktop ? "max-w-md mx-auto mt-8" : "mt-6"}>
        <button
          onClick={onSubscribe}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl py-3.5 font-bold text-sm transition-colors"
        >
          <MessageCircle size={18} />
          Subscribe via WhatsApp — KES {(selectedPlan === "everyday" ? jugsCount * (plans.find(p => p.id === "everyday")?.pricePerJug || 280) : plans.find((p) => p.id === selectedPlan)?.price || 0).toLocaleString()}/mo
        </button>
        <p className="text-text-secondary text-xs text-center mt-3">
          Message us on WhatsApp to activate your subscription. We&apos;ll set it up and confirm within minutes. Cancel or pause anytime.
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

