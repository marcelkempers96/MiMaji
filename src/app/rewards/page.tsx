"use client";

import { logo1, soft5L, soft10L, soft20L } from "@/assets/images";
import { Star, Droplets, Truck, Shield, Gift, Crown, Zap } from "lucide-react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";

const REWARDS_CURRENT = 150;

const tiers = [
  {
    name: "Water Cadet",
    minPoints: 0,
    maxPoints: 249,
    icon: Droplets,
    color: "#8899AA",
    benefits: ["Earn 1 point per KES 10 spent", "Birthday bonus points"],
  },
  {
    name: "Water Ranger",
    minPoints: 250,
    maxPoints: 499,
    icon: Shield,
    color: "#2979C1",
    benefits: ["All Cadet benefits", "10% off every 5th order", "Priority customer support"],
  },
  {
    name: "Water Hero",
    minPoints: 500,
    maxPoints: 999,
    icon: Zap,
    color: "#F5A623",
    benefits: ["All Ranger benefits", "Free 5L jug every month", "Free delivery on all orders", "Early access to new products"],
  },
  {
    name: "Water Warrior",
    minPoints: 1000,
    maxPoints: Infinity,
    icon: Crown,
    color: "#E8544E",
    benefits: ["All Hero benefits", "VIP status", "20% off all orders", "Free 20L jug every month", "Exclusive Warrior merchandise", "Dedicated account manager"],
  },
];

const redeemOptions: { points: number; reward: string; description: string; icon?: typeof Truck; image?: string }[] = [
  { points: 100, reward: "Free Delivery", icon: Truck, description: "No delivery fee on your next order" },
  { points: 250, reward: "10% Discount", icon: Gift, description: "10% off your next order" },
  { points: 500, reward: "Free 5L Jug", description: "One free 5L purified water", image: soft5L.src },
  { points: 750, reward: "Free 10L Jug", description: "One free 10L purified water", image: soft10L.src },
  { points: 1000, reward: "Free 20L Jug", description: "One free 20L purified water", image: soft20L.src },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const currentTier = tiers.find(t => REWARDS_CURRENT >= t.minPoints && REWARDS_CURRENT <= t.maxPoints) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Water Warriors Rewards" showBack={true} />
      </div>

      {/* Mobile Layout */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <RewardsContent currentTier={currentTier} nextTier={nextTier} user={user} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Water Warriors Rewards</h1>
          <p className="text-text-secondary mb-8">Earn points with every order. Rise through the ranks. Get rewarded.</p>
          <RewardsContent currentTier={currentTier} nextTier={nextTier} user={user} />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function RewardsContent({ currentTier, nextTier, user }: { currentTier: typeof tiers[0]; nextTier?: typeof tiers[0]; user: { phone: string; name: string } | null }) {
  const TierIcon = currentTier.icon;

  return (
    <>
      {/* Current Status */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <TierIcon size={32} />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Your Rank</p>
            <p className="text-2xl font-extrabold">{currentTier.name}</p>
            <p className="text-white/80 text-sm">{user?.name || "Guest"}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-xs">Points</span>
          <span className="font-bold text-lg">{REWARDS_CURRENT} pts</span>
        </div>
        {nextTier && (
          <>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${((REWARDS_CURRENT - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs">{nextTier.minPoints - REWARDS_CURRENT} pts to {nextTier.name}</p>
          </>
        )}
      </div>

      {/* How to Earn */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-6">
        <h2 className="font-bold text-base text-text-primary mb-3">How to Earn Points</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Droplets size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Order Water</p>
              <p className="text-xs text-text-secondary">1 point per KES 10 spent</p>
            </div>
            <span className="text-primary font-bold text-sm">+1pt/KES 10</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF5EC] flex items-center justify-center flex-shrink-0">
              <Star size={18} className="text-rating" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Leave a Review</p>
              <p className="text-xs text-text-secondary">Rate your delivery experience</p>
            </div>
            <span className="text-rating font-bold text-sm">+10 pts</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <Gift size={18} className="text-[#2ECC71]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Refer a Friend</p>
              <p className="text-xs text-text-secondary">When they place their first order</p>
            </div>
            <span className="text-[#2ECC71] font-bold text-sm">+50 pts</span>
          </div>
        </div>
      </div>

      {/* Redeem Points */}
      <h2 className="font-bold text-base text-text-primary mb-3">Redeem Points</h2>
      <div className="flex flex-col gap-3 mb-6">
        {redeemOptions.map((option) => {
          const canRedeem = REWARDS_CURRENT >= option.points;
          return (
            <div key={option.points} className={`bg-surface shadow-card rounded-xl p-4 flex items-center gap-3 ${!canRedeem ? "opacity-50" : ""}`}>
              {option.image ? (
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={option.image} alt={option.reward} className="object-contain" />
                </div>
              ) : option.icon ? (
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                  <option.icon size={18} className="text-primary" />
                </div>
              ) : null}
              <div className="flex-1">
                <p className="font-bold text-sm text-text-primary">{option.reward}</p>
                <p className="text-text-secondary text-xs">{option.description}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">{option.points} pts</p>
                {canRedeem && (
                  <button className="text-xs text-primary font-semibold">Redeem</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier System */}
      <h2 className="font-bold text-base text-text-primary mb-3">Warrior Tiers</h2>
      <div className="flex flex-col gap-3 mb-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrent = tier.name === currentTier.name;
          return (
            <div key={tier.name} className={`bg-surface shadow-card rounded-xl p-4 ${isCurrent ? "border-2 border-primary" : ""}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                  <Icon size={20} style={{ color: tier.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-text-primary">{tier.name}</p>
                    {isCurrent && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">You</span>}
                  </div>
                  <p className="text-text-secondary text-xs">
                    {tier.maxPoints === Infinity ? `${tier.minPoints}+ pts` : `${tier.minPoints} - ${tier.maxPoints} pts`}
                  </p>
                </div>
              </div>
              <ul className="space-y-1 ml-13">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="text-text-secondary text-xs flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-text-secondary flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <Link
        href="/buy"
        className="block w-full bg-primary text-white text-center rounded-xl py-4 font-bold text-sm hover:bg-[#1a5a9a] transition-colors"
      >
        Order Now & Earn Points
      </Link>
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
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/rewards" className="text-primary font-medium text-sm">Rewards</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Impact</Link>
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
