"use client";

import { OrderStatus } from "@/types";

const statusConfig: Record<
  string,
  { label: string; icon: string; description: string; bg: string; border: string; text: string }
> = {
  pending_payment: {
    label: "Awaiting Payment",
    icon: "⏳",
    description: "Complete the M-Pesa payment on your phone",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-warning",
  },
  paid: {
    label: "Payment Confirmed",
    icon: "💳",
    description: "Finding your nearest distributor...",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-500",
  },
  confirmed: {
    label: "Order Confirmed",
    icon: "🏭",
    description: "Order accepted — preparing for dispatch",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: "🚐",
    description: "Your order left the depot — est. 25–45 min",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-warning",
  },
  delivered: {
    label: "Delivered!",
    icon: "💧",
    description: "All done! Enjoy your fresh water 🎉",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: "❌",
    description: "This order has been cancelled",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-error",
  },
};

export default function StatusCard({ status }: { status: OrderStatus }) {
  const s = statusConfig[status] || statusConfig.paid;

  return (
    <div
      className={`${s.bg} rounded-2xl p-5 border-[1.5px] ${s.border} animate-fade-in`}
    >
      <div className="text-[28px] mb-1.5">{s.icon}</div>
      <div className={`font-bold ${s.text} text-base mb-1`}>{s.label}</div>
      <div className="text-text-mid text-sm">{s.description}</div>
    </div>
  );
}
