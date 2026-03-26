"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useCallback } from "react";
import { Package, TrendingUp, Users, Clock, MapPin, Star, Bell, Settings, LogOut, CheckCircle, Truck, X, Timer, MessageCircle, FileText, Phone, Mail, Headphones, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { OrderRecord, formatOrderDate, formatOrderDateTime, formatOrderId, generateDeliveryCode } from "@/lib/orders";
import { fetchVendorOrders, updateVendorOrderStatus, VendorStats, fetchVendorStats, acceptOrder, rejectOrder, StoreLocation } from "@/lib/vendor";
import { supabase } from "@/lib/supabase";

export default function VendorPortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "stats" | "profile">("orders");
  const [activeDesktopTab, setActiveDesktopTab] = useState<"dashboard" | "orders" | "analytics" | "notifications" | "settings">("dashboard");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState<VendorStats | null>(null);

  // ETA Modal state
  const [etaModalOrderId, setEtaModalOrderId] = useState<string | null>(null);
  const [etaMinutes, setEtaMinutes] = useState(30);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  // Delivery code confirmation modal
  const [deliveryCodeModalOrder, setDeliveryCodeModalOrder] = useState<OrderRecord | null>(null);
  // Items popup
  const [itemsPopup, setItemsPopup] = useState<{ orderId: string; items: Array<{ name: string; quantity: number; price: number }>; total: number } | null>(null);
  const [deliveryCodeInput, setDeliveryCodeInput] = useState("");
  const [deliveryCodeError, setDeliveryCodeError] = useState("");
  const [deliveryCodeAttempts, setDeliveryCodeAttempts] = useState(0);
  const [deliveryCodeLocked, setDeliveryCodeLocked] = useState(false);

  // Vendor profile data (read-only, loaded from Supabase via server API)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [vendorProfile, setVendorProfile] = useState<Record<string, any> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadVendorProfile = useCallback(async () => {
    const vid = user?.vendorRecordId || user?.id;
    const pin = user?.vendorPin || "";
    if (!vid || !pin) return;

    setProfileLoading(true);
    try {
      const res = await fetch(`/api/vendor-update?vendorId=${encodeURIComponent(vid)}&pin=${encodeURIComponent(pin)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.id) setVendorProfile(data);
      }
    } catch (e) {
      console.error("Failed to load vendor profile:", e);
    }
    setProfileLoading(false);
  }, [user?.vendorRecordId, user?.id, user?.vendorPin]);

  useEffect(() => { loadVendorProfile(); }, [loadVendorProfile]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "vendor")) {
      router.push("/vendor-login");
    }
  }, [user, authLoading, router]);

  const loadOrders = useCallback(async () => {
    if (!user?.id) return;
    setLoadingOrders(true);
    const data = await fetchVendorOrders(user.id);
    setOrders(data);
    setLoadingOrders(false);
  }, [user?.id]);

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchVendorStats(user.id, orders);
    setStats(data);
  }, [user?.id, orders]);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Subscribe to order changes via Supabase realtime, fallback to 30s polling
  useEffect(() => {
    if (!user?.id) return;

    // Realtime subscription for instant updates
    const channel = supabase
      .channel(`vendor-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          // Only reload if this order is relevant to this vendor
          const row = payload.new as Record<string, unknown> | undefined;
          if (
            row &&
            (row.current_vendor_offer === user.id || row.vendor_id === user.id)
          ) {
            loadOrders();
          }
        }
      )
      .subscribe();

    // Fallback polling at 30s in case realtime connection drops
    const interval = setInterval(() => { loadOrders(); }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user?.id, loadOrders]);

  // Get current vendor's locations from profile data
  const vendorLocations: Array<{ id: string; name: string; area: string; lat: number; lng: number }> = (vendorProfile?.vendor_locations || [])
    .map((l: Record<string, unknown>) => ({ id: l.id as string, name: l.name as string, area: (l.area as string) || "", lat: Number(l.lat) || 0, lng: Number(l.lng) || 0 }));

  const handleAcceptOrder = (orderId: string) => {
    setEtaModalOrderId(orderId);
    setEtaMinutes(30);
    if (vendorLocations.length > 0) {
      setSelectedStoreId(vendorLocations[0].id);
    }
  };

  const handleConfirmAccept = async () => {
    if (!etaModalOrderId || !user?.id) return;
    await acceptOrder(etaModalOrderId, user.id, etaMinutes, selectedStoreId || undefined);
    setEtaModalOrderId(null);
    loadOrders();
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!user?.id) return;
    await rejectOrder(orderId, user.id);
    loadOrders();
  };

  const handleDispatchOrder = async (orderId: string) => {
    await updateVendorOrderStatus(orderId, "out_for_delivery");
    loadOrders();
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setDeliveryCodeModalOrder(order);
      setDeliveryCodeInput("");
      setDeliveryCodeError("");
      setDeliveryCodeAttempts(0);
      setDeliveryCodeLocked(false);
    }
  };

  const MAX_CODE_ATTEMPTS = 5;

  const handleConfirmDeliveryCode = async () => {
    if (!deliveryCodeModalOrder || deliveryCodeLocked) return;
    const expectedCode = deliveryCodeModalOrder.delivery_code || generateDeliveryCode(deliveryCodeModalOrder.id);
    if (deliveryCodeInput !== expectedCode) {
      const newAttempts = deliveryCodeAttempts + 1;
      setDeliveryCodeAttempts(newAttempts);
      if (newAttempts >= MAX_CODE_ATTEMPTS) {
        setDeliveryCodeLocked(true);
        setDeliveryCodeError(`Too many incorrect attempts. Please contact the customer or admin to verify delivery.`);
      } else {
        setDeliveryCodeError(`Incorrect code (${newAttempts}/${MAX_CODE_ATTEMPTS} attempts). Ask the customer for their 4-digit delivery code.`);
      }
      setDeliveryCodeInput("");
      return;
    }
    await updateVendorOrderStatus(deliveryCodeModalOrder.id, "delivered");
    setDeliveryCodeModalOrder(null);
    setDeliveryCodeAttempts(0);
    setDeliveryCodeLocked(false);
    loadOrders();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/");
  };

  if (!user || user.role !== "vendor") return null;

  const vendorId = user.id;
  // Only show orders specifically offered to THIS vendor
  const pendingOrders = orders.filter((o) => o.status === "paid" && !o.vendor_id && o.current_vendor_offer === vendorId);
  // Only show orders accepted by THIS vendor
  const activeOrders = orders.filter((o) => (o.status === "confirmed" || o.status === "out_for_delivery") && o.vendor_id === vendorId);
  const completedOrders = orders.filter((o) => o.status === "delivered" && o.vendor_id === vendorId);
  const cancelledOrders = orders.filter((o) => o.status === "cancelled" && o.vendor_id === vendorId);

  const statsCards = stats ? [
    { label: "Today's Orders", value: String(stats.todayOrders), icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: `KES ${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: String(stats.totalOrders), icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: `${stats.avgDeliveryMinutes} min`, icon: Clock, color: "#E8544E" },
  ] : [
    { label: "Today's Orders", value: "\u2014", icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: "\u2014", icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: "\u2014", icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: "\u2014", icon: Clock, color: "#E8544E" },
  ];

  // ── Settings Panel (shared between mobile and desktop) ──
  {/* PROFILE PANEL — will be rebuilt in next prompt as read-only view from Supabase */}
  const settingsPanel = (
    <div className="bg-surface shadow-card rounded-xl p-5">
      {profileLoading ? (
        <p className="text-sm text-text-secondary">Loading profile...</p>
      ) : !vendorProfile ? (
        <p className="text-sm text-text-secondary">No profile data found. Please contact admin.</p>
      ) : (
        <p className="text-sm text-text-secondary">Profile loaded. Rebuild pending.</p>
      )}
    </div>
  );

  // ── Support Panel ──
  const supportPanel = (
    <div className="bg-surface shadow-card rounded-xl p-5">
      <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><Headphones size={16} className="text-primary" /> Vendor Support</h3>
      <div className="space-y-3">
        <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#E8F5E9] rounded-lg hover:bg-[#C8E6C9] transition-colors">
          <MessageCircle size={18} className="text-[#25D366]" />
          <div>
            <p className="font-semibold text-sm text-text-primary">WhatsApp Support</p>
            <p className="text-text-secondary text-xs">+254 758 434 076</p>
          </div>
        </a>
        <a href="tel:+254758434076" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <Phone size={18} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Call Support</p>
            <p className="text-text-secondary text-xs">07:00 – 21:00 EAT, 7 days a week</p>
          </div>
        </a>
        <a href="mailto:support@mimaji.co.ke" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <Mail size={18} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Email Support</p>
            <p className="text-text-secondary text-xs">support@mimaji.co.ke</p>
          </div>
        </a>
      </div>
    </div>
  );

  // ── Documents Panel ──
  const documentsPanel = (
    <div className="bg-surface shadow-card rounded-xl p-5">
      <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><FileText size={16} className="text-primary" /> Vendor Documents</h3>
      <div className="space-y-2">
        <Link href="/terms" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Vendor Agreement</p>
            <p className="text-text-secondary text-xs">Terms & conditions for MiMaji vendors</p>
          </div>
        </Link>
        <Link href="/privacy" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Privacy Policy</p>
            <p className="text-text-secondary text-xs">How we handle vendor & customer data</p>
          </div>
        </Link>
        <Link href="/cancellation" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Cancellation & Refund Policy</p>
            <p className="text-text-secondary text-xs">Refund processes & vendor accountability</p>
          </div>
        </Link>
        <Link href="/vendor-signup" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-gray-100 transition-colors">
          <FileText size={16} className="text-primary" />
          <div>
            <p className="font-semibold text-sm text-text-primary">Commission & Fee Schedule</p>
            <p className="text-text-secondary text-xs">Current commission rates & payouts</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar title="Vendor Portal" showBack={true} />

      {/* ETA Modal */}
      {etaModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-primary">Accept Order</h3>
              <button onClick={() => setEtaModalOrderId(null)} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
            </div>

            {/* Store location picker — only show if vendor has multiple locations */}
            {vendorLocations.length > 1 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Fulfil from store</label>
                <div className="space-y-2">
                  {vendorLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedStoreId(loc.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedStoreId === loc.id ? "border-primary bg-primary-light" : "border-[#E0E0E0] bg-white"}`}
                    >
                      <p className="font-semibold text-sm text-text-primary">{loc.name}</p>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.area)}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-primary text-xs flex items-center gap-1 hover:underline"><MapPin size={10} /> {loc.area}</a>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-text-secondary text-sm mb-4">Estimated delivery time:</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button onClick={() => setEtaMinutes(Math.max(10, etaMinutes - 10))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-text-primary hover:bg-gray-200">&minus;</button>
              <div className="text-center">
                <p className="text-4xl font-extrabold text-primary">{etaMinutes}</p>
                <p className="text-text-secondary text-xs">minutes</p>
              </div>
              <button onClick={() => setEtaMinutes(Math.min(120, etaMinutes + 10))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-text-primary hover:bg-gray-200">+</button>
            </div>
            <div className="flex gap-2 mb-2">
              {[15, 30, 45, 60].map((min) => (
                <button key={min} onClick={() => setEtaMinutes(min)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${etaMinutes === min ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}>{min}m</button>
              ))}
            </div>
            <button onClick={handleConfirmAccept} className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#1a5a9a] transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={18} /> Accept Order ({etaMinutes} min)
            </button>
          </div>
        </div>
      )}

      {/* Delivery Code Confirmation Modal */}
      {deliveryCodeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-text-primary">Confirm Delivery</h3>
              <button onClick={() => setDeliveryCodeModalOrder(null)} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
            </div>
            <p className="text-text-secondary text-sm mb-1">
              Order: <span className="font-bold text-text-primary">{formatOrderId(deliveryCodeModalOrder.id)}</span>
            </p>
            <p className="text-text-secondary text-sm mb-4">
              Enter the customer&apos;s 4-digit delivery code to confirm delivery.
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={deliveryCodeInput[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const newCode = deliveryCodeInput.split("");
                    newCode[i] = val;
                    setDeliveryCodeInput(newCode.join("").slice(0, 4));
                    setDeliveryCodeError("");
                    if (val && i < 3) {
                      const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !deliveryCodeInput[i] && i > 0) {
                      const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                      prev?.focus();
                    }
                  }}
                  className="w-14 h-16 text-center text-2xl font-extrabold text-primary border-2 border-gray-200 rounded-xl focus:border-primary outline-none transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {deliveryCodeError && (
              <p className="text-cta-alt text-xs text-center mb-3 font-semibold">{deliveryCodeError}</p>
            )}
            <button
              onClick={handleConfirmDeliveryCode}
              disabled={deliveryCodeInput.length < 4 || deliveryCodeLocked}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                deliveryCodeLocked
                  ? "bg-red-100 text-red-400 cursor-not-allowed"
                  : deliveryCodeInput.length >= 4
                  ? "bg-[#2ECC71] text-white hover:bg-[#27ae60]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={18} /> {deliveryCodeLocked ? "Locked — Contact Admin" : "Confirm Delivery"}
            </button>
          </div>
        </div>
      )}

      {/* Items Detail Popup */}
      {itemsPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setItemsPopup(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">Order Items</h3>
              <button onClick={() => setItemsPopup(null)} className="text-text-secondary hover:text-text-primary"><X size={18} /></button>
            </div>
            <p className="text-xs text-text-secondary mb-3">{formatOrderId(itemsPopup.orderId)}</p>
            <div className="space-y-2">
              {itemsPopup.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.name}</p>
                    <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-text-primary">KES {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
              <span className="text-sm font-semibold text-text-secondary">Total</span>
              <span className="text-sm font-bold text-text-primary">KES {itemsPopup.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-4">
          <p className="text-white/70 text-xs">Welcome back</p>
          <p className="text-xl font-extrabold">{vendorProfile?.name || user.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <Star size={14} className="text-rating fill-rating" />
            <span className="text-sm">Vendor Dashboard</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-surface shadow-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1"><Icon size={16} style={{ color: stat.color }} /><span className="text-text-secondary text-xs">{stat.label}</span></div>
                <p className="text-lg font-extrabold text-text-primary">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setActiveTab("orders")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Orders</button>
          <button onClick={() => setActiveTab("stats")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "stats" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Analytics</button>
          <button onClick={() => setActiveTab("profile")} className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "profile" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}>Profile</button>
        </div>

        {activeTab === "orders" && (
          <div className="flex flex-col gap-3">
            {loadingOrders ? (
              <div className="text-center py-8 text-text-secondary text-sm">Loading orders...</div>
            ) : pendingOrders.length === 0 && activeOrders.length === 0 && completedOrders.length === 0 ? (
              <div className="bg-surface shadow-card rounded-xl p-8 text-center">
                <Package size={40} className="text-text-secondary mx-auto mb-3" />
                <p className="text-text-primary font-bold mb-1">No orders yet</p>
                <p className="text-text-secondary text-sm">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <>
                {/* ── PENDING ORDERS ── */}
                {pendingOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-1">
                      <Bell size={16} className="text-[#F5A623]" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">New Orders</h3>
                      <span className="bg-[#F5A623] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingOrders.length}</span>
                    </div>
                    {pendingOrders.map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}

                {/* ── ONGOING DELIVERIES ── */}
                {activeOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-4">
                      <Truck size={16} className="text-primary" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">Ongoing Deliveries</h3>
                      <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeOrders.length}</span>
                    </div>
                    {activeOrders.map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}

                {/* ── COMPLETED ORDERS ── */}
                {completedOrders.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mt-4">
                      <CheckCircle size={16} className="text-[#2ECC71]" />
                      <h3 className="font-bold text-sm text-text-primary uppercase tracking-wide">Completed</h3>
                      <span className="bg-[#2ECC71] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{completedOrders.length}</span>
                    </div>
                    {completedOrders.slice(0, 5).map((order) => (
                      <MobileOrderCard key={order.id} order={order} userId={vendorId} onAccept={handleAcceptOrder} onReject={handleRejectOrder} onDispatch={handleDispatchOrder} onComplete={handleCompleteOrder} onViewItems={(o) => setItemsPopup({ orderId: o.id, items: o.order_items, total: o.price_total })} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "stats" && stats && (
          <div className="bg-surface shadow-card rounded-xl p-5">
            <h3 className="font-bold text-sm text-text-primary mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Orders</span><span className="font-bold text-text-primary">{stats.totalOrders}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Revenue</span><span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Pending</span><span className="font-bold text-[#F5A623]">{pendingOrders.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-secondary">Completed</span><span className="font-bold text-[#2ECC71]">{completedOrders.length}</span></div>
              {cancelledOrders.length > 0 && (
                <div className="flex justify-between text-sm"><span className="text-text-secondary">Cancelled</span><span className="font-bold text-red-600">{cancelledOrders.length}</span></div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex flex-col gap-4">
            <div className="bg-surface shadow-card rounded-xl p-5">
              <h3 className="font-bold text-sm text-text-primary mb-4 flex items-center gap-2"><Settings size={16} className="text-primary" /> Vendor Settings</h3>
              {settingsPanel}
            </div>
            {supportPanel}
            {documentsPanel}
          </div>
        )}

        <button onClick={handleLogout} className="w-full mt-6 bg-surface shadow-card rounded-xl flex items-center justify-center gap-2 px-5 py-4 text-cta-alt font-medium text-sm hover:bg-red-50 transition-colors">
          <LogOut size={20} /> Log Out
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopVendorNav onLogout={handleLogout} activeTab={activeDesktopTab} setActiveTab={setActiveDesktopTab} />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">Vendor Dashboard</h1>
              <p className="text-text-secondary">{vendorProfile?.name || user.name} \u2014 Welcome back</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveDesktopTab("notifications")} className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "notifications" ? "ring-2 ring-primary" : ""}`}>
                <Bell size={16} /> Notifications
                {pendingOrders.length > 0 && <span className="bg-cta-alt text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingOrders.length}</span>}
              </button>
              <button onClick={() => setActiveDesktopTab("settings")} className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "settings" ? "ring-2 ring-primary" : ""}`}>
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>

          {/* Notifications */}
          {activeDesktopTab === "notifications" && (
            <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-text-primary">Notifications</h2>
                <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
              </div>
              {pendingOrders.length > 0 ? (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-[#FFF5EC] rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center"><Package size={20} className="text-[#F5A623]" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">New Order: {formatOrderId(order.id)}</p>
                        <p className="text-text-secondary text-xs">{order.product_name} \u2014 KES {order.price_total.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
                        <button onClick={() => handleRejectOrder(order.id)} className="bg-gray-100 text-cta-alt text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm text-center py-4">No new notifications</p>
              )}
              {activeOrders.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-base text-text-primary mb-3 flex items-center gap-2">
                    <Truck size={18} className="text-primary" /> Ongoing Deliveries
                    <span className="bg-primary text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{activeOrders.length}</span>
                  </h3>
                  <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-primary-light rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Truck size={20} className="text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary">{formatOrderId(order.id)} {"\u2014"} {order.status === "confirmed" ? "Ready to dispatch" : "Out for delivery"}</p>
                        <p className="text-text-secondary text-xs truncate">{order.delivery_address}</p>
                        {order.delivery_address_details?.additionalDirections && (
                          <p className="text-text-secondary text-[11px] italic truncate">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
                        )}
                        {order.estimated_delivery_minutes && (
                          <p className="text-xs text-primary font-semibold mt-0.5">ETA: {order.estimated_delivery_minutes} min</p>
                        )}
                        {(order.customer_name || order.customer_phone) && (
                          <p className="text-xs text-text-secondary mt-0.5">
                            {order.customer_name}{order.customer_phone ? ` — ${order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {order.status === "confirmed" && (
                          <button onClick={() => handleDispatchOrder(order.id)} className="bg-[#F5A623] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4901e] transition-colors flex items-center gap-1"><Truck size={14} /> Dispatch</button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <button onClick={() => handleCompleteOrder(order.id)} className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors flex items-center gap-1"><CheckCircle size={14} /> Complete</button>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeDesktopTab === "settings" && (
            <>
              <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-text-primary">Vendor Settings</h2>
                  <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>{settingsPanel}</div>
                  <div className="bg-background rounded-xl p-5">
                    <h3 className="font-bold text-sm text-text-primary mb-3">Store Locations Preview</h3>
                    <div className="space-y-2">
                      {vendorLocations.filter((l) => l.name).map((loc, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
                          <p className="font-semibold text-sm text-text-primary">{loc.name}</p>
                          {loc.lat !== 0 && loc.lng !== 0 ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
                              <MapPin size={10} /> {loc.area}
                            </a>
                          ) : loc.area ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.area)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
                              <MapPin size={10} /> {loc.area}
                            </a>
                          ) : (
                            <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={10} /> Area not set</p>
                          )}
                        </div>
                      ))}
                      {vendorLocations.length === 0 && (
                        <p className="text-text-secondary text-sm">No store locations configured.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-8">
                {supportPanel}
                {documentsPanel}
              </div>
            </>
          )}

          {/* Stats + Orders */}
          {(activeDesktopTab === "dashboard" || activeDesktopTab === "orders") && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {statsCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-surface shadow-card rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}><Icon size={20} style={{ color: stat.color }} /></div>
                        <span className="text-text-secondary text-sm">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-surface shadow-card rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                  <h2 className="font-bold text-base text-text-primary">{activeDesktopTab === "orders" ? "All Orders" : "Recent Orders"}</h2>
                  {activeDesktopTab !== "orders" && <button onClick={() => setActiveDesktopTab("orders")} className="text-primary text-sm font-semibold cursor-pointer">View All</button>}
                </div>
                {loadingOrders ? (
                  <div className="p-8 text-center text-text-secondary">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">No orders yet.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0F0F0]">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Order</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Customer</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Items</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Address</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Total</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Payment</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Delivery</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeDesktopTab === "orders" ? orders : orders.slice(0, 10)).map((order) => (
                        <tr key={order.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-background transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-text-primary">{formatOrderId(order.id)}</p>
                            <p className="text-[10px] text-text-secondary">{formatOrderDateTime(order.created_at)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {order.customer_name && <span className="font-medium text-text-primary block">{order.customer_name}</span>}
                            {order.customer_phone && (
                              <a href={`tel:+${order.customer_phone.replace(/^0/, "254")}`} className="text-[11px] text-primary hover:underline block mt-0.5">
                                {order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.order_items && order.order_items.length > 0 ? (
                              <button
                                onClick={() => setItemsPopup({ orderId: order.id, items: order.order_items, total: order.price_total })}
                                className="text-primary text-xs font-medium hover:underline text-left"
                              >
                                {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — View
                              </button>
                            ) : (
                              <span className="text-sm text-text-secondary">{order.product_name || "Water Order"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{order.delivery_address}</a>
                            {order.delivery_address_details?.additionalDirections && (
                              <p className="text-xs text-text-secondary italic mt-0.5">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
                            )}
                            {order.delivery_address_details?.neighbourhood && (
                              <p className="text-xs text-text-secondary mt-0.5">{order.delivery_address_details.neighbourhood}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">KES {order.price_total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {order.mpesa_ref ? (
                              <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">{order.mpesa_ref}</span>
                            ) : order.payment_method === "cash" ? (
                              <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-medium">Cash</span>
                            ) : order.payment_method === "mpesa-app" ? (
                              <span className="text-xs text-yellow-600 font-medium">Awaiting code</span>
                            ) : (
                              <span className="text-xs text-text-secondary">{"\u2014"}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.scheduled_date && order.scheduled_time ? (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-[#F5A623] flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-[#F5A623] whitespace-nowrap">{order.scheduled_date}</p>
                                  <p className="text-[10px] text-text-secondary">{order.scheduled_time}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-[#2ECC71] font-medium">ASAP</span>
                            )}
                          </td>
                          <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-6 py-4">
                            {order.status === "paid" && !order.vendor_id && (
                              <div className="flex gap-2">
                                <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
                                <button onClick={() => handleRejectOrder(order.id)} className="bg-gray-100 text-cta-alt text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition-colors">Reject</button>
                              </div>
                            )}
                            {order.status === "confirmed" && order.vendor_id === user.id && (
                              <button onClick={() => handleDispatchOrder(order.id)} className="bg-[#F5A623] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4901e] transition-colors">Dispatch</button>
                            )}
                            {order.status === "out_for_delivery" && order.vendor_id === user.id && (
                              <button onClick={() => handleCompleteOrder(order.id)} className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors">Complete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Analytics */}
          {activeDesktopTab === "analytics" && stats && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Revenue Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Today&apos;s Revenue</span><span className="font-bold text-text-primary">KES {stats.todayRevenue.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Revenue</span><span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Avg. Order Value</span><span className="font-bold text-text-primary">KES {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}</span></div>
                </div>
              </div>
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Total Orders</span><span className="font-bold text-text-primary">{stats.totalOrders}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Pending</span><span className="font-bold text-[#F5A623]">{pendingOrders.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Active</span><span className="font-bold text-primary">{activeOrders.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-text-secondary">Completed</span><span className="font-bold text-[#2ECC71]">{completedOrders.length}</span></div>
                  {cancelledOrders.length > 0 && (
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Cancelled</span><span className="font-bold text-red-600">{cancelledOrders.length}</span></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileOrderCard({ order, userId, onAccept, onReject, onDispatch, onComplete, onViewItems }: {
  order: OrderRecord;
  userId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDispatch: (id: string) => void;
  onComplete: (id: string) => void;
  onViewItems: (o: OrderRecord) => void;
}) {
  return (
    <div className="bg-surface shadow-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm text-text-primary">{formatOrderId(order.id)}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-text-primary font-medium">{order.product_name || "Water Order"}</p>
      {order.order_items && order.order_items.length > 0 ? (
        <button
          onClick={() => onViewItems(order)}
          className="text-primary text-xs font-medium hover:underline text-left"
        >
          {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — View details
        </button>
      ) : (
        <p className="text-xs text-text-secondary">{"\u2014"}</p>
      )}
      <div className="bg-primary-light rounded-lg p-2.5 mt-2">
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline font-medium"><MapPin size={12} /> {order.delivery_address}</a>
        {order.delivery_address_details?.additionalDirections && (
          <p className="text-xs text-text-secondary italic mt-1 ml-4">&quot;{order.delivery_address_details.additionalDirections}&quot;</p>
        )}
        {order.delivery_address_details?.neighbourhood && (
          <p className="text-xs text-text-secondary mt-0.5 ml-4">Area: {order.delivery_address_details.neighbourhood}</p>
        )}
        {order.delivery_address_details?.buildingName && (
          <p className="text-xs text-text-secondary mt-0.5 ml-4">
            {order.delivery_address_details.buildingName}
            {order.delivery_address_details.floor ? `, Floor ${order.delivery_address_details.floor}` : ""}
            {order.delivery_address_details.unitNumber ? `, Unit ${order.delivery_address_details.unitNumber}` : ""}
          </p>
        )}
      </div>
      {order.scheduled_date && order.scheduled_time && (
        <div className="bg-[#FFF5EC] rounded-lg p-2.5 mt-2 flex items-center gap-2">
          <Calendar size={14} className="text-[#F5A623] flex-shrink-0" />
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Scheduled Delivery</p>
            <p className="text-xs font-bold text-[#F5A623]">{order.scheduled_date} at {order.scheduled_time}</p>
          </div>
        </div>
      )}
      {(order.customer_name || order.customer_phone) && (
        <div className="bg-gray-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide mb-1">Customer</p>
          {order.customer_name && <p className="text-xs font-medium text-text-primary">{order.customer_name}</p>}
          {order.customer_phone && (
            <a href={`tel:+${order.customer_phone.replace(/^0/, "254")}`} className="text-xs text-primary hover:underline">
              {order.customer_phone.startsWith("254") ? `0${order.customer_phone.slice(3)}` : order.customer_phone}
            </a>
          )}
        </div>
      )}
      {order.mpesa_ref && (
        <div className="bg-green-50 rounded-lg p-2.5 mt-2 flex items-center gap-2">
          <div>
            <p className="text-[10px] text-text-secondary font-semibold uppercase tracking-wide">Payment Confirmed</p>
            <p className="text-xs font-bold text-green-700 font-mono">{order.mpesa_ref}</p>
          </div>
        </div>
      )}
      {!order.mpesa_ref && order.payment_method === "mpesa-app" && (
        <div className="bg-yellow-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-yellow-700 font-semibold">Awaiting M-PESA code</p>
        </div>
      )}
      {order.payment_method === "cash" && (
        <div className="bg-orange-50 rounded-lg p-2.5 mt-2">
          <p className="text-[10px] text-orange-700 font-semibold">Cash on Delivery</p>
        </div>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
        <span className="text-text-secondary text-[10px]">{formatOrderDateTime(order.created_at)}</span>
      </div>
      {order.estimated_delivery_minutes && (order.status === "confirmed" || order.status === "out_for_delivery") && (
        <div className="flex items-center gap-1 mt-2 text-xs text-primary"><Timer size={12} /><span className="font-semibold">ETA: {order.estimated_delivery_minutes} min</span></div>
      )}
      {order.vendor_location && order.status === "confirmed" && (
        <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary"><MapPin size={12} /><span>From: {order.vendor_location}</span></div>
      )}
      {order.status === "paid" && !order.vendor_id && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onAccept(order.id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
          <button onClick={() => onReject(order.id)} className="flex-1 bg-gray-100 text-cta-alt py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">Reject</button>
        </div>
      )}
      {order.status === "confirmed" && order.vendor_id === userId && (
        <button onClick={() => onDispatch(order.id)} className="w-full mt-3 bg-[#F5A623] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#d4901e] transition-colors flex items-center justify-center gap-2"><Truck size={16} /> Dispatch Order</button>
      )}
      {order.status === "out_for_delivery" && order.vendor_id === userId && (
        <button onClick={() => onComplete(order.id)} className="w-full mt-3 bg-[#2ECC71] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-colors flex items-center justify-center gap-2"><CheckCircle size={16} /> Mark Delivered</button>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending_payment: { label: "Pending", bg: "bg-[#FFF5EC]", text: "text-[#F5A623]" },
    paid: { label: "Paid", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
    confirmed: { label: "Confirmed", bg: "bg-primary-light", text: "text-primary" },
    out_for_delivery: { label: "In Transit", bg: "bg-primary-light", text: "text-primary" },
    delivered: { label: "Delivered", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
    cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-red-600" },
  };
  const c = config[status] || config.pending_payment;
  return <span className={`${c.bg} ${c.text} text-xs px-2.5 py-1 rounded-full font-semibold`}>{c.label}</span>;
}

function DesktopVendorNav({ onLogout, activeTab, setActiveTab }: { onLogout: () => void; activeTab: string; setActiveTab: (t: "dashboard" | "orders" | "analytics" | "notifications" | "settings") => void }) {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
          <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-semibold ml-2">Vendor</span>
        </Link>
        <nav className="flex items-center gap-6">
          <button onClick={() => setActiveTab("dashboard")} className={`font-medium text-sm transition-colors ${activeTab === "dashboard" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Dashboard</button>
          <button onClick={() => setActiveTab("orders")} className={`font-medium text-sm transition-colors ${activeTab === "orders" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Orders</button>
          <button onClick={() => setActiveTab("analytics")} className={`font-medium text-sm transition-colors ${activeTab === "analytics" ? "text-primary" : "text-text-secondary hover:text-primary"}`}>Analytics</button>
          <button onClick={onLogout} className="text-text-secondary hover:text-cta-alt font-medium text-sm transition-colors flex items-center gap-1"><LogOut size={16} /> Logout</button>
        </nav>
      </div>
    </header>
  );
}
