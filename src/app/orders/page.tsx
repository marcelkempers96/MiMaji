"use client";

import { logo1 } from "@/assets/images";
import { Droplets, ChevronRight, Gift, Package, Truck, CheckCircle2, Clock, FileText, Smartphone, Banknote } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchUserOrders, OrderRecord, mapOrderStatus, formatOrderDate, formatOrderId } from "@/lib/orders";
import { getRewardsSummary, initRewards } from "@/lib/rewards";

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

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [freeLitres, setFreeLitres] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [user, authLoading, router]);

  const loadOrders = useCallback(() => {
    if (user?.id) {
      setLoadingOrders(true);
      fetchUserOrders(user.id).then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      });
      initRewards(user.id);
      setFreeLitres(getRewardsSummary(user.id).freeLitres);
    }
  }, [user?.id]);

  // Fetch orders on mount and when user changes
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Re-fetch when page becomes visible (e.g. navigating back from confirm page)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") loadOrders();
    };
    const handleFocus = () => loadOrders();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadOrders]);

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
                const itemsList = order.order_items && order.order_items.length > 0
                  ? order.order_items
                  : order.product_name
                    ? [{ name: order.product_name, quantity: order.quantity || 1, price: order.price_total }]
                    : [{ name: "Water Order", quantity: 1, price: order.price_total }];

                return (
                  <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-text-primary">{displayDate}</span>
                      <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        {displayId}
                      </span>
                    </div>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Droplets size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        {itemsList.map((item, idx) => (
                          <p key={idx} className="text-sm text-text-primary">
                            <span className="font-bold">{item.quantity}x</span> {item.name}
                          </p>
                        ))}
                        <p className="text-text-secondary text-sm mt-1">KES {order.price_total.toLocaleString()}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {order.payment_method === "cash" ? (
                            <Banknote size={12} className="text-text-secondary" />
                          ) : (
                            <Smartphone size={12} className="text-text-secondary" />
                          )}
                          <span className="text-text-secondary text-xs">
                            {order.payment_method === "stk-push" ? "M-PESA STK Push" :
                             order.payment_method === "mpesa-app" ? "M-PESA App" :
                             order.payment_method === "cash" ? "Cash on Delivery" :
                             "M-PESA"}
                            {order.mpesa_ref ? ` · ${order.mpesa_ref}` : ""}
                          </span>
                        </div>
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

          {/* Free Water Balance */}
          <Link href="/rewards">
            <div className="bg-surface shadow-card rounded-xl p-4 mb-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={18} className="text-[#2ECC71]" />
                <span className="font-bold text-sm text-text-primary">Rewards & Referrals</span>
                <span className="ml-auto text-xs font-bold text-[#2ECC71]">{freeLitres}L free</span>
              </div>
              <p className="text-text-secondary text-xs mb-2">
                Refer friends and both earn 5L free water. Share your code on the rewards page!
              </p>
              <span className="text-primary text-xs font-semibold">View Rewards →</span>
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
                const itemsList = order.order_items && order.order_items.length > 0
                  ? order.order_items
                  : order.product_name
                    ? [{ name: order.product_name, quantity: order.quantity || 1, price: order.price_total }]
                    : [{ name: "Water Order", quantity: 1, price: order.price_total }];

                return (
                  <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-text-primary">{displayDate}</span>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-success" />
                        <span className="text-sm font-medium text-success">Delivered</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Droplets size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        {itemsList.map((item, idx) => (
                          <p key={idx} className="text-sm text-text-primary">
                            <span className="font-bold">{item.quantity}x</span> {item.name}
                          </p>
                        ))}
                        <p className="text-text-secondary text-xs mt-1">
                          Paid KES {order.price_total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {order.payment_method === "cash" ? (
                            <Banknote size={11} className="text-text-secondary" />
                          ) : (
                            <Smartphone size={11} className="text-text-secondary" />
                          )}
                          <span className="text-text-secondary text-[11px]">
                            {order.payment_method === "stk-push" ? "M-PESA STK Push" :
                             order.payment_method === "mpesa-app" ? "M-PESA App" :
                             order.payment_method === "cash" ? "Cash on Delivery" :
                             "M-PESA"}
                            {order.mpesa_ref ? ` · ${order.mpesa_ref}` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                    </div>
                    <Link
                      href={`/invoices?orderId=${order.id}`}
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

