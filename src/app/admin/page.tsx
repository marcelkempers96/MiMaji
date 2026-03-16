"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Badge from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";

type AdminNav = "overview" | "orders" | "distributors" | "zones" | "pricing";

interface DistributorEntry {
  id: string;
  name: string;
  phone: string;
  zone: string;
  todayDeliveries: number;
  active: boolean;
}

interface ZoneEntry {
  id: string;
  name: string;
  active: boolean;
  distributorCount: number;
}

export default function AdminPage() {
  const [nav, setNav] = useState<AdminNav>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo distributors
  const [distributors] = useState<DistributorEntry[]>([
    { id: "1", name: "Depot A — Westlands", phone: "0722 XXX XXX", zone: "Westlands", todayDeliveries: 12, active: true },
    { id: "2", name: "Depot B — Kilimani", phone: "0733 XXX XXX", zone: "Kilimani", todayDeliveries: 9, active: true },
    { id: "3", name: "Depot C — Karen", phone: "0711 XXX XXX", zone: "Karen", todayDeliveries: 4, active: false },
  ]);

  // Demo zones
  const [zones] = useState<ZoneEntry[]>([
    { id: "1", name: "Westlands", active: true, distributorCount: 3 },
    { id: "2", name: "Kilimani", active: true, distributorCount: 2 },
    { id: "3", name: "Karen", active: true, distributorCount: 1 },
    { id: "4", name: "Kileleshwa", active: true, distributorCount: 2 },
    { id: "5", name: "CBD", active: true, distributorCount: 1 },
    { id: "6", name: "Parklands", active: false, distributorCount: 0 },
    { id: "7", name: "Langata", active: true, distributorCount: 1 },
    { id: "8", name: "Embakasi", active: false, distributorCount: 0 },
    { id: "9", name: "Kasarani", active: false, distributorCount: 0 },
    { id: "10", name: "Thika Road", active: false, distributorCount: 0 },
  ]);

  // Pricing
  const [jugPrice, setJugPrice] = useState("200");
  const [deliveryFee, setDeliveryFee] = useState("100");

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setOrders(data);
    } else {
      setOrders([
        { id: "a1b2c3d4", customer_id: "", distributor_id: "Depot A", zone_id: "", delivery_address: "Kilimani", lat: 0, lng: 0, quantity: 2, price_total: 500, status: "out_for_delivery" as OrderStatus, mpesa_ref: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "e5f6g7h8", customer_id: "", distributor_id: "Depot B", zone_id: "", delivery_address: "Lavington", lat: 0, lng: 0, quantity: 3, price_total: 700, status: "confirmed" as OrderStatus, mpesa_ref: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "i9j0k1l2", customer_id: "", distributor_id: "Depot A", zone_id: "", delivery_address: "Westlands", lat: 0, lng: 0, quantity: 4, price_total: 900, status: "delivered" as OrderStatus, mpesa_ref: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "m3n4o5p6", customer_id: "", distributor_id: "Depot C", zone_id: "", delivery_address: "Karen", lat: 0, lng: 0, quantity: 1, price_total: 300, status: "delivered" as OrderStatus, mpesa_ref: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const todayOrders = orders.length || 34;
  const todayRevenue = orders.reduce((a, o) => a + o.price_total, 0) || 17000;
  const activeDistributors = distributors.filter((d) => d.active).length;
  const pendingOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;

  const zoneStats = [
    { zone: "Westlands", count: 12, pct: 34 },
    { zone: "Kilimani", count: 9, pct: 26 },
    { zone: "Karen", count: 7, pct: 20 },
    { zone: "Lavington", count: 4, pct: 12 },
    { zone: "CBD", count: 2, pct: 8 },
  ];

  const navItems: [AdminNav, string][] = [
    ["overview", "📊 Overview"],
    ["orders", "📦 Orders"],
    ["distributors", "🚐 Distributors"],
    ["zones", "🗺 Zones"],
    ["pricing", "💰 Pricing"],
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar variant="admin" />

      {/* Nav tabs */}
      <div className="bg-white border-b border-blue-200 flex overflow-x-auto px-2">
        {navItems.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setNav(id)}
            className={`px-3.5 py-3 whitespace-nowrap text-xs font-semibold border-b-[2.5px] transition-all ${
              nav === id
                ? "text-blue-700 border-blue-700"
                : "text-text-mid border-transparent hover:text-blue-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* OVERVIEW */}
        {nav === "overview" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl text-blue-900 font-bold mb-3.5">
              Today&apos;s Overview
            </h2>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                { label: "Orders Today", value: todayOrders.toString(), icon: "📦" },
                { label: "Revenue Today", value: `KES ${(todayRevenue / 1000).toFixed(0)}K`, icon: "💰" },
                { label: "Active Distributors", value: activeDistributors.toString(), icon: "🚐" },
                { label: "Pending Orders", value: pendingOrders.toString(), icon: "⏳" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="bg-white rounded-xl p-3.5 border border-blue-200"
                >
                  <div className="text-lg mb-1">{kpi.icon}</div>
                  <div className="font-display text-[22px] font-bold text-blue-900">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] text-text-mid">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Zone breakdown */}
            <div className="bg-white rounded-xl p-3.5 border border-blue-200">
              <div className="font-bold text-blue-900 text-sm mb-2.5">
                Orders by Zone
              </div>
              {zoneStats.map((z) => (
                <div key={z.zone} className="mb-2">
                  <div className="flex justify-between text-xs text-text-mid mb-1">
                    <span>{z.zone}</span>
                    <span>{z.count} orders</span>
                  </div>
                  <div className="bg-blue-100 rounded h-1.5">
                    <div
                      className="h-full bg-blue-500 rounded transition-all"
                      style={{ width: `${z.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {nav === "orders" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl text-blue-900 font-bold mb-3.5">
              All Orders
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              <div className="space-y-2.5">
                {orders.map((o) => {
                  const shortId = `MJ-${o.id.slice(0, 4).toUpperCase()}`;
                  return (
                    <div
                      key={o.id}
                      className="bg-white rounded-xl p-3.5 border border-blue-200"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-display font-bold text-blue-500 text-sm">
                          #{shortId}
                        </span>
                        <Badge status={o.status} />
                      </div>
                      <div className="text-xs text-text-mid">
                        📍 {o.delivery_address} · {o.quantity} jugs ·{" "}
                        <strong>KES {o.price_total}</strong>
                      </div>
                      <div className="text-[11px] text-text-light mt-0.5">
                        🚐 {o.distributor_id || "Unassigned"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DISTRIBUTORS */}
        {nav === "distributors" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl text-blue-900 font-bold mb-3.5">
              Distributors
            </h2>
            <div className="space-y-2.5 mb-4">
              {distributors.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-xl p-3.5 border border-blue-200"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-900 text-sm">
                      {d.name}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        d.active
                          ? "text-success bg-emerald-50"
                          : "text-error bg-red-50"
                      }`}
                    >
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-xs text-text-mid">
                    {d.phone} · Zone: {d.zone}
                  </div>
                  <div className="text-xs text-text-mid mt-0.5">
                    Today: {d.todayDeliveries} deliveries
                  </div>
                </div>
              ))}
            </div>
            <Button size="lg">+ Add Distributor</Button>
          </div>
        )}

        {/* ZONES */}
        {nav === "zones" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl text-blue-900 font-bold mb-3.5">
              Delivery Zones
            </h2>
            <div className="space-y-2.5 mb-4">
              {zones.map((z) => (
                <div
                  key={z.id}
                  className="bg-white rounded-xl p-3.5 border border-blue-200 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-blue-900 text-sm">
                      {z.name}
                    </div>
                    <div className="text-xs text-text-mid">
                      {z.distributorCount} distributor{z.distributorCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                      z.active
                        ? "text-success bg-emerald-50"
                        : "text-text-light bg-gray-100"
                    }`}
                  >
                    {z.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
            <Button size="lg">+ Add Zone</Button>
          </div>
        )}

        {/* PRICING */}
        {nav === "pricing" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-xl text-blue-900 font-bold mb-3.5">
              Pricing
            </h2>
            <div className="bg-white rounded-xl p-4 border border-blue-200 mb-3.5">
              <div className="font-bold text-blue-900 text-sm mb-3">
                Base Pricing
              </div>
              {[
                {
                  label: "Price per 20L jug",
                  value: jugPrice,
                  onChange: setJugPrice,
                },
                {
                  label: "Base delivery fee",
                  value: deliveryFee,
                  onChange: setDeliveryFee,
                },
              ].map((field) => (
                <div key={field.label} className="mb-3">
                  <div className="text-xs text-text-mid mb-1">
                    {field.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-mid text-sm">KES</span>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="flex-1 px-3 py-2 border-[1.5px] border-blue-200 rounded-lg text-sm font-bold text-blue-900 bg-blue-50"
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button size="lg">Save Pricing</Button>
          </div>
        )}
      </div>
    </div>
  );
}
