import { OrderStatus } from "@/types";

const statusMap: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  pending_payment: {
    label: "Awaiting Payment",
    bg: "bg-amber-50",
    text: "text-warning",
  },
  paid: { label: "Paid", bg: "bg-blue-50", text: "text-blue-700" },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  out_for_delivery: {
    label: "On the Way",
    bg: "bg-amber-50",
    text: "text-warning",
  },
  delivered: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-success",
  },
  cancelled: { label: "Cancelled", bg: "bg-red-50", text: "text-error" },
};

export default function Badge({ status }: { status: OrderStatus }) {
  const s = statusMap[status] || statusMap.paid;
  return (
    <span
      className={`${s.bg} ${s.text} rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider`}
    >
      {s.label}
    </span>
  );
}
