"use client";

import { useState } from "react";
import { Package, TrendingUp, Users, Clock, MapPin, Star, Bell, Settings, LogOut, ChevronRight, CheckCircle, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const mockOrders = [
  { id: "ORD-101", customer: "Jane M.", items: "2x 20L Hard Jug", total: 1000, status: "pending", time: "5 min ago", address: "Kilimani, Nairobi" },
  { id: "ORD-102", customer: "John K.", items: "1x 10L Soft Bottle", total: 280, status: "in_transit", time: "15 min ago", address: "Westlands, Nairobi" },
  { id: "ORD-103", customer: "Mary W.", items: "3x 20L Soft Bottle", total: 1350, status: "delivered", time: "1 hour ago", address: "Lavington, Nairobi" },
  { id: "ORD-104", customer: "Peter N.", items: "1x 5L Soft Bottle", total: 150, status: "pending", time: "2 min ago", address: "Karen, Nairobi" },
];

const stats = [
  { label: "Today's Orders", value: "24", icon: Package, color: "#2979C1" },
  { label: "Revenue (Today)", value: "KES 12,400", icon: TrendingUp, color: "#2ECC71" },
  { label: "Active Customers", value: "156", icon: Users, color: "#F5A623" },
  { label: "Avg. Delivery", value: "28 min", icon: Clock, color: "#E8544E" },
];

export default function VendorPortalPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "stats">("orders");

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Vendor Portal" showBack={true} />

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <VendorContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopVendorNav />
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary">Vendor Dashboard</h1>
              <p className="text-text-secondary">AquaPure Kilimani — Welcome back</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2">
                <Bell size={16} /> Notifications
              </button>
              <button className="bg-surface shadow-card rounded-xl px-4 py-2 text-sm font-medium text-text-primary hover:shadow-card-hover transition-shadow flex items-center gap-2">
                <Settings size={16} /> Settings
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
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
              <h2 className="font-bold text-base text-text-primary">Recent Orders</h2>
              <span className="text-primary text-sm font-semibold cursor-pointer">View All</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0F0F0]">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Order</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Address</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-secondary uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-background transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.items}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{order.address}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">KES {order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      {order.status === "pending" && (
                        <button className="bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1a5a9a] transition-colors">
                          Accept
                        </button>
                      )}
                      {order.status === "in_transit" && (
                        <button className="bg-[#2ECC71] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-[#27ae60] transition-colors">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function VendorContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: "orders" | "stats") => void }) {
  return (
    <>
      {/* Vendor Header */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-5 text-white mb-4">
        <p className="text-white/70 text-xs">Welcome back</p>
        <p className="text-xl font-extrabold">AquaPure Kilimani</p>
        <div className="flex items-center gap-2 mt-2">
          <Star size={14} className="text-rating fill-rating" />
          <span className="text-sm">4.8 rating — 156 reviews</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => {
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
          {mockOrders.map((order) => (
            <div key={order.id} className="bg-surface shadow-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-text-primary">{order.id}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-text-primary font-medium">{order.customer}</p>
              <p className="text-xs text-text-secondary">{order.items}</p>
              <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                <MapPin size={12} /> {order.address}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="font-bold text-text-primary">KES {order.total.toLocaleString()}</span>
                <span className="text-text-secondary text-xs">{order.time}</span>
              </div>
              {order.status === "pending" && (
                <button className="w-full mt-3 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">
                  Accept Order
                </button>
              )}
              {order.status === "in_transit" && (
                <button className="w-full mt-3 bg-[#2ECC71] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-colors">
                  Mark Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "stats" && (
        <div className="bg-surface shadow-card rounded-xl p-5">
          <h3 className="font-bold text-sm text-text-primary mb-4">This Week</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Total Orders</span>
              <span className="font-bold text-text-primary">142</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Revenue</span>
              <span className="font-bold text-text-primary">KES 68,400</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Avg. Order Value</span>
              <span className="font-bold text-text-primary">KES 482</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Delivery Success Rate</span>
              <span className="font-bold text-[#2ECC71]">98.6%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Customer Satisfaction</span>
              <span className="font-bold text-rating">4.8/5</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    pending: { label: "Pending", bg: "bg-[#FFF5EC]", text: "text-[#F5A623]" },
    in_transit: { label: "In Transit", bg: "bg-primary-light", text: "text-primary" },
    delivered: { label: "Delivered", bg: "bg-[#E8F5E9]", text: "text-[#2ECC71]" },
  };
  const c = config[status] || config.pending;
  return (
    <span className={`${c.bg} ${c.text} text-xs px-2.5 py-1 rounded-full font-semibold`}>
      {c.label}
    </span>
  );
}

function DesktopVendorNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo1" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
          <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full font-semibold ml-2">Vendor</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/vendor-portal" className="text-primary font-medium text-sm">Dashboard</Link>
          <Link href="/vendor-portal" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Orders</Link>
          <Link href="/vendor-portal" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Analytics</Link>
          <button className="text-text-secondary hover:text-cta-alt font-medium text-sm transition-colors flex items-center gap-1">
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
