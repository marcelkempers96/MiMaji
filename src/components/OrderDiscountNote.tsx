"use client";

import { OrderRecord } from "@/lib/orders";

const STANDARD_DELIVERY_FEE = 100;

/**
 * Shows what a voucher took off an order. Rendered on the customer's order
 * cards, where otherwise a discounted order looks identical to a full-price
 * one and the saving is invisible.
 */
export default function OrderDiscountNote({ order }: { order: OrderRecord }) {
  const discount = order.discount_amount || 0;
  if (discount <= 0) return null;

  const deliveryWaived = discount >= STANDARD_DELIVERY_FEE;

  return (
    <div className="flex items-center gap-2 flex-wrap text-xs mt-1">
      {deliveryWaived && (
        <span className="text-text-secondary">
          Delivery <s>KES {STANDARD_DELIVERY_FEE.toLocaleString()}</s>{" "}
          <span className="text-[#2ECC71] font-semibold">FREE</span>
        </span>
      )}
      <span className="text-[#2ECC71] font-semibold">
        − KES {discount.toLocaleString()}
        {order.voucher_code ? ` · ${order.voucher_code}` : ""}
      </span>
    </div>
  );
}
