"use client";

import { logo1 } from "@/assets/images";
import { Droplets, ChevronRight, Star, Trophy, Package, Truck, CheckCircle2, Clock, FileText } from "lucide-react";
import { useState, useEffect } from "react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchUserOrders, OrderRecord, mapOrderStatus, formatOrderDate, formatOrderId } from "@/lib/orders";

const REWARDS_CURRENT = 150;
const REWARDS_MILESTONES = [
  { points: 100, label: "Free Delivery", reached: true },
  { points: 250, label: "10% Off", reached: false },
  { points: 500, label: "Free 5L Jug", reached: false },
  { points: 1000, label: "VIP Status", reached: false },
];

const statusSteps = [
  { key: "Processing", label: "Processing", icon: Clock },
  { key: "Confirmed", label: "Confirmed", icon: Package },
  { key: "In Transit", label: "Out for Delivery", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status: string) {
  if (status === "Processing") return 0;
  if (status === "Confirmed") return 1;
  if (status === "In Transit") return 2;
  if (status === "Delivered") return 3;
  return 0;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const nextMilestone = REWARDS_MILESTONES.find((m) => !m.reached) || REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1];
  const maxPoints = REWARDS_MILESTONES[REWARDS_MILESTONES.length - 1].points;
  const progressPercent = Math.min((REWARDS_CURRENT / maxPoints) * 100, 100);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders(user.id).then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      });
    }
  }, [user?.id]);

  if (!user) return null;

  const liveOrders = orders.filter((o) => {
    const status = mapOrderStatus(o.status);
    return status !== "Delivered";
  });
  const pastOrders = orders.filter((o) => {
    const status = mapOrderStatus(o.status);
    return status === "Delivered";
  });

  const ordersContent = (
    <>
      {loadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <Droplets size={32} className="text-primary animate-pulse" />
        </div>
      ) : (
        <>
          {/* Live Orders Section */}
          {liveOrders.length > 0 && (
            <div className="mb-5">
              <h2 className="font-bold text-sm text-text-primary mb-3">Active Orders</h2>
              {liveOrders.map((order) => {
                const displayStatus = mapOrderStatus(order.status);
                const currentStep = getStepIndex(displayStatus);
                const displayId = formatOrderId(order.id);
                const displayDate = formatOrderDate(order.created_at);
                const displayName = order.product_name || (order.order_items?.[0]?.name) || "Water Order";

                return (
                  <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-text-primary">{displayDate}</span>
                      <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        {displayId}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Droplets size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">{displayName}</p>
                        <p className="text-text-secondary text-sm">KES {order.price_total.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Mini Progress Steps */}
                    <div className="flex items-center gap-1 mb-4">
                      {statusSteps.slice(0, 3).map((step, i) => {
                        const active = i <= currentStep;
                        const StepIcon = step.icon;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? "bg-primary" : "bg-gray-100"}`}>
                                <StepIcon size={14} className={active ? "text-white" : "text-text-secondary"} />
                              </div>
                              <span className={`text-[9px] mt-1 text-center leading-tight ${active ? "text-primary font-semibold" : "text-text-secondary"}`}>
                                {step.label}
                              </span>
                            </div>
                            {i < 2 && (
                              <div className={`h-0.5 w-full mt-[-12px] ${i < currentStep ? "bg-primary" : "bg-gray-200"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <Link
                      href={`/track?orderId=${order.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
                    >
                      <Truck size={16} />
                      Track Order
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* No orders at all */}
          {orders.length === 0 && (
            <div className="bg-surface shadow-card rounded-xl p-8 text-center mb-5">
              <Droplets size={40} className="text-text-secondary mx-auto mb-3" />
              <p className="text-text-primary font-bold mb-1">No orders yet</p>
              <p className="text-text-secondary text-sm mb-4">Your order history will appear here</p>
              <Link href="/buy" className="text-primary font-semibold text-sm">
                Order Water →
              </Link>
            </div>
          )}

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

          {/* Invoices Link */}
          <Link href="/invoices">
            <div className="bg-surface shadow-card rounded-xl p-4 mb-5 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-text-primary">View Invoices</p>
                <p className="text-text-secondary text-xs">Download invoices for all your orders</p>
              </div>
              <ChevronRight size={18} className="text-text-secondary" />
            </div>
          </Link>

          {/* Order History */}
          {pastOrders.length > 0 && (
            <>
              <h2 className="font-bold text-sm text-text-primary mb-3">Order History</h2>
              {pastOrders.map((order) => {
                const displayId = formatOrderId(order.id);
                const displayDate = formatOrderDate(order.created_at);
                const displayName = order.product_name || (order.order_items?.[0]?.name) || "Water Order";

                return (
                  <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-text-primary">{displayDate}</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-success" />
                        <span className="text-sm font-medium text-success">Delivered</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Droplets size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">{displayName}</p>
                        <p className="text-text-secondary text-xs">
                          {order.mpesa_ref ? `M-Pesa: ${order.mpesa_ref} · ` : ""}
                          Paid KES {order.price_total.toLocaleString()}
                        </p>
                      </div>
                      <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                    </div>
                    <Link
                      href="/invoices"
                      className="flex items-center gap-1 text-primary text-xs font-semibold mt-2 hover:underline"
                    >
                      <FileText size={12} />
                      View Invoice
                    </Link>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
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
        <Link href="/" className="flex items-center">
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
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
