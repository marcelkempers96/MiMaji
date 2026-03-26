"use client";

import React, { useState, useEffect, useCallback } from "react";
import { OrderRecord, formatOrderId, formatOrderDate, formatOrderDateTime, fetchAllOrders, updateOrderStatus } from "@/lib/orders";
import { VendorInfo, MOCK_VENDORS, fetchVendors, StoreLocation } from "@/lib/vendor";
import { VendorRecord, loadVendorStore, loadVendorStoreAsync, saveVendorStore, createVendorAsync, updateVendor, updateVendorAsync, deleteVendor as deleteVendorFromStore, deleteVendorAsync, defaultVendorProducts, defaultServiceTimes, formatPhoneDisplay, formatServiceTimesDisplay, VendorProduct, ServiceDay, mapSupabaseToVendor } from "@/lib/vendorStore";
import { supabase } from "@/lib/supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";
import AddressSearch from "@/components/AddressSearch";
import { waterBrands, NAIROBI_AREAS } from "@/data/products";
import {
  RefreshCw,
  Package,
  DollarSign,
  Truck,
  Store,
  Clock,
  ChevronDown,
  BarChart3,
  Users,
  ShoppingCart,
  MessageCircle,
  Droplets,
  Calendar,
  AlertCircle,
  XCircle,
  Trash2,
  Edit3,
  Ban,
  CheckCircle2,
  Plus,
  MapPin,
} from "lucide-react";


// ── Types ──
type Tab = "overview" | "orders" | "vendors" | "analytics" | "users" | "subscriptions";

type OrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending_payment",
  "paid",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-800",
};

// ── Helpers ──
function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

