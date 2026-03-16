"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Badge from "@/components/shared/Badge";
import OTPLogin from "@/components/shared/OTPLogin";
import Button from "@/components/shared/Button";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types";
import { useRouter } from "next/navigation";

type TabFilter = "all" | "active" | "delivered";

export default function OrdersPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState<TabFilter>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setOrders(data);
    } else {
      // Demo data
      setOrders([
        {
          id: "a1b2c3d4",
          customer_id: "",
          distributor_id: null,
          zone_id: "",
          delivery_address: "Kilimani, Nairobi",
          lat: -1.29,
          lng: 36.78,
          quantity: 2,
          price_total: 500,
          status: "out_for_delivery" as OrderStatus,
          mpesa_ref: "QK8N3F2G",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "e5f6g7h8",
          customer_id: "",
          distributor_id: null,
          zone_id: "",
          delivery_address: "Westlands, Nairobi",
          lat: -1.26,
          lng: 36.81,
          quantity: 4,
          price_total: 900,
          status: "delivered" as OrderStatus,
          mpesa_ref: "RT5M2K9L",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "i9j0k1l2",
          customer_id: "",
          distributor_id: null,
          zone_id: "",
          delivery_address: "Karen, Nairobi",
          lat: -1.32,
          lng: 36.71,
          quantity: 1,
          price_total: 300,
          status: "delivered" as OrderStatus,
          mpesa_ref: "LP3Q7W8X",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) fetchOrders();
  }, [authenticated, fetchOrders]);

  const filteredOrders =
    tab === "active"
      ? orders.filter(
          (o) => o.status !== "delivered" && o.status !== "cancelled"
        )
      : tab === "delivered"
        ? orders.filter((o) => o.status === "delivered")
        : orders;

  const activeCount = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;
  const deliveredCount = orders.filter(
    (o) => o.status === "delivered"
  ).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return `Today ${date.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" })}`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-KE", { weekday: "short", hour: "numeric", minute: "2-digit" });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <div className="px-4 py-12">
          <OTPLogin
            title="View your orders"
            onVerified={(p) => {
              setPhone(p);
              setAuthenticated(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <div className="px-4 py-5">
        <h1 className="text-[22px] text-blue-900 font-bold mb-1">
          Your Orders
        </h1>
        <p className="text-text-mid text-xs mb-5">
          +{phone.slice(0, 6)} *** ***
        </p>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(
            [
              ["all", `All (${orders.length})`],
              ["active", `Active (${activeCount})`],
              ["delivered", `Delivered (${deliveredCount})`],
            ] as [TabFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-[1.5px] transition-all capitalize ${
                tab === key
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-blue-500 border-blue-200 hover:border-blue-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💧</div>
            <div className="font-bold text-blue-900 mb-1">No orders yet</div>
            <div className="text-text-mid text-sm mb-4">
              Place your first order!
            </div>
            <Button onClick={() => router.push("/")}>Order Water</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const shortId = `MJ-${order.id.slice(0, 4).toUpperCase()}`;
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm animate-fade-in"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-blue-500 text-sm">
                      #{shortId}
                    </span>
                    <Badge status={order.status} />
                  </div>
                  <div className="text-sm text-text-mid mb-1">
                    📍 {order.delivery_address}
                  </div>
                  <div className="text-sm text-text-mid mb-3">
                    💧 {order.quantity} jug{order.quantity > 1 ? "s" : ""} · KES{" "}
                    {order.price_total} · {formatTime(order.created_at)}
                  </div>
                  <Button
                    variant={
                      order.status !== "delivered" ? "primary" : "outline"
                    }
                    size="md"
                    className="w-full"
                    onClick={() =>
                      order.status !== "delivered"
                        ? router.push(`/order/${order.id}`)
                        : router.push("/")
                    }
                  >
                    {order.status !== "delivered"
                      ? "Track Order →"
                      : "Order Again →"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
