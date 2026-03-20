"use client";

import React, { useState, useEffect, useCallback } from "react";
import { OrderRecord, formatOrderId, formatOrderDate, fetchAllOrders, updateOrderStatus } from "@/lib/orders";
import { VendorInfo, MOCK_VENDORS } from "@/lib/vendor";
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
} from "lucide-react";

// ── Types ──
type Tab = "overview" | "orders" | "vendors" | "analytics" | "users";

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

// ── Component ──
export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [kenyaTime, setKenyaTime] = useState(getKenyaTime());
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [cancelConfirm, setCancelConfirm] = useState<{ orderId: string; amount: number } | null>(null);

  // Users management
  interface MockUser { id: string; phone: string; name: string; role: string }
  const [users, setUsers] = useState<MockUser[]>([]);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);

  // Vendor management
  const [editingVendor, setEditingVendor] = useState<string | null>(null);
  const [vendorEdits, setVendorEdits] = useState<Partial<VendorInfo>>({});

  // Demo account IDs (used to identify built-in accounts)
  const DEMO_IDS = ["d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d"];

  function loadUsers() {
    const builtIn: MockUser[] = [
      { id: "d1a0e4f2-8b3c-4e7a-9f1d-2c5b8a6e3d0f", phone: "254758434076", name: "MiMaji Admin", role: "admin" },
      { id: "v7b2c9d1-3e5f-4a8b-b6d4-1f9e0a7c5b2d", phone: "254712345678", name: "AquaPure Kilimani", role: "vendor" },
    ];
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      const signups = raw ? JSON.parse(raw) : {};
      const signupUsers: MockUser[] = Object.values(signups).map((s: unknown) => {
        const su = s as { user: MockUser };
        return su.user;
      });
      setUsers([...builtIn, ...signupUsers]);
    } catch {
      setUsers(builtIn);
    }
  }

  function updateUser(userId: string, updates: Partial<MockUser>) {
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      const signups = raw ? JSON.parse(raw) : {};
      for (const [phone, entry] of Object.entries(signups)) {
        const e = entry as { password: string; user: MockUser };
        if (e.user.id === userId) {
          e.user = { ...e.user, ...updates };
          signups[phone] = e;
        }
      }
      localStorage.setItem("mimaji_mock_signups", JSON.stringify(signups));
      loadUsers();
    } catch {}
    setEditingUser(null);
  }

  function deleteUser(userId: string) {
    try {
      const raw = localStorage.getItem("mimaji_mock_signups");
      const signups = raw ? JSON.parse(raw) : {};
      for (const [phone, entry] of Object.entries(signups)) {
        const e = entry as { password: string; user: MockUser };
        if (e.user.id === userId) {
          delete signups[phone];
        }
      }
      localStorage.setItem("mimaji_mock_signups", JSON.stringify(signups));
      loadUsers();
    } catch {}
    setDeleteUserConfirm(null);
  }

  const loadOrders = useCallback(() => {
    fetchAllOrders().then((data) => {
      setOrders(data);
      setLastRefresh(new Date());
    });
  }, []);

  // Initial load + polling
  useEffect(() => {
    loadOrders();
    loadUsers();
    const orderInterval = setInterval(loadOrders, 10_000);
    const clockInterval = setInterval(() => setKenyaTime(getKenyaTime()), 1_000);
    return () => {
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
  const totalVendors = MOCK_VENDORS.length;

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
    await updateOrderStatus(orderId, newStatus);
    // Refresh from source of truth
    loadOrders();
    setStatusDropdown(null);
  }

  async function confirmCancel() {
    if (!cancelConfirm) return;
    await updateOrderStatus(cancelConfirm.orderId, "cancelled");
    // Refresh from source of truth
    loadOrders();
    setCancelConfirm(null);
  }

  // ── Tab buttons ──
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { id: "orders", label: "Orders", icon: <ShoppingCart size={16} /> },
    { id: "vendors", label: "Vendors", icon: <Store size={16} /> },
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
                      <th className="px-4 py-3 font-medium">Payment</th>
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
                          <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                            {formatOrderDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {(() => {
                              const u = users.find((u) => u.id === order.customer_id);
                              return u ? (
                                <span className="font-medium text-text-primary">{u.name}</span>
                              ) : (
                                <span className="font-mono text-text-secondary">{truncate(order.customer_id, 12)}</span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            {order.order_items && order.order_items.length > 0
                              ? order.order_items
                                  .map((i: { name: string; quantity: number; price: number }) => `${i.quantity}x ${i.name}`)
                                  .join(", ")
                              : order.product_name || "—"}
                          </td>
                          <td className="px-4 py-3 text-text-secondary max-w-[200px]">
                            <span title={order.delivery_address}>
                              {truncate(order.delivery_address, 25)}
                            </span>
                            {order.delivery_address_details?.additionalDirections && (
                              <p className="text-[11px] italic truncate" title={order.delivery_address_details.additionalDirections}>
                                {truncate(order.delivery_address_details.additionalDirections, 30)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold whitespace-nowrap">
                            {formatKES(order.price_total)}
                          </td>
                          <td className="px-4 py-3">
                            {order.mpesa_ref ? (
                              <span className="text-xs font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded">
                                {order.mpesa_ref}
                              </span>
                            ) : order.status === "pending_payment" ? (
                              <span className="text-xs text-yellow-600">
                                Pending
                              </span>
                            ) : (
                              <span className="text-xs text-text-secondary">
                                Cash
                              </span>
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
                            {order.vendor_name || (
                              <span className="text-text-secondary italic">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 relative">
                            <div className="relative">
                              <button
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  setStatusDropdown(
                                    statusDropdown === order.id
                                      ? null
                                      : order.id
                                  );
                                }}
                                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                              >
                                Update
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
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Registered Vendors ({MOCK_VENDORS.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {MOCK_VENDORS.map((vendor) => (
                <div key={vendor.id} className="bg-surface shadow-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={vendorEdits.name ?? vendor.name}
                          onChange={(e) => setVendorEdits({ ...vendorEdits, name: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold outline-none focus:border-primary w-full"
                        />
                      ) : (
                        <h3 className="font-semibold text-text-primary">{vendor.name}</h3>
                      )}
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={vendorEdits.area ?? vendor.area}
                          onChange={(e) => setVendorEdits({ ...vendorEdits, area: e.target.value })}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs mt-1 outline-none focus:border-primary w-full"
                        />
                      ) : (
                        <p className="text-sm text-text-secondary">{vendor.area}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                      <span className="text-rating text-sm">&#9733;</span>
                      <span className="text-xs font-semibold text-text-primary">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-text-secondary">Locations</p>
                      <p className="font-semibold text-text-primary">{vendor.locations.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-text-secondary">Orders</p>
                      <p className="font-semibold text-text-primary">{vendorOrderCount(vendor.id)}</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Biz Reg No</span>
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={vendorEdits.businessRegNo ?? vendor.businessRegNo}
                          onChange={(e) => setVendorEdits({ ...vendorEdits, businessRegNo: e.target.value })}
                          className="border border-gray-200 rounded px-1.5 py-0.5 font-mono text-xs outline-none focus:border-primary w-28 text-right"
                        />
                      ) : (
                        <span className="font-mono text-text-primary">{vendor.businessRegNo}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">M-Pesa</span>
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={vendorEdits.mpesaNumber ?? vendor.mpesaNumber}
                          onChange={(e) => setVendorEdits({ ...vendorEdits, mpesaNumber: e.target.value })}
                          className="border border-gray-200 rounded px-1.5 py-0.5 font-mono text-xs outline-none focus:border-primary w-28 text-right"
                        />
                      ) : (
                        <span className="font-mono text-text-primary">{vendor.mpesaNumber}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Hours</span>
                      {editingVendor === vendor.id ? (
                        <input
                          type="text"
                          value={vendorEdits.hours ?? vendor.hours}
                          onChange={(e) => setVendorEdits({ ...vendorEdits, hours: e.target.value })}
                          className="border border-gray-200 rounded px-1.5 py-0.5 text-xs outline-none focus:border-primary w-28 text-right"
                        />
                      ) : (
                        <span className="text-text-primary">{vendor.hours}</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Reviews</span>
                      <span className="text-text-primary">{vendor.reviews}</span>
                    </div>
                  </div>

                  {/* Edit/Save buttons */}
                  <div className="pt-2 border-t border-gray-100 flex gap-2">
                    {editingVendor === vendor.id ? (
                      <>
                        <button
                          onClick={() => {
                            // In mock mode, vendor data is in-memory only; edits are visual feedback
                            Object.assign(vendor, vendorEdits);
                            setEditingVendor(null);
                            setVendorEdits({});
                          }}
                          className="flex-1 flex items-center justify-center gap-1 text-xs py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors"
                        >
                          <CheckCircle2 size={12} /> Save
                        </button>
                        <button
                          onClick={() => { setEditingVendor(null); setVendorEdits({}); }}
                          className="flex-1 flex items-center justify-center gap-1 text-xs py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingVendor(vendor.id); setVendorEdits({}); }}
                        className="flex-1 flex items-center justify-center gap-1 text-xs py-2 bg-blue-50 hover:bg-blue-100 text-primary rounded-lg font-medium transition-colors"
                      >
                        <Edit3 size={12} /> Edit Vendor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">
                User Accounts ({users.length})
              </h2>
              <button
                onClick={loadUsers}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={12} /> Reload
              </button>
            </div>

            <div className="bg-surface shadow-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-text-secondary text-left text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">User ID</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">USR-{u.id.slice(0, 6).toUpperCase()}</td>
                        <td className="px-4 py-3 font-mono text-xs">+{u.phone.replace(/^254/, "254 ")}</td>
                        <td className="px-4 py-3">
                          {editingUser?.id === u.id ? (
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-full max-w-[180px] outline-none focus:border-primary"
                            />
                          ) : (
                            <span className="font-medium text-text-primary">{u.name}</span>
                          )}
                        </td>
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

