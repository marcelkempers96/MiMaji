"use client";

import { calculateTotal, getPricingTable } from "@/lib/pricing";
import { useState } from "react";

interface PriceBreakdownProps {
  quantity: number;
}

export default function PriceBreakdown({ quantity }: PriceBreakdownProps) {
  const [showTiers, setShowTiers] = useState(false);
  const { pricePerJug, subtotal, total, savings } = calculateTotal(quantity);
  const tiers = getPricingTable();

  return (
    <div className="bg-blue-50 rounded-xl p-3.5 text-sm">
      <div className="flex justify-between text-text-mid mb-1.5">
        <span>
          {quantity} jug{quantity > 1 ? "s" : ""} × KES {pricePerJug}
        </span>
        <span className="transition-all duration-200">KES {subtotal}</span>
      </div>
      <div className="flex justify-between text-text-mid mb-2">
        <span>Delivery fee</span>
        <span className="text-success font-semibold">FREE</span>
      </div>
      {savings > 0 && (
        <div className="flex justify-between text-success text-xs mb-2">
          <span>You save</span>
          <span className="font-bold">- KES {savings}</span>
        </div>
      )}
      <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-900 text-[15px]">
        <span>Total</span>
        <span className="transition-all duration-200">KES {total}</span>
      </div>

      {/* Pricing tiers toggle */}
      <button
        onClick={() => setShowTiers(!showTiers)}
        className="mt-2 text-blue-500 text-xs font-semibold w-full text-center"
      >
        {showTiers ? "Hide pricing ▲" : "Order more, save more ▼"}
      </button>

      {showTiers && (
        <div className="mt-2 bg-white rounded-lg p-2.5 border border-blue-200 animate-fade-in">
          <div className="grid grid-cols-3 gap-1 text-[11px]">
            {tiers.map((tier) => (
              <div
                key={tier.qty}
                className={`text-center py-1.5 px-1 rounded ${
                  (tier.qty === "9+" && quantity >= 9) ||
                  (tier.qty !== "9+" && parseInt(tier.qty) === quantity)
                    ? "bg-blue-700 text-white font-bold"
                    : "text-text-mid"
                }`}
              >
                <div className="font-semibold">{tier.qty}</div>
                <div>KES {tier.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
