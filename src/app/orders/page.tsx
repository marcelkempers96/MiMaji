"use client";

import { Droplets, ChevronRight, Star, Trophy } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { mockOrders } from "@/data/orders";

const REWARDS_CURRENT = 150;
const REWARDS_MILESTONES = [
  { points: 100, label: "Free Delivery", reached: true },
  { points: 250, label: "10% Off", reached: false },
  { points: 500, label: "Free 5L Jug", reached: false },
  { points: 1000, label: "VIP Status", reached: false },
];

export default function OrdersPage() {
  const nextMilestone = REWARDS_MILESTONES.find((m) => !m.reached) || REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1];
  const maxPoints = REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1].points;
  const progressPercent = Math.min((REWARDS_CURRENT / maxPoints) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="My Orders" />

      <div className="max-w-md mx-auto px-4 pt-4">
        {/* Rewards Milestones */}
        <div className="bg-surface shadow-card rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-rating" />
            <span className="font-bold text-sm text-text-primary">Rewards Milestones</span>
            <span className="ml-auto text-xs font-bold text-primary">{REWARDS_CURRENT} pts</span>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-2">
            <div className="h-3 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rating to-[#F5C623] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Milestone markers */}
            <div className="absolute inset-0 flex items-center">
              {REWARDS_MILESTONES.map((m) => (
                <div
                  key={m.points}
                  className="absolute"
                  style={{ left: `${(m.points / maxPoints) * 100}%`, transform: "translateX(-50%)" }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      m.reached
                        ? "bg-rating border-rating"
                        : REWARDS_CURRENT >= m.points
                        ? "bg-rating border-rating"
                        : "bg-white border-[#E0E0E0]"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Milestone labels */}
          <div className="relative h-10 mt-1">
            {REWARDS_MILESTONES.map((m) => (
              <div
                key={m.points}
                className="absolute text-center"
                style={{ left: `${(m.points / maxPoints) * 100}%`, transform: "translateX(-50%)", width: "60px" }}
              >
                <p className={`text-[10px] font-semibold ${m.reached || REWARDS_CURRENT >= m.points ? "text-rating" : "text-text-secondary"}`}>
                  {m.points}
                </p>
                <p className="text-[9px] text-text-secondary leading-tight">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Trophy size={14} className="text-rating" />
            <p className="text-xs text-text-secondary">
              Next: <span className="font-semibold text-text-primary">{nextMilestone.label}</span> at {nextMilestone.points} pts
            </p>
          </div>
        </div>

        {/* Order History Header */}
        <h2 className="font-bold text-sm text-text-primary mb-3">Order History</h2>

        {/* Orders List */}
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-surface shadow-card rounded-xl p-4 mb-3"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-text-primary">{order.date}</span>
              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full inline-block ${
                  order.status === "Delivered" ? "bg-success" :
                  order.status === "In Transit" ? "bg-primary" : "bg-rating"
                }`} />
                <span className={`text-sm font-medium ${
                  order.status === "Delivered" ? "text-success" :
                  order.status === "In Transit" ? "text-primary" : "text-rating"
                }`}>{order.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-text-primary">{order.productName}</p>
                <p className="text-text-secondary text-sm">
                  KES {order.originalPrice.toLocaleString()}
                </p>
              </div>
              <span className="font-bold text-text-primary">
                KES {order.amountPaid.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end mt-3">
              <Link href="/track" className="flex items-center gap-1 text-primary text-sm font-medium">
                View Details
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
