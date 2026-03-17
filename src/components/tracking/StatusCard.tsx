"use client";

import { OrderStatus } from "@/types";

const statusConfig: Record<
  string,
  { label: string; description: string; bg: string; text: string }
> = {
  pending_payment: {
    label: "Awaiting Payment",
    description: "Complete the M-Pesa payment on your phone",
    bg: "bg-amber-50",
    text: "text-warning",
  },
  paid: {
    label: "Payment Confirmed",
    description: "Finding your nearest distributor...",
    bg: "bg-blue-50",
    text: "text-blue-500",
  },
  confirmed: {
    label: "Order Confirmed",
    description: "Order accepted — preparing for dispatch",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    description: "Your order left the depot — est. 25–45 min",
    bg: "bg-amber-50",
    text: "text-warning",
  },
  delivered: {
    label: "Delivered!",
    description: "All done! Enjoy your fresh water",
    bg: "bg-emerald-50",
    text: "text-success",
  },
  cancelled: {
    label: "Cancelled",
    description: "This order has been cancelled",
    bg: "bg-red-50",
    text: "text-error",
  },
};

export default function StatusCard({ status }: { status: OrderStatus }) {
  const s = statusConfig[status] || statusConfig.paid;

  return (
    <div
      className={`${s.bg} rounded-2xl p-5 animate-fade-in`}
    >
      <div className={`font-bold ${s.text} text-base mb-1`}>{s.label}</div>
      <div className="text-text-mid text-sm">{s.description}</div>
    </div>
  );
}
