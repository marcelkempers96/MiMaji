"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Badge from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";

type Tab = "new" | "active" | "done";

interface DemoOrder extends Omit<Order, 'customer'> {
  customer?: { full_name: string; phone: string };
}

export default function DistributorDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("new");
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneName] = useState("Westlands");

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customer:profiles!customer_id(full_name, phone)")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setOrders(data);
    } else {
      // Demo data
      setOrders([
        {
          id: "d1e2f3g4",
          customer_id: "",
          distributor_id: null,
          zone_id: "",
          delivery_address: "14 Muthangari Rd, Kilimani",
          lat: -1.29,
          lng: 36.78,
          quantity: 2,
          price_total: 500,
          status: "paid" as OrderStatus,
          mpesa_ref: null,
          created_at: new Date(Date.now() - 180000).toISOString(),
          updated_at: new Date().toISOString(),
          customer: { full_name: "John K.", phone: "+254 720 *** ***" },
        },
        {
          id: "h5i6j7k8",
          customer_id: "",
          distributor_id: null,
          zone_id: "",
          delivery_address: "Lavington Mall Rd, Lavington",
          lat: -1.28,
          lng: 36.77,
          quantity: 3,
          price_total: 700,
          status: "paid" as OrderStatus,
          mpesa_ref: null,
          created_at: new Date(Date.now() - 420000).toISOString(),
          updated_at: new Date().toISOString(),
          customer: { full_name: "Mary W.", phone: "+254 712 *** ***" },
        },
        {
          id: "l9m0n1o2",
          customer_id: "",
          distributor_id: "dist-1",
          zone_id: "",
          delivery_address: "Valley Arcade, Lavington",
          lat: -1.28,
          lng: 36.77,
          quantity: 4,
          price_total: 900,
          status: "out_for_delivery" as OrderStatus,
          mpesa_ref: null,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          updated_at: new Date().toISOString(),
          customer: { full_name: "Peter M.", phone: "+254 733 *** ***" },
        },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("distributor-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const newOrders = orders.filter(
    (o) => o.status === "paid" || o.status === "confirmed"
  );
  const activeOrders = orders.filter(
    (o) => o.status === "out_for_delivery"
  );
  const doneOrders = orders.filter((o) => o.status === "delivered");

  const displayOrders =
    tab === "new" ? newOrders : tab === "active" ? activeOrders : doneOrders;

  const todayDelivered = doneOrders.length || 8;
  const todayEarnings = doneOrders.reduce((a, o) => a + o.price_total, 0) || 3600;

  const timeAgo = (dateStr: string) => {
    const mins = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 60000
    );
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const handleAccept = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "confirmed", distributor_id: "current-user-id" })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "confirmed" as OrderStatus } : o
      )
    );
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar variant="distributor" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar variant="distributor" />

      {/* Stats Bar */}
      <div className="bg-blue-700 px-4 py-3.5 flex justify-between">
        {[
          { label: "DELIVERED TODAY", value: todayDelivered.toString() },
          { label: "EARNED TODAY", value: `KES ${todayEarnings.toLocaleString()}` },
          { label: "PENDING", value: newOrders.length.toString() },
        ].map((stat, i) => (
          <div key={stat.label} className="text-center flex-1">
            {i > 0 && (
              <div className="float-left w-px h-10 bg-blue-500 -ml-px" />
            )}
            <div className="text-blue-200 text-[10px] font-semibold tracking-wider">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-white">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(
            [
              ["new", `New (${newOrders.length})`],
              ["active", `Active (${activeOrders.length})`],
              ["done", `Done (${todayDelivered})`],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold border-[1.5px] transition-all ${
                tab === key
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-blue-500 border-blue-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {displayOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {tab === "done" ? "💧" : "📦"}
            </div>
            <div className="text-text-mid text-sm">
              {tab === "done"
                ? `${todayDelivered} deliveries today — KES ${todayEarnings.toLocaleString()} earned`
                : "No orders right now"}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => {
              const shortId = `MJ-${order.id.slice(0, 4).toUpperCase()}`;

              if (tab === "active") {
                return (
                  <div
                    key={order.id}
                    className="bg-blue-700 rounded-2xl p-4 animate-slide-in-top"
                  >
                    <div className="text-blue-200 text-[11px] font-bold mb-1.5">
                      🚐 IN PROGRESS
                    </div>
                    <div className="font-bold text-white text-[15px] mb-1.5">
                      #{shortId} — {order.quantity} × 20L jugs
                    </div>
                    <div className="text-blue-200 text-xs mb-1">
                      📍 {order.delivery_address}
                    </div>
                    <div className="text-blue-200 text-xs mb-3.5">
                      📱 {order.customer?.phone || "N/A"} · KES{" "}
                      {order.price_total}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2.5 bg-white/15 text-white border border-white/40 rounded-xl text-xs">
                        🗺 Navigate
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 !bg-white !text-blue-700 !border-none"
                        onClick={() =>
                          handleStatusUpdate(order.id, "delivered")
                        }
                      >
                        Mark Delivered ✅
                      </Button>
                    </div>
                  </div>
                );
              }

              if (tab === "done") {
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-blue-200"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-500 text-sm">
                        #{shortId}
                      </span>
                      <Badge status={order.status} />
                    </div>
                    <div className="text-xs text-text-mid">
                      {order.quantity} jugs · KES {order.price_total} ·{" "}
                      {timeAgo(order.created_at)}
                    </div>
                  </div>
                );
              }

              // New order
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border-l-4 border-l-blue-500 shadow-md animate-slide-in-top"
                >
                  <div className="flex justify-between mb-2">
                    <span className="bg-blue-50 text-blue-500 text-[10px] font-extrabold px-2 py-0.5 rounded-lg tracking-wider">
                      🔔 NEW ORDER
                    </span>
                    <span className="text-text-light text-[11px]">
                      {timeAgo(order.created_at)}
                    </span>
                  </div>
                  <div className="font-bold text-blue-900 mb-1.5">
                    #{shortId} — {order.quantity} × 20L jugs
                  </div>
                  <div className="text-xs text-text-mid mb-0.5">
                    📍 {order.delivery_address}
                  </div>
                  <div className="text-xs text-text-mid mb-3">
                    📱 {order.customer?.phone || "N/A"} ·{" "}
                    <strong className="text-blue-700">
                      KES {order.price_total}
                    </strong>
                  </div>
                  {order.status === "confirmed" ? (
                    <div className="flex gap-2">
                      <Button
                        size="md"
                        className="flex-1"
                        onClick={() =>
                          handleStatusUpdate(order.id, "out_for_delivery")
                        }
                      >
                        🚐 Out for Delivery
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => handleAccept(order.id)}
                    >
                      Accept Order
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
