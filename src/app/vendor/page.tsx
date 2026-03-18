"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";

type VendorTab = "overview" | "orders" | "earnings" | "settings";

const demoOrders = [
  { id: "VD-001", customer: "Jane W.", address: "Kilimani, Nairobi", quantity: 3, total: 1140, status: "pending", time: "10 min ago" },
  { id: "VD-002", customer: "Peter M.", address: "Westlands, Nairobi", quantity: 2, total: 800, status: "in_transit", time: "25 min ago" },
  { id: "VD-003", customer: "Mary K.", address: "Lavington, Nairobi", quantity: 5, total: 1900, status: "delivered", time: "1 hour ago" },
  { id: "VD-004", customer: "John O.", address: "Karen, Nairobi", quantity: 1, total: 420, status: "delivered", time: "2 hours ago" },
];

export default function VendorPage() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<VendorTab>("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="text-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg font-body">
        <Navbar />
        <div className="px-4 py-16 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-blue-900 mb-2">Vendor Portal</h1>
          <p className="text-text-mid text-sm mb-6">Sign in to manage your kiosk, orders, and earnings.</p>
          <div className="flex flex-col gap-3">
            <Link href="/login"><Button size="lg" onClick={() => localStorage.setItem("mimaji-redirect", "/vendor")}>Log In</Button></Link>
            <Link href="/join/provider"><Button variant="outline" size="lg">Register as Vendor</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs: { key: VendorTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "Orders" },
    { key: "earnings", label: "Earnings" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-8 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {user.fullName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">{user.fullName}&apos;s Kiosk</h1>
              <p className="text-text-mid text-xs">Vendor Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-10 pb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.key ? "bg-blue-700 text-white shadow-sm" : "bg-white text-text-mid hover:bg-blue-50"
              }`}
              style={tab !== t.key ? { boxShadow: "var(--shadow-soft)" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Today's Orders", value: "12", sub: "+3 from yesterday" },
                { label: "Revenue (Today)", value: "KES 4,800", sub: "+15%" },
                { label: "Pending Delivery", value: "4", sub: "2 urgent" },
                { label: "Rating", value: "4.8", sub: "128 reviews" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="text-xs text-text-mid mb-1">{stat.label}</div>
                  <div className="text-xl font-bold text-blue-900">{stat.value}</div>
                  <div className="text-[10px] text-text-light">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Recent Orders</h3>
              <div className="space-y-3">
                {demoOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">{order.customer}</div>
                      <div className="text-xs text-text-mid">{order.address} &middot; {order.quantity} jugs</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-700 text-sm">KES {order.total}</div>
                      <div className={`text-[10px] font-semibold ${
                        order.status === "pending" ? "text-warning" : order.status === "delivered" ? "text-success" : "text-blue-700"
                      }`}>
                        {order.status === "pending" ? "Pending" : order.status === "in_transit" ? "In Transit" : "Delivered"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {demoOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-blue-700 text-sm">#{order.id}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.status === "pending" ? "bg-amber-50 text-warning" : order.status === "delivered" ? "bg-emerald-50 text-success" : "bg-blue-50 text-blue-700"
                  }`}>
                    {order.status === "pending" ? "Pending" : order.status === "in_transit" ? "In Transit" : "Delivered"}
                  </span>
                </div>
                <div className="text-sm text-text-mid">{order.customer} &middot; {order.address}</div>
                <div className="text-sm text-text-mid mb-3">{order.quantity} jugs &middot; KES {order.total} &middot; {order.time}</div>
                {order.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Accept</Button>
                    <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "earnings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 text-center" style={{ boxShadow: "var(--shadow-elevated)" }}>
              <div className="text-xs text-text-mid mb-1">Total Earnings (This Month)</div>
              <div className="text-3xl font-bold text-blue-900 mb-1">KES 48,600</div>
              <div className="text-xs text-success font-semibold">+12% from last month</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="text-lg font-bold text-blue-900">156</div>
                <div className="text-xs text-text-mid">Orders Fulfilled</div>
              </div>
              <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="text-lg font-bold text-blue-900">KES 312</div>
                <div className="text-xs text-text-mid">Avg per Order</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Recent Payouts</h3>
              <div className="space-y-2">
                {[
                  { date: "Mar 15", amount: "KES 12,400", status: "Paid" },
                  { date: "Mar 8", amount: "KES 11,200", status: "Paid" },
                  { date: "Mar 1", amount: "KES 13,000", status: "Paid" },
                ].map((payout) => (
                  <div key={payout.date} className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl">
                    <span className="text-sm text-blue-900 font-medium">{payout.date}</span>
                    <div className="text-right">
                      <span className="font-bold text-blue-900 text-sm">{payout.amount}</span>
                      <span className="text-[10px] text-success ml-2">{payout.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Kiosk Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Kiosk Name</label>
                  <input type="text" defaultValue="MiMaji Water Point - Kilimani" className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Location</label>
                  <input type="text" defaultValue="Kilimani, Nairobi" className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Operating Hours</label>
                  <input type="text" defaultValue="8:00 AM - 7:00 PM" className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
                </div>
                <Button size="lg">Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
