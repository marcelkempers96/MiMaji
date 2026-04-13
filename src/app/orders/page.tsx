"use client";

import { logo1 } from "@/assets/images";
import { Droplets, ChevronRight, Gift, Package, Truck, CheckCircle2, Clock, FileText, Smartphone, Banknote, XCircle, KeyRound, Copy, Calendar, RefreshCw, MessageCircle } from "lucide-react";
import { getProductImage, products } from "@/data/products";
import { useState, useEffect, useCallback } from "react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { fetchUserOrders, OrderRecord, mapOrderStatus, formatOrderDate, formatOrderDateTime, formatOrderId, generateDeliveryCode, updateOrderStatus } from "@/lib/orders";
import { getRewardsSummaryAsync } from "@/lib/rewards";
import { buildWhatsAppOrderLink, OWNER_WHATSAPP_NUMBER } from "@/lib/whatsappShare";

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
  const { user, session, loading: authLoading } = useAuth();
  const { addItem, clearCart } = useCart();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [freeLitres, setFreeLitres] = useState(0);

  // Delay redirect slightly to give auth a chance to fully restore from cache/Supabase.
  // Without this, a brief user=null during auth initialization triggers an unwanted redirect.
  useEffect(() => {
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        if (!user) router.push("/login?redirect=/orders");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  const loadOrders = useCallback(() => {
    if (user?.id) {
      setLoadingOrders(true);
      setOrdersError(null);
      fetchUserOrders(user.id)
        .then((data) => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error("Failed to load orders:", err);
          setLoadingOrders(false);
          setOrdersError("Failed to load orders. Pull down to retry.");
        });
      getRewardsSummaryAsync(user.id)
        .then((s) => setFreeLitres(s.freeLitres))
        .catch(() => {});
    }
  }, [user?.id, session]); // Re-fetch when Supabase session arrives (fixes empty orders on refresh)

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

  // MPESA code entry for orders without mpesa_ref
  const [mpesaCodeInputs, setMpesaCodeInputs] = useState<Record<string, string>>({});
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);

  const handleSubmitMpesaCode = async (orderId: string) => {
    const code = mpesaCodeInputs[orderId]?.trim().toUpperCase();
    if (!code || code.length < 5) return;
    setSubmittingCode(orderId);
    await updateOrderStatus(orderId, "paid", code);
    // Auto-assign order to the best matching vendor
    const { assignOrderToVendor } = await import("@/lib/vendor");
    await assignOrderToVendor(orderId);
    loadOrders();
    setSubmittingCode(null);
    setMpesaCodeInputs((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
  };

  const buildOrderWhatsAppLink = (order: OrderRecord) => {
    const items =
      order.order_items && order.order_items.length > 0
        ? order.order_items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          }))
        : [
            {
              name: order.product_name || "Water Order",
              quantity: order.quantity || 1,
              price: order.price_total,
            },
          ];

    return buildWhatsAppOrderLink({
      orderId: order.id,
      customerName: order.customer_name || user?.name || "",
      customerPhone: order.customer_phone || user?.phone || "",
      items,
      total: order.price_total,
      address: order.delivery_address || "—",
      timestamp: order.created_at,
      paymentMethod: order.payment_method || "cash",
      mpesaRef: order.mpesa_ref,
    });
  };

  const handleReorder = (order: OrderRecord) => {
    clearCart();
    const items = order.order_items && order.order_items.length > 0
      ? order.order_items
      : [{ name: order.product_name || "Water Order", quantity: order.quantity || 1, price: order.price_total }];

    for (const item of items) {
      // Try to find matching product for proper cart ID
      const matchedProduct = products.find((p) => item.name.includes(p.name) || item.name.includes(`${p.size}L`));
      const isNew = item.name.toLowerCase().includes("new");
      const cartId = matchedProduct ? `${matchedProduct.id}-${isNew ? "new" : "refill"}` : `reorder-${item.name}`;
      addItem({
        id: cartId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      });
    }
    router.push("/cart");
  };

  if (authLoading || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );

  const liveOrders = orders.filter((o) => {
    const status = mapOrderStatus(o.status);
    return status !== "Delivered" && status !== "Cancelled";
  });
  const cancelledOrders = orders.filter((o) => mapOrderStatus(o.status) === "Cancelled");
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
      ) : ordersError ? (
        <div className="bg-surface shadow-card rounded-xl p-8 text-center mb-5">
          <Droplets size={40} className="text-cta-alt mx-auto mb-3" />
          <p className="text-text-primary font-bold mb-1">Could not load orders</p>
          <p className="text-text-secondary text-sm mb-4">{ordersError}</p>
          <button onClick={loadOrders} className="text-primary font-semibold text-sm">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* WhatsApp reminder — shown whenever the customer has any orders */}
          {orders.length > 0 && (
            <div className="bg-[#E8F5E9] border-2 border-[#2ECC71] rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary mb-1">
                    Important: Confirm your order on WhatsApp
                  </p>
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Tap the <span className="font-semibold">Confirm Order by WhatsApp</span> button on any order to send it to MiMaji at
                    <span className="font-bold text-text-primary"> +{OWNER_WHATSAPP_NUMBER.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4")}</span>
                    . Your order details, name, timestamp and delivery address are pre-filled so you can send right away.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Live Orders Section */}
          {liveOrders.length > 0 && (
            <div className="mb-5">
              <h2 className="font-bold text-sm text-text-primary mb-3">Active Orders</h2>
              {liveOrders.map((order) => {
                const displayStatus = mapOrderStatus(order.status);
                const currentStep = getStepIndex(displayStatus);
                const displayId = formatOrderId(order.id);
                const displayDate = formatOrderDateTime(order.created_at);
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
                    {/* Scheduled Delivery Badge */}
                    {order.scheduled_date && order.scheduled_time && (
                      <div className="bg-primary-light rounded-lg p-2.5 mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-primary flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Scheduled Delivery</p>
                          <p className="text-xs font-bold text-primary">{order.scheduled_date} at {order.scheduled_time}</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 mb-4">
                      {itemsList.map((item, idx) => {
                        const img = getProductImage(item.name);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                              {img ? (
                                <img src={img.src} alt={item.name} className="h-8 w-auto object-contain" />
                              ) : (
                                <Droplets size={16} className="text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-text-primary flex-1">
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                            </p>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
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
                        <span className="text-text-primary font-semibold text-sm">KES {order.price_total.toLocaleString()}</span>
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

                    {/* Delivery Code Banner */}
                    {(order.delivery_code || order.id) && (
                      <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-xl p-3 mb-3">
                        <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide mb-1 text-center">Your Delivery Code</p>
                        <div className="flex justify-center gap-1.5">
                          {(order.delivery_code || generateDeliveryCode(order.id)).split("").map((digit, i) => (
                            <div key={i} className="w-9 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                              <span className="text-lg font-extrabold text-primary">{digit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MPESA Code TODO - for mpesa-app orders without payment code */}
                    {order.payment_method === "mpesa-app" && !order.mpesa_ref && (
                      <div className="bg-[#FFF5EC] border border-[#F5A623] rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound size={14} className="text-[#F5A623]" />
                          <p className="text-xs font-bold text-[#F5A623] uppercase">Action Required</p>
                        </div>
                        <p className="text-text-primary text-xs font-medium mb-2">
                          Enter your M-PESA payment code so we can confirm your order.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={mpesaCodeInputs[order.id] || ""}
                            onChange={(e) => setMpesaCodeInputs((prev) => ({ ...prev, [order.id]: e.target.value.toUpperCase() }))}
                            placeholder="e.g. UCJLD9PMW4"
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-text-primary tracking-wider text-center focus:border-primary focus:outline-none"
                            maxLength={15}
                            disabled={submittingCode === order.id}
                          />
                          <button
                            onClick={() => handleSubmitMpesaCode(order.id)}
                            disabled={!mpesaCodeInputs[order.id]?.trim() || (mpesaCodeInputs[order.id]?.trim().length || 0) < 5 || submittingCode === order.id}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                              mpesaCodeInputs[order.id]?.trim()?.length >= 5 && submittingCode !== order.id
                                ? "bg-[#2ECC71] text-white hover:bg-[#27ae60]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {submittingCode === order.id ? "..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    )}

                    <a
                      href={buildOrderWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1ebe5b] transition-colors mb-2"
                    >
                      <MessageCircle size={16} />
                      Confirm Order by WhatsApp
                    </a>

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

          {/* Cancelled Orders */}
          {cancelledOrders.length > 0 && (
            <div className="mb-5">
              <h2 className="font-bold text-sm text-text-primary mb-3">Cancelled Orders</h2>
              {cancelledOrders.map((order) => {
                const displayId = formatOrderId(order.id);
                const displayDate = formatOrderDateTime(order.created_at);
                const itemsList = order.order_items && order.order_items.length > 0
                  ? order.order_items
                  : order.product_name
                    ? [{ name: order.product_name, quantity: order.quantity || 1, price: order.price_total }]
                    : [{ name: "Water Order", quantity: 1, price: order.price_total }];

                return (
                  <div key={order.id} className="bg-surface shadow-card rounded-xl p-4 mb-3 border border-red-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-sm text-text-primary">{displayDate}</span>
                      <div className="flex items-center gap-1">
                        <XCircle size={14} className="text-red-500" />
                        <span className="text-sm font-medium text-red-500">Cancelled</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {itemsList.map((item, idx) => {
                        const img = getProductImage(item.name);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              {img ? (
                                <img src={img.src} alt={item.name} className="h-8 w-auto object-contain opacity-50" />
                              ) : (
                                <Droplets size={16} className="text-red-400" />
                              )}
                            </div>
                            <p className="text-sm text-text-secondary line-through flex-1">
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                            </p>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
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
                        <span className="font-bold text-text-secondary">KES {order.price_total.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-red-500 text-xs mt-3 font-medium">
                      This order was cancelled. If you paid, a refund will be processed to your M-PESA.
                    </p>
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
                const displayDate = formatOrderDateTime(order.created_at);
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
                    <div className="space-y-2">
                      {itemsList.map((item, idx) => {
                        const img = getProductImage(item.name);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                              {img ? (
                                <img src={img.src} alt={item.name} className="h-8 w-auto object-contain" />
                              ) : (
                                <Droplets size={16} className="text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-text-primary flex-1">
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                            </p>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
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
                        <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link
                        href={`/invoices?orderId=${order.id}`}
                        className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline"
                      >
                        <FileText size={12} />
                        View Invoice
                      </Link>
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1a5a9a] transition-colors ml-auto"
                      >
                        <RefreshCw size={12} />
                        Re-order
                      </button>
                    </div>
                    <a
                      href={buildOrderWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-xl py-2 text-xs font-semibold hover:bg-[#1ebe5b] transition-colors"
                    >
                      <MessageCircle size={14} />
                      Confirm Order by WhatsApp
                    </a>
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
    <div className="min-h-screen bg-background pb-16">
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
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
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

