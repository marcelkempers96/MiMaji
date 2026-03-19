"use client";

import { Droplets, ChevronRight, Star, Trophy } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { mockOrders } from "@/data/orders";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const REWARDS_CURRENT = 150;
const REWARDS_MILESTONES = [
  { points: 100, label: "Free Delivery", reached: true },
  { points: 250, label: "10% Off", reached: false },
  { points: 500, label: "Free 5L Jug", reached: false },
  { points: 1000, label: "VIP Status", reached: false },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const nextMilestone = REWARDS_MILESTONES.find((m) => !m.reached) || REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1];
  const maxPoints = REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1].points;
  const progressPercent = Math.min((REWARDS_CURRENT / maxPoints) * 100, 100);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, router]);

  if (!user) return null;

  const ordersContent = (
    <>
      {/* Rewards Milestones */}
      <Link href="/rewards">
        <div className="bg-surface shadow-card rounded-xl p-4 mb-5 hover:shadow-card-hover transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-rating" />
            <span className="font-bold text-sm text-text-primary">Water Warriors Rewards</span>
            <span className="ml-auto text-xs font-bold text-primary">{REWARDS_CURRENT} pts</span>
          </div>

          <div className="relative mb-2">
            <div className="h-3 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rating to-[#F5C623] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center">
              {REWARDS_MILESTONES.map((m) => (
                <div key={m.points} className="absolute" style={{ left: `${(m.points / maxPoints) * 100}%`, transform: "translateX(-50%)" }}>
                  <div className={`w-4 h-4 rounded-full border-2 ${m.reached || REWARDS_CURRENT >= m.points ? "bg-rating border-rating" : "bg-white border-[#E0E0E0]"}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-10 mt-1">
            {REWARDS_MILESTONES.map((m) => (
              <div key={m.points} className="absolute text-center" style={{ left: `${(m.points / maxPoints) * 100}%`, transform: "translateX(-50%)", width: "60px" }}>
                <p className={`text-[10px] font-semibold ${m.reached || REWARDS_CURRENT >= m.points ? "text-rating" : "text-text-secondary"}`}>{m.points}</p>
                <p className="text-[9px] text-text-secondary leading-tight">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Trophy size={14} className="text-rating" />
            <p className="text-xs text-text-secondary">
              Next: <span className="font-semibold text-text-primary">{nextMilestone.label}</span> at {nextMilestone.points} pts
            </p>
            <span className="ml-auto text-primary text-xs font-semibold">View All →</span>
          </div>
        </div>
      </Link>

      {/* Order History Header */}
      <h2 className="font-bold text-sm text-text-primary mb-3">Order History</h2>

      {/* Orders List */}
      {mockOrders.map((order) => (
        <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-text-primary">{order.date}</span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full inline-block ${order.status === "Delivered" ? "bg-success" : order.status === "In Transit" ? "bg-primary" : "bg-rating"}`} />
              <span className={`text-sm font-medium ${order.status === "Delivered" ? "text-success" : order.status === "In Transit" ? "text-primary" : "text-rating"}`}>{order.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">{order.productName}</p>
              <p className="text-text-secondary text-sm">KES {order.originalPrice.toLocaleString()}</p>
            </div>
            <span className="font-bold text-text-primary">KES {order.amountPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-end mt-3">
            <Link href="/track" className="flex items-center gap-1 text-primary text-sm font-medium">
              View Details
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="My Orders" />
        <div className="max-w-md mx-auto px-4 pt-4">
          {ordersContent}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">My Orders</h1>
          {ordersContent}
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Droplets size={28} className="text-primary" />
          <span className="text-2xl font-bold text-primary">MiMaji</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-primary font-medium text-sm">My Orders</Link>
          <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
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
