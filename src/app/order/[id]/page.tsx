"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import StatusStepper from "@/components/tracking/StatusStepper";
import StatusCard from "@/components/tracking/StatusCard";
import Button from "@/components/shared/Button";
import { OrderStatus } from "@/types";
import { supabase } from "@/lib/supabase";

interface OrderData {
  id: string;
  status: OrderStatus;
  quantity: number;
  delivery_address: string;
  price_total: number;
  mpesa_ref: string | null;
  created_at: string;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPaymentStep = searchParams.get("step") === "payment";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch order
  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setOrder(data);
      } else {
        // Demo fallback
        setOrder({
          id,
          status: isPaymentStep ? "pending_payment" : "paid",
          quantity: 2,
          delivery_address: "Kilimani, Nairobi",
          price_total: 500,
          mpesa_ref: isPaymentStep ? null : "QK8N3F2G",
          created_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id, isPaymentStep]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const updated = payload.new as OrderData;
          setOrder((prev) => (prev ? { ...prev, ...updated } : null));
          // Auto-redirect from payment page when paid
          if (
            isPaymentStep &&
            updated.status !== "pending_payment"
          ) {
            router.replace(`/order/${id}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, isPaymentStep, router]);

  // Payment timeout counter
  useEffect(() => {
    if (!isPaymentStep) return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaymentStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar minimal />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar minimal />
        <div className="text-center py-20 text-text-mid">Order not found</div>
      </div>
    );
  }

  const remaining = Math.max(0, 120 - elapsed);
  const progressPct = Math.min(100, (elapsed / 120) * 100);
  const shortId = `MJ-${id.slice(0, 4).toUpperCase()}`;

  // Payment pending view
  if (isPaymentStep && order.status === "pending_payment") {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar minimal />
        <div className="flex flex-col items-center px-6 pt-12 text-center">
          <div className="mb-4 animate-pulse-drop">
            <Image src="/images/mpesa-logo.png" alt="M-Pesa" width={64} height={64} className="mx-auto" />
          </div>
          <h1 className="text-[22px] font-bold text-blue-900 mb-2">
            Check your phone
          </h1>
          <p className="text-text-mid text-sm mb-6">
            Sending M-Pesa prompt to
            <br />
            <strong className="text-blue-700">+254 7** *** ***</strong>
          </p>

          {/* Progress */}
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-md mb-6">
            <div className="flex items-center justify-center gap-2 mb-3 text-warning font-bold text-sm">
              ⏱ Waiting for payment...
            </div>
            <div className="bg-blue-200 rounded h-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-text-light">
              Expires in {Math.floor(remaining / 60)}:
              {(remaining % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full max-w-xs bg-white rounded-xl p-4 border border-blue-200 mb-5">
            <div className="text-text-mid text-xs mb-1">Order summary</div>
            <div className="font-bold text-blue-900 text-[15px]">
              {order.quantity} × 20L jugs — KES {order.price_total}
            </div>
            <div className="text-text-mid text-xs mt-1">
              📍 {order.delivery_address}
            </div>
          </div>

          {elapsed > 30 && (
            <Button variant="outline" className="w-full max-w-xs mb-2.5">
              Resend M-Pesa prompt
            </Button>
          )}
          <button
            onClick={() => router.push("/")}
            className="text-error text-sm font-medium"
          >
            Cancel order
          </button>
        </div>
      </div>
    );
  }

  // Order tracking view
  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <div className="px-4 py-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-blue-500 font-bold">
            ORDER #{shortId}
          </span>
        </div>
        <h1 className="text-[22px] text-blue-900 font-bold mb-5">
          {order.status === "delivered"
            ? "Water delivered! 💧"
            : order.status === "out_for_delivery"
              ? "Your water is on the way!"
              : order.status === "confirmed"
                ? "Order confirmed!"
                : "Payment confirmed!"}
        </h1>

        {/* Stepper */}
        <div className="mb-4">
          <StatusStepper status={order.status} />
        </div>

        {/* Status card */}
        <div className="mb-4">
          <StatusCard status={order.status} />
        </div>

        {/* Order details */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 mb-4">
          <div className="font-bold text-blue-900 text-sm mb-3">
            Order Details
          </div>
          <div className="space-y-2 text-sm text-text-mid">
            <div className="flex gap-2.5">
              <span>💧</span>
              <span>
                {order.quantity} × 20L water jug
                {order.quantity > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex gap-2.5">
              <span>📍</span>
              <span>{order.delivery_address}</span>
            </div>
            <div className="flex gap-2.5">
              <Image src="/images/mpesa-logo.png" alt="M-Pesa" width={16} height={16} />
              <span>KES {order.price_total} paid via M-Pesa</span>
            </div>
            {order.mpesa_ref && (
              <div className="flex gap-2.5">
                <span>🧾</span>
                <span className="font-mono text-blue-700">
                  Ref: {order.mpesa_ref}
                </span>
              </div>
            )}
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => router.push("/")}
        >
          Order Again
        </Button>
      </div>
    </div>
  );
}
