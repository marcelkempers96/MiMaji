"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useCallback } from "react";
import { Package, TrendingUp, Users, Clock, MapPin, Star, Bell, Settings, LogOut, CheckCircle, Truck, X, Timer, Plus, Trash2, MessageCircle, FileText, Phone, Mail, Headphones } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { OrderRecord, formatOrderDate, formatOrderId, generateDeliveryCode } from "@/lib/orders";
import { fetchVendorOrders, updateVendorOrderStatus, VendorStats, fetchVendorStats, acceptOrder, rejectOrder, MOCK_VENDORS, StoreLocation } from "@/lib/vendor";

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
  const [deliveryCodeInput, setDeliveryCodeInput] = useState("");
  const [deliveryCodeError, setDeliveryCodeError] = useState("");

  // Settings state
  const [settingsBusinessName, setSettingsBusinessName] = useState("");
  const [settingsBusinessReg, setSettingsBusinessReg] = useState("");
  const [settingsMpesaNumber, setSettingsMpesaNumber] = useState("");
  const [settingsPhoneNumbers, setSettingsPhoneNumbers] = useState<string[]>([""]);
  const [settingsLocations, setSettingsLocations] = useState<Array<{ name: string; area: string }>>([{ name: "", area: "" }]);
  const [settingsHours, setSettingsHours] = useState("7:00 AM - 8:00 PM");
  const [settingsRadius, setSettingsRadius] = useState(10);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = () => {
    try {
      const vendorSettings = {
        businessName: settingsBusinessName,
        businessReg: settingsBusinessReg,
        mpesaNumber: settingsMpesaNumber,
        phoneNumbers: settingsPhoneNumbers.filter(Boolean),
        locations: settingsLocations.filter((l) => l.name),
        hours: settingsHours,
        radius: settingsRadius,
      };
      localStorage.setItem(`mimaji_vendor_settings_${user?.id || "default"}`, JSON.stringify(vendorSettings));
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  // Load vendor settings from localStorage (or fall back to mock data)
  useEffect(() => {
    if (user?.id) {
      const savedRaw = localStorage.getItem(`mimaji_vendor_settings_${user.id}`);
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw);
          setSettingsBusinessName(saved.businessName || "");
          setSettingsBusinessReg(saved.businessReg || "");
          setSettingsMpesaNumber(saved.mpesaNumber || "");
          setSettingsPhoneNumbers(saved.phoneNumbers?.length > 0 ? saved.phoneNumbers : [""]);
          setSettingsLocations(saved.locations?.length > 0 ? saved.locations : [{ name: "", area: "" }]);
          if (saved.hours) setSettingsHours(saved.hours);
          if (saved.radius) setSettingsRadius(saved.radius);
        } catch { /* fall through to mock */ }
      } else {
        const vendor = MOCK_VENDORS.find((v) => v.id === user.id) || MOCK_VENDORS[0];
        if (vendor) {
          setSettingsBusinessName(vendor.name);
          setSettingsBusinessReg(vendor.businessRegNo);
          setSettingsMpesaNumber(vendor.mpesaNumber);
          setSettingsPhoneNumbers(vendor.phoneNumbers.length > 0 ? [...vendor.phoneNumbers] : [""]);
          setSettingsLocations(vendor.locations.map((l) => ({ name: l.name, area: l.area })));
          setSelectedStoreId(vendor.locations[0]?.id || "");
        }
      }
    }
  }, [user?.id]);

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

  // Poll for new orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => { loadOrders(); }, 10000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Get current vendor's locations for the store picker
  const currentVendor = MOCK_VENDORS.find((v) => v.id === user?.id) || MOCK_VENDORS[0];
  const vendorLocations = currentVendor?.locations || [];

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
    }
  };

  const handleConfirmDeliveryCode = async () => {
    if (!deliveryCodeModalOrder) return;
    const expectedCode = deliveryCodeModalOrder.delivery_code || generateDeliveryCode(deliveryCodeModalOrder.id);
    if (deliveryCodeInput !== expectedCode) {
      setDeliveryCodeError("Incorrect code. Please ask the customer for their 4-digit delivery code.");
      return;
    }
    await updateVendorOrderStatus(deliveryCodeModalOrder.id, "delivered");
    setDeliveryCodeModalOrder(null);
    loadOrders();
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user || user.role !== "vendor") return null;

  const pendingOrders = orders.filter((o) => o.status === "paid" && !o.vendor_id);
  const activeOrders = orders.filter((o) => o.status === "confirmed" || o.status === "out_for_delivery");
  const completedOrders = orders.filter((o) => o.status === "delivered");

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
  const settingsPanel = (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Name</label>
        <input type="text" value={settingsBusinessName} onChange={(e) => setSettingsBusinessName(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Registration No.</label>
        <input type="text" value={settingsBusinessReg} onChange={(e) => setSettingsBusinessReg(e.target.value)} placeholder="e.g. BN-2024-001234" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">M-PESA Number / Till Number</label>
        <input type="text" value={settingsMpesaNumber} onChange={(e) => setSettingsMpesaNumber(e.target.value)} placeholder="e.g. 254700111222" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Phone Number(s)</label>
        {settingsPhoneNumbers.map((phone, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input type="text" value={phone} onChange={(e) => { const updated = [...settingsPhoneNumbers]; updated[i] = e.target.value; setSettingsPhoneNumbers(updated); }} placeholder="+254..." className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
            {settingsPhoneNumbers.length > 1 && (
              <button onClick={() => setSettingsPhoneNumbers(settingsPhoneNumbers.filter((_, idx) => idx !== i))} className="text-cta-alt hover:text-red-700 px-2"><Trash2 size={16} /></button>
            )}
          </div>
        ))}
        <button onClick={() => setSettingsPhoneNumbers([...settingsPhoneNumbers, ""])} className="text-primary text-xs font-semibold flex items-center gap-1 mt-1"><Plus size={14} /> Add Phone Number</button>
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Store Locations</label>
        {settingsLocations.map((loc, i) => (
          <div key={i} className="bg-background rounded-lg border border-[#E0E0E0] p-3 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary">Location {i + 1}</span>
              {settingsLocations.length > 1 && (
                <button onClick={() => setSettingsLocations(settingsLocations.filter((_, idx) => idx !== i))} className="text-cta-alt hover:text-red-700"><Trash2 size={14} /></button>
              )}
            </div>
            <input type="text" value={loc.name} onChange={(e) => { const updated = [...settingsLocations]; updated[i] = { ...updated[i], name: e.target.value }; setSettingsLocations(updated); }} placeholder="Store name" className="w-full h-9 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-white mb-2" />
            <input type="text" value={loc.area} onChange={(e) => { const updated = [...settingsLocations]; updated[i] = { ...updated[i], area: e.target.value }; setSettingsLocations(updated); }} placeholder="Area, City" className="w-full h-9 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-white" />
          </div>
        ))}
        <button onClick={() => setSettingsLocations([...settingsLocations, { name: "", area: "" }])} className="text-primary text-xs font-semibold flex items-center gap-1 mt-1"><Plus size={14} /> Add Location</button>
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Operating Hours</label>
        <input type="text" value={settingsHours} onChange={(e) => setSettingsHours(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <div>
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Delivery Radius (km)</label>
        <input type="number" value={settingsRadius} onChange={(e) => setSettingsRadius(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
      </div>
      <button onClick={handleSaveSettings} className="bg-primary text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors">
        {settingsSaved ? "Saved!" : "Save Settings"}
      </button>
      {settingsSaved && (
        <p className="text-[#2ECC71] text-xs font-semibold mt-2">Your settings have been saved.</p>
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
    <div className="min-h-screen bg-background pb-20">
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
              disabled={deliveryCodeInput.length < 4}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                deliveryCodeInput.length >= 4
                  ? "bg-[#2ECC71] text-white hover:bg-[#27ae60]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={18} /> Confirm Delivery
            </button>
          </div>
        </div>
      )}

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-4">
          <p className="text-white/70 text-xs">Welcome back</p>
          <p className="text-xl font-extrabold">{user.name}</p>
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
            ) : orders.length === 0 ? (
              <div className="bg-surface shadow-card rounded-xl p-8 text-center">
                <Package size={40} className="text-text-secondary mx-auto mb-3" />
                <p className="text-text-primary font-bold mb-1">No orders yet</p>
                <p className="text-text-secondary text-sm">Orders will appear here when customers place them</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-surface shadow-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-text-primary">{formatOrderId(order.id)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-text-primary font-medium">{order.product_name || "Water Order"}</p>
                  <p className="text-xs text-text-secondary">{order.order_items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "\u2014"}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"><MapPin size={12} /> {order.delivery_address}</a>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                    <span className="text-text-secondary text-xs">{formatOrderDate(order.created_at)}</span>
                  </div>
                  {order.estimated_delivery_minutes && (order.status === "confirmed" || order.status === "out_for_delivery") && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-primary"><Timer size={12} /><span className="font-semibold">ETA: {order.estimated_delivery_minutes} min</span></div>
                  )}
                  {order.vendor_location && order.status === "confirmed" && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary"><MapPin size={12} /><span>From: {order.vendor_location}</span></div>
                  )}
                  {order.status === "paid" && !order.vendor_id && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleAcceptOrder(order.id)} className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Accept</button>
                      <button onClick={() => handleRejectOrder(order.id)} className="flex-1 bg-gray-100 text-cta-alt py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">Reject</button>
                    </div>
                  )}
                  {order.status === "confirmed" && order.vendor_id === user.id && (
                    <button onClick={() => handleDispatchOrder(order.id)} className="w-full mt-3 bg-[#F5A623] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#d4901e] transition-colors">Dispatch Order</button>
                  )}
                  {order.status === "out_for_delivery" && order.vendor_id === user.id && (
                    <button onClick={() => handleCompleteOrder(order.id)} className="w-full mt-3 bg-[#2ECC71] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-colors">Mark Delivered</button>
                  )}
                </div>
              ))
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
              <p className="text-text-secondary">{user.name} \u2014 Welcome back</p>
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
                <div className="mt-4 space-y-3">
                  {activeOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-primary-light rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Truck size={20} className="text-primary" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">{formatOrderId(order.id)} \u2014 {order.status === "confirmed" ? "Ready to dispatch" : "Out for delivery"}</p>
                        <p className="text-text-secondary text-xs">{order.delivery_address}</p>
                      </div>
                    </div>
                  ))}
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
                      {settingsLocations.filter((l) => l.name).map((loc, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
                          <p className="font-semibold text-sm text-text-primary">{loc.name}</p>
                          {loc.area ? (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.area)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
                              <MapPin size={10} /> {loc.area}
                            </a>
                          ) : (
                            <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={10} /> Area not set</p>
                          )}
                        </div>
                      ))}
                      {settingsLocations.filter((l) => l.name).length === 0 && (
                        <p className="text-text-secondary text-sm">Add at least one store location.</p>
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
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Items</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Address</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Total</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeDesktopTab === "orders" ? orders : orders.slice(0, 10)).map((order) => (
                        <tr key={order.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-background transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">{formatOrderId(order.id)}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{order.product_name || "Water Order"}</td>
                          <td className="px-6 py-4 text-sm"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{order.delivery_address}</a></td>
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">KES {order.price_total.toLocaleString()}</td>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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
