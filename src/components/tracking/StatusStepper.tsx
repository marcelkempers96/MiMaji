"use client";

import { OrderStatus } from "@/types";

const steps: { key: OrderStatus; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "confirmed", label: "Confirmed" },
  { key: "out_for_delivery", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
];

export default function StatusStepper({ status }: { status: OrderStatus }) {
  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center relative">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className="flex-1 flex flex-col items-center relative"
          >
            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div
                className={`absolute top-3.5 left-1/2 w-full h-0.5 ${
                  i < currentIdx ? "bg-blue-700" : "bg-blue-100"
                }`}
              />
            )}
            {/* Node */}
            <div
              className={`w-7 h-7 rounded-full z-10 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < currentIdx
                  ? "bg-blue-700 text-white"
                  : i === currentIdx
                    ? "bg-blue-500 text-white ring-4 ring-blue-100 animate-pulse"
                    : "bg-blue-100 text-blue-400"
              }`}
            >
              {i < currentIdx ? "\u2713" : i + 1}
            </div>
            {/* Label */}
            <span
              className={`mt-1.5 text-[9px] text-center font-medium ${
                i <= currentIdx ? "text-blue-700 font-bold" : "text-text-light"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