function getKenyaTime(): string {
  return new Date().toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function truncate(str: string, len: number): string {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function parseLitres(order: OrderRecord): number {
  let total = 0;
  if (order.order_items && order.order_items.length > 0) {
    for (const item of order.order_items) {
      const match = item.name.match(/(\d+)L/i);
      if (match) {
        total += parseInt(match[1]) * item.quantity;
      }
    }
  } else if (order.product_name) {
    const match = order.product_name.match(/(\d+)L/i);
    if (match) {
      total += parseInt(match[1]) * order.quantity;
    }
  }
  return total;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

// ── Admin API helpers (bypass RLS via service role) ──
// Admin code is stored in localStorage (not sessionStorage) so it survives
// mobile app switching where the OS may kill the browser tab.
function getAdminCode(): string {
  try {
    return localStorage.getItem("mimaji_admin_code") || sessionStorage.getItem("mimaji_admin_code") || "";
  } catch { return ""; }
}

async function adminFetch(type: string): Promise<{ data: unknown[]; ok: boolean }> {
  try {
    const code = getAdminCode();
    const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&type=${type}`);
    if (!res.ok) { console.error(`Admin API ${type} error:`, res.status); return { data: [], ok: false }; }
    const data = await res.json();
    return { data: Array.isArray(data) ? data : [], ok: true };
  } catch (e) { console.error(`Admin API ${type} fetch error:`, e); return { data: [], ok: false }; }
}

async function adminPost(body: Record<string, unknown>): Promise<{ success?: boolean; error?: string }> {
  try {
    const code = getAdminCode();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ...body }),
    });
    return await res.json();
  } catch (e) { console.error("Admin API post error:", e); return { error: "Network error" }; }
}

// ── Admin Login Gate ──

function AdminLoginGate({ children }: { children: React.ReactNode }) {
  const [code, setCode] = React.useState("");
  const [authenticated, setAuthenticated] = React.useState(false);
  const [error, setError] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  React.useEffect(() => {
    // Restore session — check localStorage first (survives app switching), then sessionStorage
    try {
      const savedCode = localStorage.getItem("mimaji_admin_code") || sessionStorage.getItem("mimaji_admin_code");
      if (savedCode) {
        fetch(`/api/admin?code=${encodeURIComponent(savedCode)}&type=auth`)
          .then((res) => {
            if (res.ok) {
              setAuthenticated(true);
              // Ensure code is in both storage locations
              try { localStorage.setItem("mimaji_admin_code", savedCode); } catch {}
              try { sessionStorage.setItem("mimaji_admin_code", savedCode); } catch {}
            } else {
              localStorage.removeItem("mimaji_admin_code");
              sessionStorage.removeItem("mimaji_admin_code");
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    try {
      // Validate code server-side — never compare on the client
      const res = await fetch(`/api/admin?code=${encodeURIComponent(code)}&type=auth`);
      if (res.ok) {
        setAuthenticated(true);
        try { localStorage.setItem("mimaji_admin_code", code); } catch {}
        try { sessionStorage.setItem("mimaji_admin_code", code); } catch {}
      } else if (res.status === 429) {
        setError("Too many attempts. Try again in 15 minutes.");
        setTimeout(() => setError(""), 5000);
      } else {
        setError("Invalid code. Try again.");
        setTimeout(() => setError(""), 2000);
      }
    } catch {
      setError("Network error. Try again.");
      setTimeout(() => setError(""), 2000);
    } finally {
      setChecking(false);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-surface shadow-card rounded-2xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <Ban size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Admin Access</h1>
        <p className="text-text-secondary text-sm mb-6">Enter the admin access code to continue.</p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className={`w-full text-center text-2xl font-mono font-bold tracking-[0.5em] px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-primary"
          }`}
          maxLength={6}
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <button
          type="submit"
          className="w-full mt-4 bg-text-primary text-white rounded-xl py-3 font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Enter Admin Panel
        </button>
      </form>
    </div>
  );
}

// ── Component ──
export default function AdminDashboard() {
  return (
    <AdminLoginGate>
      <AdminDashboardInner />
    </AdminLoginGate>
  );
}

function AdminDashboardInner() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [kenyaTime, setKenyaTime] = useState(getKenyaTime());
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [vendorDropdown, setVendorDropdown] = useState<string | null>(null);
  const [itemsPopup, setItemsPopup] = useState<{ orderId: string; items: Array<{ name: string; quantity: number; price: number }>; total: number } | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [cancelConfirm, setCancelConfirm] = useState<{ orderId: string; amount: number } | null>(null);

  // Users management
  interface MockUser { id: string; phone: string; name: string; role: string; password?: string }
  const [users, setUsers] = useState<MockUser[]>([]);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ phone: "", name: "", password: "", role: "customer" });
  const [showPasswords, setShowPasswords] = useState(false);

  // Vendor management (Supabase-backed)
  const [vendorStoreList, setVendorStoreList] = useState<VendorRecord[]>([]);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");
  const [createdVendorCredentials, setCreatedVendorCredentials] = useState<{ name: string; phone: string; pin: string; id: string } | null>(null);
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [editingStoreVendor, setEditingStoreVendor] = useState<string | null>(null);
  const [storeVendorEdits, setStoreVendorEdits] = useState<Partial<VendorRecord>>({});
  const [deleteStoreVendorConfirm, setDeleteStoreVendorConfirm] = useState<string | null>(null);

  function loadVendorStoreList() {
    // Show cache immediately while fetching from server
    const cached = loadVendorStore();
    setVendorStoreList(cached);
    // Always fetch from admin API (service role, bypasses RLS) for cross-device consistency
    adminFetch("vendors").then(({ data, ok }) => {
      if (ok && data.length > 0) {
        const apiVendors = (data as Record<string, unknown>[]).map(mapSupabaseToVendor);
        // Merge: API vendors take priority, but keep any locally-created vendors
        // that haven't appeared in the API response yet (database write propagation)
        const apiIds = new Set(apiVendors.map((v) => v.id));
        const localOnly = cached.filter((v) => !apiIds.has(v.id));
        const merged = [...apiVendors, ...localOnly];
        setVendorStoreList(merged);
        saveVendorStore(merged); // update local cache
      } else if (ok) {
        // API returned successfully but empty — may be a fresh database
        // Keep cached vendors so locally-created ones still show
        if (cached.length > 0) {
          setVendorStoreList(cached);
        }
      } else {
        // API failed — try anon key Supabase, then fall back to cache
        loadVendorStoreAsync().then((vendors) => {
          if (vendors.length > 0) {
            setVendorStoreList(vendors);
          } else if (cached.length > 0) {
            setVendorStoreList(cached);
          }
        }).catch(console.error);
      }
    }).catch(() => {
      loadVendorStoreAsync().then((vendors) => {
        if (vendors.length > 0) setVendorStoreList(vendors);
      }).catch(console.error);
    });
  }

  async function handleQuickCreateVendor() {
    if (!newVendorName.trim() || !newVendorPhone.trim()) return;
    const vendor = await createVendorAsync(newVendorName.trim(), newVendorPhone.trim());
    setCreatedVendorCredentials({
      name: vendor.name,
      phone: formatPhoneDisplay(vendor.credentials.phone),
      pin: vendor.credentials.pin,
      id: vendor.id,
    });
    setNewVendorName("");
    setNewVendorPhone("");
    // Refresh immediately from cache (vendor was added to localStorage by createVendorAsync)
    loadVendorStoreList();
    // Also refresh after a short delay to pick up the vendor from the database
    setTimeout(() => loadVendorStoreList(), 1500);
  }

  async function handleSaveStoreVendor(vendorId: string) {
    await updateVendorAsync(vendorId, storeVendorEdits);
    setEditingStoreVendor(null);
    setStoreVendorEdits({});
    loadVendorStoreList();
  }

  async function handleDeleteStoreVendor(vendorId: string) {
    await deleteVendorAsync(vendorId);
    loadVendorStoreList();
    setDeleteStoreVendorConfirm(null);
  }

  async function handleReactivateVendor(vendorId: string) {
    await adminPost({ action: "reactivate_vendor", vendorId });
    // Also update local cache
    const vendors = loadVendorStore();
    const idx = vendors.findIndex((v) => v.id === vendorId);
    if (idx !== -1) {
      vendors[idx].active = true;
      saveVendorStore(vendors);
    }
    loadVendorStoreList();
  }

  // Legacy vendor loading (for order vendor assignment dropdown)
  async function loadVendors() {
    loadVendorStoreList();
  }

  // Demo account IDs (used to identify built-in accounts)
  const DEMO_IDS = ["d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d"];

  async function loadUsers() {
    const { data: raw, ok } = await adminFetch("users");
    if (ok && raw.length > 0) {
      setUsers((raw as Record<string, unknown>[]).map((p) => ({
        id: p.id as string,
        phone: (p.phone as string) || "",
        name: (p.full_name as string) || "",
        role: (p.role as string) || "customer",
      })));
    }
  }

  async function updateUser(userId: string, updates: Partial<MockUser>) {
    const result = await adminPost({ action: "update_user", userId, name: updates.name, role: updates.role, phone: updates.phone });
    if (result.success) {
      await loadUsers();
    }
    setEditingUser(null);
  }

  async function deleteUser(userId: string) {
    const result = await adminPost({ action: "delete_user", userId });
    if (result.success) {
      await loadUsers();
    }
    setDeleteUserConfirm(null);
  }

  async function createUserAccount() {
    let phone = newUser.phone.replace(/\s/g, "").replace(/^\+/, "");
    if (phone.startsWith("0")) {
      phone = "254" + phone.slice(1);
    } else if (!phone.startsWith("254") && phone.length <= 9) {
      phone = "254" + phone;
    }
    if (!phone || !newUser.name || !newUser.password) return;

    const result = await adminPost({ action: "create_user", phone, name: newUser.name, password: newUser.password, role: newUser.role });
    if (result.success) {
      await loadUsers();
    }
    setNewUser({ phone: "", name: "", password: "", role: "customer" });
    setShowCreateUser(false);
  }

  const loadOrders = useCallback(async () => {
    try {
      // Always try server API first (bypasses RLS), fall back to direct client fetch
      const { data: raw, ok } = await adminFetch("orders");
      if (ok) {
        const data = (raw as Record<string, unknown>[]).map((row) => ({
          id: (row.id as string) || "",
          customer_id: (row.customer_id as string) || "",
          delivery_address: (row.delivery_address as string) || "",
          delivery_address_details: (row.delivery_address_details as OrderRecord["delivery_address_details"]) || null,
          quantity: Number(row.quantity) || 0,
          price_total: Number(row.price_total) || 0,
          status: (row.status as string) || "pending_payment",
          mpesa_ref: (row.mpesa_ref as string) || null,
          product_name: (row.product_name as string) || null,
          order_items: (row.order_items as OrderRecord["order_items"]) || [],
          estimated_delivery_minutes: row.estimated_delivery_minutes != null ? Number(row.estimated_delivery_minutes) : null,
          created_at: (row.created_at as string) || new Date().toISOString(),
          updated_at: (row.updated_at as string) || new Date().toISOString(),
          vendor_id: (row.vendor_id as string) || null,
          vendor_name: (row.vendor_name as string) || null,
          vendor_location: (row.vendor_location as string) || null,
          vendors_tried: (row.vendors_tried as string[]) || [],
          current_vendor_offer: (row.current_vendor_offer as string) || null,
          scheduled_date: (row.scheduled_date as string) || null,
          scheduled_time: (row.scheduled_time as string) || null,
          delivery_code: (row.delivery_code as string) || null,
          payment_method: (row.payment_method as string) || null,
          brand_preference: (row.brand_preference as string[]) || [],
          customer_name: (row.customer_name as string) || undefined,
          customer_phone: (row.customer_phone as string) || undefined,
        }));
        setOrders(data);
      } else {
        // Fallback: direct client fetch (works in mock/demo mode)
        const data = await fetchAllOrders();
        setOrders(data);
      }
      setLastRefresh(new Date());
    } catch (e) {
      console.error("loadOrders error:", e);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadOrders();
    loadUsers();
    loadVendors();
    loadVendorStoreList();
    loadSubscriptions();
    // Realtime subscription for instant order updates
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        loadOrders();
      })
      .subscribe();
    // Fallback polling at 30s
    const orderInterval = setInterval(loadOrders, 30_000);
    const clockInterval = setInterval(() => setKenyaTime(getKenyaTime()), 1_000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(orderInterval);
      clearInterval(clockInterval);
    };
  }, [loadOrders]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setStatusDropdown(null);
    if (statusDropdown) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [statusDropdown]);

  // ── Computed stats ──
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s: number, o: OrderRecord) => s + o.price_total, 0);
  const activeOrders = orders.filter(
    (o: OrderRecord) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;
  // Build unified vendor list for order assignment dropdowns
  const allVendors: VendorInfo[] = vendorStoreList.filter((v) => v.active !== false).map((v) => ({
    id: v.id, name: v.name, area: v.area || "", distance: "",
    hours: "7AM - 8PM", products: v.products.filter((p) => p.available).map((p) => p.name),
    brands: v.brands || [], areasServed: v.areasServed || [], businessRegNo: v.businessRegNo || "",
    mpesaNumber: v.mpesaNumber || "", phoneNumbers: v.phoneNumbers || [], locations: v.locations || [],
  }));
  const totalVendors = vendorStoreList.length;

  const statusCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  }

  const totalLitres = orders
    .filter((o: OrderRecord) => o.status === "delivered")
    .reduce((s: number, o: OrderRecord) => s + parseLitres(o), 0);

  const totalBottles = orders
    .filter((o: OrderRecord) => o.status === "delivered")
    .reduce((s: number, o: OrderRecord) => {
      if (o.order_items && o.order_items.length > 0) {
        return s + o.order_items.reduce((a: number, i: { name: string; quantity: number; price: number }) => a + i.quantity, 0);
      }
      return s + o.quantity;
    }, 0);

  const last7Days = getLast7Days();
  const revenueByDay = last7Days.map((day) => {
    const dayOrders = orders.filter((o: OrderRecord) => o.created_at.startsWith(day));
    return {
      date: day,
      label: new Date(day + "T00:00:00").toLocaleDateString("en-KE", {
        weekday: "short",
        day: "numeric",
      }),
      revenue: dayOrders.reduce((s: number, o: OrderRecord) => s + o.price_total, 0),
      count: dayOrders.length,
    };
  });
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1);

  function vendorOrderCount(vendorId: string): number {
    return orders.filter((o: OrderRecord) => o.vendor_id === vendorId).length;
  }

  // ── Status update ──
  async function handleStatusUpdate(orderId: string, newStatus: string) {
    // Intercept cancel to show refund confirmation
    if (newStatus === "cancelled") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setCancelConfirm({ orderId, amount: order.price_total });
        setStatusDropdown(null);
        return;
      }
    }
    const result = await adminPost({ action: "update_order_status", orderId, status: newStatus });
    if (!result.success) {
      await updateOrderStatus(orderId, newStatus);
    }
    loadOrders();
    setStatusDropdown(null);
  }

  async function confirmCancel() {
    if (!cancelConfirm) return;
    const result = await adminPost({ action: "update_order_status", orderId: cancelConfirm.orderId, status: "cancelled" });
    if (!result.success) {
      await updateOrderStatus(cancelConfirm.orderId, "cancelled");
    }
    loadOrders();
    setCancelConfirm(null);
  }

  async function reassignVendor(orderId: string, vendorId: string) {
    const vendor = allVendors.find(v => v.id === vendorId);
    if (!vendor) return;
    const result = await adminPost({
      action: "reassign_vendor",
      orderId,
      vendorId,
      vendorName: vendor.name,
      vendorLocation: vendor.locations?.[0]?.name || vendor.area || "",
    });
    if (!result.success) {
      const { updateOrder } = await import("@/lib/orders");
      await updateOrder(orderId, {
        vendor_id: vendorId,
        vendor_name: vendor.name,
        vendor_location: vendor.locations?.[0]?.name || vendor.area || "",
        current_vendor_offer: vendorId,
      });
    }
    loadOrders();
    setVendorDropdown(null);
  }

  // ── Tab buttons ──
  // Subscriptions state
  interface SubscriptionRecord { id: string; userId: string; userName: string; userPhone: string; planId: string; planName: string; jugsPerMonth: number; pricePerJug: number; monthlyTotal: number; status: string; startDate: string; }
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSub, setNewSub] = useState({ phone: "", name: "", planId: "custom", jugs: "4", pricePerJug: "120" });
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null);

  async function loadSubscriptions() {
    // Always try server API first
    const { data: raw, ok } = await adminFetch("subscriptions");
    if (ok) {
      setSubscriptions((raw as Record<string, unknown>[]).map((s) => ({
        id: s.id as string,
        userId: (s.user_id as string) || "",
        userName: (s.user_name as string) || "",
        userPhone: (s.user_phone as string) || "",
        planId: (s.plan_id as string) || "custom",
        planName: (s.plan_name as string) || "Custom",
        jugsPerMonth: Number(s.jugs_per_month) || 0,
        pricePerJug: Number(s.price_per_jug) || 0,
        monthlyTotal: Number(s.monthly_total) || 0,
        status: (s.status as string) || "active",
        startDate: (s.created_at as string) || new Date().toISOString(),
      })));
      return;
    }
    // Fallback: localStorage
    try {
      const raw = localStorage.getItem("mimaji_admin_subscriptions");
      setSubscriptions(raw ? JSON.parse(raw) : []);
    } catch { setSubscriptions([]); }
  }

  async function addSubscription() {
    const jugs = parseInt(newSub.jugs) || 4;
    const ppj = parseInt(newSub.pricePerJug) || 120;
    const sub: SubscriptionRecord = {
      id: `sub-${Date.now()}`,
      userId: "",
      userName: newSub.name,
      userPhone: newSub.phone,
      planId: newSub.planId,
      planName: jugs <= 5 ? "Starter" : jugs <= 12 ? "Standard" : "Premium",
      jugsPerMonth: jugs,
      pricePerJug: ppj,
      monthlyTotal: jugs * ppj,
      status: "active",
      startDate: new Date().toISOString(),
    };
    const result = await adminPost({
      action: "add_subscription",
      subscription: {
        user_name: sub.userName,
        user_phone: sub.userPhone,
        plan_id: sub.planId,
        plan_name: sub.planName,
        jugs_per_month: sub.jugsPerMonth,
        price_per_jug: sub.pricePerJug,
        monthly_total: sub.monthlyTotal,
        status: "active",
      },
    });
    if (result.success) {
      await loadSubscriptions();
    } else {
      const all = [...subscriptions, sub];
      localStorage.setItem("mimaji_admin_subscriptions", JSON.stringify(all));
      setSubscriptions(all);
    }
    setNewSub({ phone: "", name: "", planId: "custom", jugs: "4", pricePerJug: "120" });
    setShowAddSub(false);
  }

  async function toggleSubscriptionStatus(subId: string, newStatus: string) {
    const result = await adminPost({ action: "update_subscription", subId, status: newStatus });
    if (result.success) {
      await loadSubscriptions();
    } else {
      const all = subscriptions.map((s) => s.id === subId ? { ...s, status: newStatus } : s);
      localStorage.setItem("mimaji_admin_subscriptions", JSON.stringify(all));
      setSubscriptions(all);
    }
  }

  async function deleteSubscription(subId: string) {
    const result = await adminPost({ action: "delete_subscription", subId });
    if (result.success) {
      await loadSubscriptions();
    } else {
      const all = subscriptions.filter((s) => s.id !== subId);
      localStorage.setItem("mimaji_admin_subscriptions", JSON.stringify(all));
      setSubscriptions(all);
    }
    setDeleteSubConfirm(null);
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart size={16} /> },
    { id: "vendors", label: "Vendors", icon: <Store size={16} /> },
    { id: "subscriptions", label: "Subscriptions", icon: <RefreshCw size={16} /> },
    { id: "analytics", label: "Analytics", icon: <Droplets size={16} /> },
    { id: "users", label: "Users", icon: <Users size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="bg-text-primary text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              MiMaji Admin Panel
            </h1>
            <p className="text-sm text-gray-300 mt-0.5 flex items-center gap-1.5">
              <Clock size={13} />
              {kenyaTime} (EAT)
              <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasSupabaseConfig ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                {hasSupabaseConfig ? "Live Data" : "Local/Demo Mode"}
              </span>
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </header>

      {/* ── Tab Nav ── */}
      <nav className="bg-surface border-b border-gray-200 px-4 sm:px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ═══ OVERVIEW TAB ═══ */}
        {(activeTab === "overview" || activeTab === "orders") && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Package size={20} className="text-primary" />}
                label="Total Orders"
                value={totalOrders.toString()}
                bg="bg-primary-light"
              />
              <StatCard
                icon={<DollarSign size={20} className="text-success" />}
                label="Total Revenue"
                value={formatKES(totalRevenue)}
                bg="bg-green-50"
              />
              <StatCard
                icon={<Truck size={20} className="text-orange-500" />}
                label="Active Orders"
                value={activeOrders.toString()}
                bg="bg-orange-50"
              />
              <StatCard
                icon={<Store size={20} className="text-primary" />}
                label="Total Vendors"
                value={totalVendors.toString()}
                bg="bg-blue-50"
              />
            </div>
          </>
        )}

        {/* ═══ ORDERS TABLE (shown in overview + orders tab) ═══ */}
        {(activeTab === "overview" || activeTab === "orders") && (
          <section className="bg-surface shadow-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                All Orders ({orders.length})
              </h2>
              <span className="text-xs text-text-secondary">
                Auto-refreshes every 10s
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="px-5 py-16 text-center text-text-secondary">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium">No orders yet</p>
                <p className="text-sm mt-1">
                  Orders placed by customers will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text-secondary text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Items</th>
                      <th className="px-4 py-3 font-medium">Address</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Pay Method</th>
                      <th className="px-4 py-3 font-medium">MPESA Code</th>
                      <th className="px-4 py-3 font-medium">Delivery</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Vendor</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders
                      .sort(
                        (a: OrderRecord, b: OrderRecord) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((order: OrderRecord) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                            {formatOrderId(order.id)}
                          </td>
                          <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">
                            {formatOrderDateTime(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {(() => {
                              // Try order-level customer info first (from profiles join), then fall back to users list
                              const name = order.customer_name || users.find((u) => u.id === order.customer_id)?.name;
                              const phone = order.customer_phone || users.find((u) => u.id === order.customer_id)?.phone;
                              return (
                                <div>
                                  {name ? (
                                    <span className="font-medium text-text-primary block">{name}</span>
                                  ) : (
                                    <span className="font-mono text-text-secondary block">{truncate(order.customer_id, 12)}</span>
                                  )}
                                  {phone && (
                                    <a href={`tel:+${phone.replace(/^0/, "254")}`} className="text-[11px] text-primary hover:underline block mt-0.5">
                                      {phone.startsWith("254") ? `0${phone.slice(3)}` : phone}
                                    </a>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            {order.order_items && order.order_items.length > 0 ? (
                              <button
                                onClick={() => setItemsPopup({ orderId: order.id, items: order.order_items, total: order.price_total })}
                                className="text-primary text-xs font-medium hover:underline cursor-pointer text-left"
                              >
                                {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — View
                              </button>
                            ) : (
                              <span className="text-xs text-text-secondary">{order.product_name || "—"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-secondary max-w-[260px]">
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline font-medium" title={order.delivery_address}>
                              {order.delivery_address}
                            </a>
                            {order.delivery_address_details?.neighbourhood && (
                              <p className="text-[11px] text-text-secondary mt-0.5">{order.delivery_address_details.neighbourhood}</p>
                            )}
                            {order.delivery_address_details?.buildingName && (
                              <p className="text-[11px] text-text-secondary mt-0.5">
                                {order.delivery_address_details.buildingName}
                                {order.delivery_address_details.floor ? `, Floor ${order.delivery_address_details.floor}` : ""}
                                {order.delivery_address_details.unitNumber ? `, Unit ${order.delivery_address_details.unitNumber}` : ""}
                              </p>
                            )}
                            {order.delivery_address_details?.additionalDirections && (
                              <p className="text-[11px] italic text-text-secondary mt-0.5" title={order.delivery_address_details.additionalDirections}>
                                &quot;{order.delivery_address_details.additionalDirections}&quot;
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap">
                            {formatKES(order.price_total)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                              order.payment_method === "stk-push" ? "bg-blue-50 text-blue-700" :
                              order.payment_method === "mpesa-app" ? "bg-green-50 text-green-700" :
                              order.payment_method === "cash" ? "bg-orange-50 text-orange-700" :
                              "bg-gray-50 text-gray-600"
                            }`}>
                              {order.payment_method === "stk-push" ? "STK Push" :
                               order.payment_method === "mpesa-app" ? "M-PESA App" :
                               order.payment_method === "cash" ? "Cash" :
                               "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {order.mpesa_ref ? (
                              <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded font-bold">
                                {order.mpesa_ref}
                              </span>
                            ) : order.payment_method === "mpesa-app" ? (
                              <span className="text-xs text-yellow-600 font-medium">
                                Awaiting code
                              </span>
                            ) : order.status === "pending_payment" ? (
                              <span className="text-xs text-yellow-600">
                                Pending
                              </span>
                            ) : (
                              <span className="text-xs text-text-secondary">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {order.scheduled_date && order.scheduled_time ? (
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-primary flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-semibold text-primary whitespace-nowrap">{order.scheduled_date}</p>
                                  <p className="text-[10px] text-text-secondary">{order.scheduled_time}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-[#2ECC71] font-medium">Now</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                                STATUS_COLORS[
                                  order.status as OrderStatus
                                ] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {STATUS_LABELS[
                                order.status as OrderStatus
                              ] || order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {order.vendor_name ? (
                              <div>
                                <span className="font-medium text-text-primary">{order.vendor_name}</span>
                                {order.status === "confirmed" && (
                                  <p className="text-[10px] text-green-600 font-semibold mt-0.5">Accepted — Awaiting Dispatch</p>
                                )}
                                {order.status === "out_for_delivery" && (
                                  <p className="text-[10px] text-orange-600 font-semibold mt-0.5">Dispatched — Out for Delivery</p>
                                )}
                                {order.status === "delivered" && (
                                  <p className="text-[10px] text-green-600 mt-0.5">Delivered</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-text-secondary italic">Unassigned</span>
                            )}
                            {order.current_vendor_offer && (
                              <p className="text-[10px] text-orange-600 mt-0.5">
                                Reviewing: {allVendors.find(v => v.id === order.current_vendor_offer)?.name || "..."}
                              </p>
                            )}
                            {order.vendors_tried && order.vendors_tried.length > 0 && (
                              <p className="text-[10px] text-red-500 mt-0.5">
                                Declined: {order.vendors_tried.map(id => allVendors.find(v => v.id === id)?.name || "Unknown").join(", ")}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 relative">
                            <div className="flex items-center gap-1.5">
                              {/* Status Update */}
                              <div className="relative">
                                <button
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setVendorDropdown(null);
                                    setStatusDropdown(
                                      statusDropdown === order.id
                                        ? null
                                        : order.id
                                    );
                                  }}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                                >
                                  Status
                                  <ChevronDown size={12} />
                                </button>
                                {statusDropdown === order.id && (
                                  <div
                                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 min-w-[170px]"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  >
                                    {STATUS_OPTIONS.filter(
                                      (s) => s !== order.status
                                    ).map((status) => (
                                      <button
                                        key={status}
                                        onClick={() =>
                                          handleStatusUpdate(order.id, status)
                                        }
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                      >
                                        <span
                                          className={`w-2 h-2 rounded-full ${
                                            STATUS_COLORS[status].split(" ")[0]
                                          }`}
                                        />
                                        {STATUS_LABELS[status]}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Vendor Reassign */}
                              <div className="relative">
                                <button
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setStatusDropdown(null);
                                    setVendorDropdown(
                                      vendorDropdown === order.id ? null : order.id
                                    );
                                  }}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg transition-colors font-medium"
                                >
                                  <Store size={11} />
                                  Assign
                                </button>
                                {vendorDropdown === order.id && (
                                  <div
                                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 min-w-[200px]"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                  >
                                    <p className="px-3 py-1.5 text-[10px] text-text-secondary uppercase tracking-wide font-semibold">Assign to Vendor</p>
                                    {allVendors.map((v) => (
                                      <button
                                        key={v.id}
                                        onClick={() => reassignVendor(order.id, v.id)}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                                          order.vendor_id === v.id ? "bg-primary-light font-semibold text-primary" : ""
                                        }`}
                                      >
                                        <Store size={12} className={order.vendor_id === v.id ? "text-primary" : "text-text-secondary"} />
                                        <div>
                                          <span>{v.name}</span>
                                          {v.area && <span className="text-text-secondary ml-1">({v.area})</span>}
                                        </div>
                                        {order.vendor_id === v.id && <CheckCircle2 size={12} className="text-primary ml-auto" />}
                                      </button>
                                    ))}
                                    {allVendors.length === 0 && (
                                      <p className="px-3 py-2 text-xs text-text-secondary italic">No vendors available</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ═══ VENDORS TAB ═══ */}
        {activeTab === "vendors" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Vendors ({vendorStoreList.length})
              </h2>
            </div>

            {/* ── Quick Create Vendor (Step 1: name + phone) ── */}
            <div className="bg-surface shadow-card rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-text-primary mb-1 flex items-center gap-2">
                <Plus size={18} className="text-primary" />
                Create New Vendor
              </h3>
              <p className="text-xs text-text-secondary mb-4">Enter vendor name and phone. A login PIN will be auto-generated. Send these credentials to the vendor so they can log into the Vendor Portal and complete their profile.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Vendor/Business Name *</label>
                  <input type="text" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)}
                    placeholder="e.g. AquaPure Kilimani" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Phone Number *</label>
                  <input type="text" value={newVendorPhone} onChange={(e) => setNewVendorPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleQuickCreateVendor()} />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleQuickCreateVendor}
                    disabled={!newVendorName.trim() || !newVendorPhone.trim()}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      newVendorName.trim() && newVendorPhone.trim()
                        ? "bg-primary text-white hover:bg-[#1a5a9a]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Create Vendor Account
                  </button>
                </div>
              </div>

              {/* Show generated credentials */}
              {createdVendorCredentials && (
                <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Vendor Account Created!
                  </h4>
                  <p className="text-xs text-green-700 mb-3">Send these credentials to <strong>{createdVendorCredentials.name}</strong> so they can log in at <strong>/vendor-login</strong>:</p>
                  <div className="bg-white rounded-lg p-3 space-y-1.5 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Phone:</span>
                      <span className="font-bold text-text-primary">{createdVendorCredentials.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">PIN:</span>
                      <span className="font-bold text-primary text-lg">{createdVendorCredentials.pin}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        const text = `MiMaji Vendor Login\nPhone: ${createdVendorCredentials.phone}\nPIN: ${createdVendorCredentials.pin}\nLogin at: /vendor-login`;
                        navigator.clipboard.writeText(text).catch(() => {});
                      }}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      Copy Credentials
                    </button>
                    <button
                      onClick={() => setCreatedVendorCredentials(null)}
                      className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Vendor Store Vendors (created via admin) ── */}
            {vendorStoreList.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-primary mb-3">Your Vendors ({vendorStoreList.length})</h3>
                <div className="space-y-4 mb-6">
                  {vendorStoreList.map((vendor) => {
                    const isExpanded = expandedVendorId === vendor.id;
                    const isEditing = editingStoreVendor === vendor.id;
                    const v = isEditing ? { ...vendor, ...storeVendorEdits } : vendor;
                    return (
                      <div key={vendor.id} className="bg-surface shadow-card rounded-2xl border-2 border-primary/20 overflow-hidden">
                        {/* Header row - always visible */}
                        <div className={`p-4 flex items-center justify-between cursor-pointer ${vendor.active === false ? "opacity-50" : ""}`} onClick={() => setExpandedVendorId(isExpanded ? null : vendor.id)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${vendor.active === false ? "bg-gray-100" : "bg-primary-light"}`}>
                              <Store size={18} className={vendor.active === false ? "text-gray-400" : "text-primary"} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-text-primary">{vendor.name}</h3>
                                {vendor.verified && <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><CheckCircle2 size={10} /> Verified</span>}
                                {vendor.active === false && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">Inactive</span>}
                              </div>
                              <p className="text-xs text-text-secondary">{formatPhoneDisplay(vendor.phone)} &middot; PIN: <span className="font-mono font-bold text-primary">{vendor.credentials.pin}</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">{vendor.products.filter((p) => p.available).length} products</span>
                            <ChevronDown size={16} className={`text-text-secondary transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </div>

                        {/* Expanded detail view */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 p-4 space-y-4">
                            {/* Login Credentials */}
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Vendor Login Credentials</p>
                              {isEditing ? (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <label className="text-[10px] text-text-secondary">Login Phone</label>
                                    <input type="text" value={(storeVendorEdits.credentials?.phone ?? vendor.credentials.phone)}
                                      onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, credentials: { phone: e.target.value, pin: storeVendorEdits.credentials?.pin ?? vendor.credentials.pin }, phoneNumbers: [e.target.value, ...(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers).slice(1)] })}
                                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-text-secondary">PIN (4 digits)</label>
                                    <div className="flex gap-2">
                                      <input type="text" maxLength={4} value={(storeVendorEdits.credentials?.pin ?? vendor.credentials.pin)}
                                        onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, credentials: { phone: storeVendorEdits.credentials?.phone ?? vendor.credentials.phone, pin: e.target.value.replace(/\D/g, "").slice(0, 4) } })}
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono font-bold outline-none focus:border-primary" />
                                      <button onClick={() => { const newPin = Math.floor(1000 + Math.random() * 9000).toString(); setStoreVendorEdits({ ...storeVendorEdits, credentials: { phone: storeVendorEdits.credentials?.phone ?? vendor.credentials.phone, pin: newPin } }); }}
                                        className="px-3 py-2 bg-primary text-white rounded-lg text-[10px] font-semibold hover:bg-primary/90 whitespace-nowrap">Reset PIN</button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-xs text-text-secondary">Phone:</span>
                                    <p className="font-mono font-bold">{formatPhoneDisplay(vendor.credentials.phone)}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-text-secondary">PIN:</span>
                                    <p className="font-mono font-bold text-primary text-lg">{vendor.credentials.pin}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Verified & Active Status */}
                            {isEditing && (
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={storeVendorEdits.verified ?? vendor.verified}
                                    onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, verified: e.target.checked })}
                                    className="rounded" />
                                  <span className="text-xs font-semibold text-green-700">Verified Vendor</span>
                                </label>
                              </div>
                            )}

                            {/* Basic Info */}
                            <div>
                              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Business Details</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {isEditing ? (
                                  <>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Business Name</label>
                                      <input type="text" value={v.name} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Area</label>
                                      <input type="text" value={v.area} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, area: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. Kilimani, Nairobi" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Business Reg No</label>
                                      <input type="text" value={v.businessRegNo} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, businessRegNo: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">M-Pesa Number</label>
                                      <input type="text" value={v.mpesaNumber} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, mpesaNumber: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Description</label>
                                      <input type="text" value={v.description} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Delivery Radius (km)</label>
                                      <input type="number" value={v.deliveryRadius} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, deliveryRadius: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-text-secondary">Min Order</label>
                                      <input type="text" value={v.minOrder} onChange={(e) => setStoreVendorEdits({ ...storeVendorEdits, minOrder: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 20L" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                    <div className="flex justify-between"><span className="text-text-secondary">Area</span><span className="text-text-primary">{vendor.area || "Not set"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Biz Reg No</span><span className="font-mono text-text-primary">{vendor.businessRegNo || "Not set"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">M-Pesa</span><span className="font-mono text-text-primary">{vendor.mpesaNumber || "Not set"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Radius</span><span className="text-text-primary">{vendor.deliveryRadius} km</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Phone(s)</span><span className="text-text-primary">{vendor.phoneNumbers.filter(Boolean).join(", ") || vendor.phone}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Description</span><span className="text-text-primary">{vendor.description || "Not set"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Min Order</span><span className="text-text-primary">{vendor.minOrder || "Not set"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Verified</span><span className={vendor.verified ? "text-green-700 font-semibold" : "text-text-secondary"}>{vendor.verified ? "Yes" : "No"}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Created</span><span className="text-text-primary">{new Date(vendor.createdAt).toLocaleDateString()}</span></div>
                                    <div className="flex justify-between"><span className="text-text-secondary">Last Updated</span><span className="text-text-primary">{new Date(vendor.updatedAt).toLocaleDateString()}</span></div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Products & Prices */}
                            <div>
                              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Products & Prices</p>
                              {isEditing ? (
                                <div className="space-y-2">
                                  {(storeVendorEdits.products || vendor.products).map((product, pi) => (
                                    <div key={product.id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                                      <input type="checkbox" checked={product.available}
                                        onChange={(e) => {
                                          const prods = [...(storeVendorEdits.products || vendor.products)];
                                          prods[pi] = { ...prods[pi], available: e.target.checked };
                                          setStoreVendorEdits({ ...storeVendorEdits, products: prods });
                                        }}
                                        className="rounded" />
                                      <span className="text-xs font-semibold min-w-[120px]">{product.name}</span>
                                      <div className="flex gap-2 flex-1">
                                        <div>
                                          <label className="text-[10px] text-text-secondary">New (KES)</label>
                                          <input type="number" value={product.priceNew}
                                            onChange={(e) => {
                                              const prods = [...(storeVendorEdits.products || vendor.products)];
                                              prods[pi] = { ...prods[pi], priceNew: Number(e.target.value) };
                                              setStoreVendorEdits({ ...storeVendorEdits, products: prods });
                                            }}
                                            className="w-20 border border-gray-200 rounded px-2 py-1 text-xs font-mono outline-none focus:border-primary" />
                                        </div>
                                        <div>
                                          <label className="text-[10px] text-text-secondary">Refill (KES)</label>
                                          <input type="number" value={product.priceRefill}
                                            onChange={(e) => {
                                              const prods = [...(storeVendorEdits.products || vendor.products)];
                                              prods[pi] = { ...prods[pi], priceRefill: Number(e.target.value) };
                                              setStoreVendorEdits({ ...storeVendorEdits, products: prods });
                                            }}
                                            className="w-20 border border-gray-200 rounded px-2 py-1 text-xs font-mono outline-none focus:border-primary" />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead><tr className="text-text-secondary text-left border-b"><th className="pb-1 pr-4">Product</th><th className="pb-1 pr-4">Size</th><th className="pb-1 pr-4">New Price</th><th className="pb-1 pr-4">Refill Price</th><th className="pb-1">Status</th></tr></thead>
                                    <tbody>
                                      {vendor.products.map((p) => (
                                        <tr key={p.id} className={`border-b border-gray-50 ${!p.available ? "opacity-40" : ""}`}>
                                          <td className="py-1.5 pr-4 font-medium">{p.name}</td>
                                          <td className="py-1.5 pr-4">{p.size}</td>
                                          <td className="py-1.5 pr-4 font-mono">KES {p.priceNew}</td>
                                          <td className="py-1.5 pr-4 font-mono">{p.priceRefill > 0 ? `KES ${p.priceRefill}` : "N/A"}</td>
                                          <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${p.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{p.available ? "Active" : "Inactive"}</span></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>

                            {/* Service Times */}
                            <div>
                              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Service Times</p>
                              {isEditing ? (
                                <div className="space-y-2">
                                  {(storeVendorEdits.serviceTimes || vendor.serviceTimes).map((st, si) => (
                                    <div key={st.day} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                                      <input type="checkbox" checked={st.open}
                                        onChange={(e) => {
                                          const times = [...(storeVendorEdits.serviceTimes || vendor.serviceTimes)];
                                          times[si] = { ...times[si], open: e.target.checked };
                                          setStoreVendorEdits({ ...storeVendorEdits, serviceTimes: times });
                                        }}
                                        className="rounded" />
                                      <span className="text-xs font-semibold w-20">{st.day.slice(0, 3)}</span>
                                      <input type="time" value={st.openTime} disabled={!st.open}
                                        onChange={(e) => {
                                          const times = [...(storeVendorEdits.serviceTimes || vendor.serviceTimes)];
                                          times[si] = { ...times[si], openTime: e.target.value };
                                          setStoreVendorEdits({ ...storeVendorEdits, serviceTimes: times });
                                        }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-primary disabled:opacity-40" />
                                      <span className="text-text-secondary text-xs">to</span>
                                      <input type="time" value={st.closeTime} disabled={!st.open}
                                        onChange={(e) => {
                                          const times = [...(storeVendorEdits.serviceTimes || vendor.serviceTimes)];
                                          times[si] = { ...times[si], closeTime: e.target.value };
                                          setStoreVendorEdits({ ...storeVendorEdits, serviceTimes: times });
                                        }}
                                        className="border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-primary disabled:opacity-40" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {vendor.serviceTimes.map((st) => (
                                    <div key={st.day} className={`text-xs px-3 py-2 rounded-lg ${st.open ? "bg-green-50 text-green-800" : "bg-gray-50 text-gray-400"}`}>
                                      <span className="font-semibold">{st.day.slice(0, 3)}</span>
                                      {st.open ? <span className="ml-1">{st.openTime} - {st.closeTime}</span> : <span className="ml-1">Closed</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Brands & Areas (edit mode) */}
                            {isEditing && (
                              <div className="space-y-4">
                                {/* Brands */}
                                <div>
                                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Brands Stocked</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {waterBrands.map((brand) => {
                                      const brands = storeVendorEdits.brands ?? vendor.brands;
                                      const isSelected = brands.includes(brand.id);
                                      return (
                                        <button key={brand.id}
                                          onClick={() => {
                                            const current = [...(storeVendorEdits.brands ?? vendor.brands)];
                                            setStoreVendorEdits({ ...storeVendorEdits, brands: isSelected ? current.filter((b) => b !== brand.id) : [...current, brand.id] });
                                          }}
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
                                        >
                                          {brand.name}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Areas Served */}
                                <div>
                                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Areas Served</p>
                                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                    {NAIROBI_AREAS.map((area) => {
                                      const areas = storeVendorEdits.areasServed ?? vendor.areasServed;
                                      const isSelected = areas.includes(area);
                                      return (
                                        <button key={area}
                                          onClick={() => {
                                            const current = [...(storeVendorEdits.areasServed ?? vendor.areasServed)];
                                            setStoreVendorEdits({ ...storeVendorEdits, areasServed: isSelected ? current.filter((a) => a !== area) : [...current, area] });
                                          }}
                                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${isSelected ? "bg-[#2ECC71] text-white" : "bg-gray-50 text-text-secondary hover:bg-gray-100"}`}
                                        >
                                          {area}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Store Locations */}
                                <div>
                                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Store Locations</p>
                                  {(storeVendorEdits.locations ?? vendor.locations).map((loc, li) => (
                                    <div key={li} className="bg-gray-50 rounded-lg p-3 mb-2">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-semibold text-text-secondary">Location {li + 1}</span>
                                        {(storeVendorEdits.locations ?? vendor.locations).length > 1 && (
                                          <button onClick={() => {
                                            const locs = [...(storeVendorEdits.locations ?? vendor.locations)];
                                            locs.splice(li, 1);
                                            setStoreVendorEdits({ ...storeVendorEdits, locations: locs });
                                          }} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                                        )}
                                      </div>
                                      <input type="text" value={loc.name}
                                        onChange={(e) => {
                                          const locs = [...(storeVendorEdits.locations ?? vendor.locations)];
                                          locs[li] = { ...locs[li], name: e.target.value };
                                          setStoreVendorEdits({ ...storeVendorEdits, locations: locs });
                                        }}
                                        placeholder="Location name"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary mb-2" />
                                      <AddressSearch
                                        placeholder="Search address..."
                                        initialValue={loc.area}
                                        onSelect={(result) => {
                                          const locs = [...(storeVendorEdits.locations ?? vendor.locations)];
                                          locs[li] = { ...locs[li], area: result.area || result.displayName.split(",").slice(1, 3).join(",").trim(), lat: result.lat, lng: result.lng };
                                          setStoreVendorEdits({ ...storeVendorEdits, locations: locs });
                                        }}
                                      />
                                      {loc.lat !== 0 && loc.lng !== 0 && (
                                        <p className="text-[10px] text-text-secondary font-mono mt-1">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</p>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const locs = [...(storeVendorEdits.locations ?? vendor.locations)];
                                      locs.push({ id: `${vendor.id}-loc${locs.length + 1}`, name: "", area: "", lat: 0, lng: 0 });
                                      setStoreVendorEdits({ ...storeVendorEdits, locations: locs });
                                    }}
                                    className="text-primary text-xs font-semibold flex items-center gap-1 mt-1"
                                  >
                                    <Plus size={12} /> Add Location
                                  </button>
                                </div>

                                {/* Phone Numbers */}
                                <div>
                                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Phone Numbers</p>
                                  {(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers).map((ph, pi) => (
                                    <div key={pi} className="flex items-center gap-2 mb-2">
                                      <input type="text" value={ph}
                                        onChange={(e) => {
                                          const phones = [...(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers)];
                                          phones[pi] = e.target.value;
                                          setStoreVendorEdits({ ...storeVendorEdits, phoneNumbers: phones });
                                        }}
                                        placeholder="e.g. 0712345678"
                                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-primary" />
                                      {(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers).length > 1 && (
                                        <button onClick={() => {
                                          const phones = [...(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers)];
                                          phones.splice(pi, 1);
                                          setStoreVendorEdits({ ...storeVendorEdits, phoneNumbers: phones });
                                        }} className="text-red-500"><Trash2 size={12} /></button>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const phones = [...(storeVendorEdits.phoneNumbers ?? vendor.phoneNumbers), ""];
                                      setStoreVendorEdits({ ...storeVendorEdits, phoneNumbers: phones });
                                    }}
                                    className="text-primary text-xs font-semibold flex items-center gap-1"
                                  >
                                    <Plus size={12} /> Add Phone
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Brands, Areas, Locations (read-only view) */}
                            {!isEditing && (
                              <div className="space-y-2">
                                {vendor.brands.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Brands</p>
                                    <div className="flex flex-wrap gap-1">
                                      {vendor.brands.map((b) => (
                                        <span key={b} className="bg-primary-light text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">{waterBrands.find((wb) => wb.id === b)?.name || b}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {vendor.areasServed.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Areas Served</p>
                                    <div className="flex flex-wrap gap-1">
                                      {vendor.areasServed.map((a) => (
                                        <span key={a} className="bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{a}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {vendor.locations.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">Locations</p>
                                    {vendor.locations.map((loc) => (
                                      <div key={loc.id} className="text-xs text-text-primary flex items-center gap-1 mb-0.5">
                                        <MapPin size={10} className="text-primary" /> {loc.name} {loc.area && `(${loc.area})`}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="pt-3 border-t border-gray-100 flex gap-2">
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleSaveStoreVendor(vendor.id)}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors">
                                    <CheckCircle2 size={14} /> Save Changes
                                  </button>
                                  <button onClick={() => { setEditingStoreVendor(null); setStoreVendorEdits({}); }}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => { setEditingStoreVendor(vendor.id); setStoreVendorEdits({}); }}
                                    className="flex-1 flex items-center justify-center gap-1 text-xs py-2.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg font-medium transition-colors">
                                    <Edit3 size={14} /> Edit Details
                                  </button>
                                  {vendor.active === false ? (
                                    <button onClick={() => handleReactivateVendor(vendor.id)}
                                      className="flex items-center justify-center gap-1 text-xs py-2.5 px-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors">
                                      <CheckCircle2 size={14} /> Reactivate
                                    </button>
                                  ) : deleteStoreVendorConfirm === vendor.id ? (
                                    <div className="flex gap-1">
                                      <button onClick={() => handleDeleteStoreVendor(vendor.id)}
                                        className="px-4 py-2.5 bg-red-500 text-white rounded-lg text-xs font-medium">Confirm Deactivate</button>
                                      <button onClick={() => setDeleteStoreVendorConfirm(null)}
                                        className="px-4 py-2.5 bg-gray-100 rounded-lg text-xs font-medium">Cancel</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setDeleteStoreVendorConfirm(vendor.id)}
                                      className="flex items-center justify-center gap-1 text-xs py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                                      <Ban size={14} /> Deactivate
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {vendorStoreList.length === 0 && (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <Store size={32} className="text-text-secondary mx-auto mb-3 opacity-50" />
                <p className="text-text-secondary text-sm">No vendors yet. Create your first vendor above.</p>
              </div>
            )}

          </section>
        )}

        {/* ═══ SUBSCRIPTIONS TAB ═══ */}
        {activeTab === "subscriptions" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                Subscriptions ({subscriptions.length})
              </h2>
              <button
                onClick={() => setShowAddSub(!showAddSub)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={14} />
                Add Subscription
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              When customers contact via WhatsApp to subscribe, add their subscription here. It will appear in their account.
            </p>

            {/* Add Subscription Form */}
            {showAddSub && (
              <div className="bg-surface shadow-card rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary mb-4">Activate New Subscription</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Customer Name *</label>
                    <input type="text" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                      placeholder="e.g. John Doe" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Phone Number *</label>
                    <input type="text" value={newSub.phone} onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
                      placeholder="e.g. 254758434076" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Jugs Per Month (2-20) *</label>
                    <input type="number" min="2" max="20" value={newSub.jugs} onChange={(e) => setNewSub({ ...newSub, jugs: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1 block">Price Per Jug (KES)</label>
                    <input type="number" value={newSub.pricePerJug} onChange={(e) => setNewSub({ ...newSub, pricePerJug: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="mt-3 bg-primary-light rounded-lg p-3">
                  <p className="text-sm font-semibold text-primary">
                    Monthly Total: KES {((parseInt(newSub.jugs) || 0) * (parseInt(newSub.pricePerJug) || 0)).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={addSubscription} disabled={!newSub.name || !newSub.phone}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${newSub.name && newSub.phone ? "bg-primary text-white hover:bg-[#1a5a9a]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                    Activate Subscription
                  </button>
                  <button onClick={() => setShowAddSub(false)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Subscriptions Table */}
            {subscriptions.length === 0 ? (
              <div className="bg-surface shadow-card rounded-2xl px-5 py-16 text-center">
                <AlertCircle size={32} className="mx-auto mb-3 opacity-40" />
                <p className="font-medium text-text-secondary">No subscriptions yet</p>
                <p className="text-sm text-text-secondary mt-1">Add subscriptions for customers who contact via WhatsApp.</p>
              </div>
            ) : (
              <div className="bg-surface shadow-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-text-secondary text-left text-xs uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Plan</th>
                        <th className="px-4 py-3 font-medium">Jugs/Month</th>
                        <th className="px-4 py-3 font-medium">Price/Jug</th>
                        <th className="px-4 py-3 font-medium">Monthly Total</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Start Date</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-text-primary">{sub.userName}</td>
                          <td className="px-4 py-3 font-mono text-xs">+{sub.userPhone.replace(/^254/, "254 ")}</td>
                          <td className="px-4 py-3 text-xs">{sub.planName}</td>
                          <td className="px-4 py-3 font-semibold">{sub.jugsPerMonth}</td>
                          <td className="px-4 py-3">{formatKES(sub.pricePerJug)}</td>
                          <td className="px-4 py-3 font-semibold">{formatKES(sub.monthlyTotal)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              sub.status === "active" ? "bg-green-100 text-green-800" :
                              sub.status === "paused" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-text-secondary text-xs whitespace-nowrap">{formatOrderDate(sub.startDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {sub.status === "active" ? (
                                <button onClick={() => toggleSubscriptionStatus(sub.id, "paused")}
                                  className="text-xs px-2.5 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg font-medium transition-colors">
                                  Pause
                                </button>
                              ) : sub.status === "paused" ? (
                                <button onClick={() => toggleSubscriptionStatus(sub.id, "active")}
                                  className="text-xs px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-800 rounded-lg font-medium transition-colors">
                                  Resume
                                </button>
                              ) : null}
                              {deleteSubConfirm === sub.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteSubscription(sub.id)}
                                    className="text-xs px-2 py-1.5 bg-red-500 text-white rounded-lg font-medium">Confirm</button>
                                  <button onClick={() => setDeleteSubConfirm(null)}
                                    className="text-xs px-2 py-1.5 bg-gray-100 rounded-lg font-medium">No</button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteSubConfirm(sub.id)}
                                  className="text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === "analytics" && (
          <section className="space-y-6">
            {/* Orders by status */}
            <div className="bg-surface shadow-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Orders by Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {STATUS_OPTIONS.map((status) => (
                  <div
                    key={status}
                    className="text-center p-3 rounded-xl bg-gray-50"
                  >
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${STATUS_COLORS[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                    <p className="text-2xl font-bold text-text-primary">
                      {statusCounts[status] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface shadow-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Droplets size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Total Litres Delivered
                    </p>
                    <p className="text-2xl font-bold text-text-primary">
                      {totalLitres.toLocaleString()}L
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-surface shadow-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Package size={20} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">
                      Total Bottles Delivered
                    </p>
                    <p className="text-2xl font-bold text-text-primary">
                      {totalBottles.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue by day chart */}
            <div className="bg-surface shadow-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Calendar size={18} />
                Revenue — Last 7 Days
              </h2>
              <div className="space-y-3">
                {revenueByDay.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16 shrink-0">
                      {day.label}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-7 relative overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.max(
                            (day.revenue / maxRevenue) * 100,
                            day.revenue > 0 ? 8 : 0
                          )}%`,
                        }}
                      >
                        {day.revenue > 0 && (
                          <span className="text-[10px] text-white font-medium whitespace-nowrap">
                            {formatKES(day.revenue)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary w-20 text-right shrink-0">
                      {day.count} order{day.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
              {revenueByDay.every((d) => d.revenue === 0) && (
                <p className="text-center text-text-secondary text-sm mt-4">
                  No revenue data for the last 7 days.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === "users" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-text-primary">
                User Accounts ({users.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${showPasswords ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
                <button
                  onClick={() => setShowCreateUser(!showCreateUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white hover:bg-primary/90 rounded-lg font-medium transition-colors"
                >
                  <Plus size={12} /> Create Account
                </button>
                <button
                  onClick={loadUsers}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={12} /> Reload
                </button>
              </div>
            </div>

            {/* Create Account Form */}
            {showCreateUser && (
              <div className="bg-surface shadow-card rounded-2xl p-5">
                <h3 className="font-semibold text-sm text-text-primary mb-3">Create New Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <input
                    type="text"
                    placeholder="Phone (e.g. 0712345678)"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={createUserAccount}
                      disabled={!newUser.phone || !newUser.name || !newUser.password}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCreateUser(false)}
                      className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-surface shadow-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text-secondary text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">User ID</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      {showPasswords && <th className="px-4 py-3 font-medium">Password</th>}
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">USR-{u.id.slice(0, 6).toUpperCase()}</td>
                        <td className="px-4 py-3 font-mono text-xs">{u.phone ? `+${u.phone.replace(/^254/, "254 ")}` : "—"}</td>
                        <td className="px-4 py-3">
                          {editingUser?.id === u.id ? (
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-full max-w-[180px] outline-none focus:border-primary"
                            />
                          ) : (
                            <span className="font-medium text-text-primary">{u.name || <span className="text-text-secondary italic">No name</span>}</span>
                          )}
                        </td>
                        {showPasswords && (
                          <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                            {u.password || <span className="italic text-gray-400">N/A (Supabase)</span>}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          {editingUser?.id === u.id ? (
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary"
                            >
                              <option value="customer">Customer</option>
                              <option value="admin">Admin</option>
                              <option value="vendor">Vendor</option>
                            </select>
                          ) : (
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                              u.role === "admin" ? "bg-purple-100 text-purple-800" :
                              u.role === "vendor" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {editingUser?.id === u.id ? (
                              <>
                                <button
                                  onClick={() => updateUser(u.id, { name: editingUser.name, role: editingUser.role })}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors"
                                >
                                  <CheckCircle2 size={12} /> Save
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                >
                                  <XCircle size={12} /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                {!DEMO_IDS.includes(u.id) && (
                                  <>
                                    <button
                                      onClick={() => setEditingUser({ ...u })}
                                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg font-medium transition-colors"
                                    >
                                      <Edit3 size={12} /> Edit
                                    </button>
                                    {deleteUserConfirm === u.id ? (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => deleteUser(u.id)}
                                          className="text-xs px-2 py-1.5 bg-red-500 text-white rounded-lg font-medium"
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => setDeleteUserConfirm(null)}
                                          className="text-xs px-2 py-1.5 bg-gray-100 rounded-lg font-medium"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteUserConfirm(u.id)}
                                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                                      >
                                        <Trash2 size={12} /> Delete
                                      </button>
                                    )}
                                  </>
                                )}
                                {DEMO_IDS.includes(u.id) && (
                                  <span className="text-xs text-text-secondary italic">Demo account</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ═══ CANCEL CONFIRMATION MODAL ═══ */}
        {cancelConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCancelConfirm(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary">Cancel Order?</h3>
                  <p className="text-sm text-text-secondary">This action cannot be undone</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-red-800 font-medium">Refund Required</p>
                <p className="text-sm text-red-700 mt-1">
                  Customer should be refunded <span className="font-bold">{formatKES(cancelConfirm.amount)}</span> via M-PESA.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Order ID: {formatOrderId(cancelConfirm.orderId)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel & Refund
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Detail Popup */}
        {itemsPopup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setItemsPopup(null)}>
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">Order Items</h3>
                <button onClick={() => setItemsPopup(null)} className="text-text-secondary hover:text-text-primary"><XCircle size={18} /></button>
              </div>
              <p className="text-xs text-text-secondary mb-3">{formatOrderId(itemsPopup.orderId)}</p>
              <div className="space-y-2">
                {itemsPopup.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{item.name}</p>
                      <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-text-primary">{formatKES(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-text-secondary">Total</span>
                <span className="text-sm font-bold text-text-primary">{formatKES(itemsPopup.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SUPPORT NOTE (always visible at bottom) ═══ */}
        <div className="bg-surface shadow-card rounded-2xl p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <MessageCircle size={20} className="text-success" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              Support Requests
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">
              Customer support requests are handled via WhatsApp at{" "}
              <a
                href="https://wa.me/254758434076"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium hover:underline"
              >
                +254 758 434 076
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-text-secondary pb-4">
          Last refreshed:{" "}
          {lastRefresh.toLocaleTimeString("en-KE", {
            timeZone: "Africa/Nairobi",
          })}{" "}
          EAT &middot; MiMaji Admin v1.0
        </footer>
      </main>
    </div>
  );
}

// ── Stat Card ──
function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className="bg-surface shadow-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-text-secondary truncate">
            {label}
          </p>
          <p className="text-lg sm:text-xl font-bold text-text-primary truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

