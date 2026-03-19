"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useCallback } from "react";
import { Package, TrendingUp, Users, Clock, MapPin, Star, Bell, Settings, LogOut, ChevronRight, CheckCircle, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { OrderRecord, mapOrderStatus, formatOrderDate, formatOrderId } from "@/lib/orders";
import { fetchVendorOrders, updateVendorOrderStatus, VendorStats, fetchVendorStats } from "@/lib/vendor";

export default function VendorPortalPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "stats">("orders");
  const [activeDesktopTab, setActiveDesktopTab] = useState<"dashboard" | "orders" | "analytics" | "notifications" | "settings">("dashboard");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

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

  const handleAcceptOrder = async (orderId: string) => {
    await updateVendorOrderStatus(orderId, "confirmed");
    loadOrders();
  };

  const handleCompleteOrder = async (orderId: string) => {
    await updateVendorOrderStatus(orderId, "delivered");
    loadOrders();
  };

  const handleDispatchOrder = async (orderId: string) => {
    await updateVendorOrderStatus(orderId, "out_for_delivery");
    loadOrders();
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user || user.role !== "vendor") return null;

  const pendingOrders = orders.filter((o) => o.status === "pending_payment" || o.status === "paid");
  const activeOrders = orders.filter((o) => o.status === "confirmed" || o.status === "out_for_delivery");
  const completedOrders = orders.filter((o) => o.status === "delivered");

  const statsCards = stats ? [
    { label: "Today's Orders", value: String(stats.todayOrders), icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: `KES ${stats.todayRevenue.toLocaleString()}`, icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: String(stats.totalOrders), icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: `${stats.avgDeliveryMinutes} min`, icon: Clock, color: "#E8544E" },
  ] : [
    { label: "Today's Orders", value: "—", icon: Package, color: "#2979C1" },
    { label: "Revenue (Today)", value: "—", icon: TrendingUp, color: "#2ECC71" },
    { label: "Total Orders", value: "—", icon: Users, color: "#F5A623" },
    { label: "Avg. Delivery", value: "—", icon: Clock, color: "#E8544E" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Vendor Portal" showBack={true} />

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        {/* Vendor Header */}
        <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-4">
          <p className="text-white/70 text-xs">Welcome back</p>
          <p className="text-xl font-extrabold">{user.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <Star size={14} className="text-rating fill-rating" />
            <span className="text-sm">Vendor Dashboard</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-surface shadow-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} style={{ color: stat.color }} />
                  <span className="text-text-secondary text-xs">{stat.label}</span>
                </div>
                <p className="text-lg font-extrabold text-text-primary">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "orders" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "stats" ? "bg-primary text-white" : "bg-white text-text-secondary"}`}
          >
            Analytics
          </button>
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
                  <p className="text-xs text-text-secondary">
                    {order.order_items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") || "—"}
                  </p>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {order.delivery_address}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                    <span className="text-text-secondary text-xs">{formatOrderDate(order.created_at)}</span>
                  </div>
                  {(order.status === "pending_payment" || order.status === "paid") && (
                    <button onClick={() => handleAcceptOrder(order.id)} className="w-full mt-3 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                      Accept Order
                    </button>
                  )}
                  {order.status === "confirmed" && (
                    <button onClick={() => handleDispatchOrder(order.id)} className="w-full mt-3 bg-[#F5A623] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#d4901e] transition-colors">
                      Dispatch Order
                    </button>
                  )}
                  {order.status === "out_for_delivery" && (
                    <button onClick={() => handleCompleteOrder(order.id)} className="w-full mt-3 bg-[#2ECC71] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-colors">
                      Mark Delivered
                    </button>
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
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Orders</span>
                <span className="font-bold text-text-primary">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Revenue</span>
                <span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Avg. Order Value</span>
                <span className="font-bold text-text-primary">KES {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Pending Orders</span>
                <span className="font-bold text-[#F5A623]">{pendingOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Completed Orders</span>
                <span className="font-bold text-[#2ECC71]">{completedOrders.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-surface shadow-card rounded-xl flex items-center justify-center gap-2 px-5 py-4 text-cta-alt font-medium text-sm hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopVendorNav onLogout={handleLogout} activeTab={activeDesktopTab} setActiveTab={setActiveDesktopTab} />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">Vendor Dashboard</h1>
              <p className="text-text-secondary">{user.name} — Welcome back</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveDesktopTab("notifications")}
                className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "notifications" ? "ring-2 ring-primary" : ""}`}
              >
                <Bell size={16} /> Notifications
                {pendingOrders.length > 0 && (
                  <span className="bg-cta-alt text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{pendingOrders.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveDesktopTab("settings")}
                className={`bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2 ${activeDesktopTab === "settings" ? "ring-2 ring-primary" : ""}`}
              >
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>

          {/* Notifications Panel */}
          {activeDesktopTab === "notifications" && (
            <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-text-primary">Notifications</h2>
                <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>
              {pendingOrders.length > 0 ? (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-[#FFF5EC] rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-[#F5A623]/20 flex items-center justify-center">
                        <Package size={20} className="text-[#F5A623]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">New Order: {formatOrderId(order.id)}</p>
                        <p className="text-text-secondary text-xs">{order.product_name} — KES {order.price_total.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">
                        Accept
                      </button>
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
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Truck size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-text-primary">{formatOrderId(order.id)} — {order.status === "confirmed" ? "Ready to dispatch" : "Out for delivery"}</p>
                        <p className="text-text-secondary text-xs">{order.delivery_address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Panel */}
          {activeDesktopTab === "settings" && (
            <div className="bg-surface shadow-card rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-text-primary">Vendor Settings</h2>
                <button onClick={() => setActiveDesktopTab("dashboard")} className="text-text-secondary hover:text-text-primary">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Business Name</label>
                  <input type="text" defaultValue={user.name} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Phone Number</label>
                  <input type="text" defaultValue={user.phone} readOnly className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-secondary outline-none bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Operating Hours</label>
                  <input type="text" defaultValue="7:00 AM - 8:00 PM" className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Delivery Radius (km)</label>
                  <input type="number" defaultValue={10} className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background" />
                </div>
                <button className="bg-primary text-white rounded-xl px-6 py-2.5 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {(activeDesktopTab === "dashboard" || activeDesktopTab === "orders") && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {statsCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-surface shadow-card rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                          <Icon size={20} style={{ color: stat.color }} />
                        </div>
                        <span className="text-text-secondary text-sm">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Orders Table */}
              <div className="bg-surface shadow-card rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
                  <h2 className="font-bold text-base text-text-primary">
                    {activeDesktopTab === "orders" ? "All Orders" : "Recent Orders"}
                  </h2>
                  {activeDesktopTab !== "orders" && (
                    <button onClick={() => setActiveDesktopTab("orders")} className="text-primary text-sm font-semibold cursor-pointer">View All</button>
                  )}
                </div>
                {loadingOrders ? (
                  <div className="p-8 text-center text-text-secondary">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-text-secondary">No orders yet. Orders will appear here when customers place them.</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0F0F0]">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Order</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Items</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Address</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Total</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeDesktopTab === "orders" ? orders : orders.slice(0, 10)).map((order) => (
                        <tr key={order.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-background transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">{formatOrderId(order.id)}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{order.product_name || "Water Order"}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{order.delivery_address}</td>
                          <td className="px-6 py-4 text-sm font-bold text-text-primary">KES {order.price_total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">{formatOrderDate(order.created_at)}</td>
                          <td className="px-6 py-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4">
                            {(order.status === "pending_payment" || order.status === "paid") && (
                              <button onClick={() => handleAcceptOrder(order.id)} className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">
                                Accept
                              </button>
                            )}
                            {order.status === "confirmed" && (
                              <button onClick={() => handleDispatchOrder(order.id)} className="bg-[#F5A623] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#d4901e] transition-colors">
                                Dispatch
                              </button>
                            )}
                            {order.status === "out_for_delivery" && (
                              <button onClick={() => handleCompleteOrder(order.id)} className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors">
                                Complete
                              </button>
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

          {/* Analytics Tab */}
          {activeDesktopTab === "analytics" && stats && (
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Revenue Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Today&apos;s Revenue</span>
                    <span className="font-bold text-text-primary">KES {stats.todayRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Revenue</span>
                    <span className="font-bold text-text-primary">KES {stats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Avg. Order Value</span>
                    <span className="font-bold text-text-primary">KES {stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}</span>
                  </div>
                </div>
              </div>
              <div className="bg-surface shadow-card rounded-xl p-6">
                <h3 className="font-bold text-base text-text-primary mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Total Orders</span>
                    <span className="font-bold text-text-primary">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Today&apos;s Orders</span>
                    <span className="font-bold text-text-primary">{stats.todayOrders}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Pending</span>
                    <span className="font-bold text-[#F5A623]">{pendingOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Active</span>
                    <span className="font-bold text-primary">{activeOrders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Completed</span>
                    <span className="font-bold text-[#2ECC71]">{completedOrders.length}</span>
                  </div>
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
  return (
    <span className={`${c.bg} ${c.text} text-xs px-2.5 py-1 rounded-full font-semibold`}>
      {c.label}
    </span>
  );
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
          <button onClick={onLogout} className="text-text-secondary hover:text-cta-alt font-medium text-sm transition-colors flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
