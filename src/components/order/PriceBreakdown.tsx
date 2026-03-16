"use client";

interface PriceBreakdownProps {
  quantity: number;
  jugPrice?: number;
  deliveryFee?: number;
}

export default function PriceBreakdown({
  quantity,
  jugPrice = 200,
  deliveryFee = 100,
}: PriceBreakdownProps) {
  const subtotal = quantity * jugPrice;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-blue-50 rounded-xl p-3.5 text-sm">
      <div className="flex justify-between text-text-mid mb-1.5">
        <span>
          {quantity} jug{quantity > 1 ? "s" : ""} × KES {jugPrice}
        </span>
        <span className="transition-all duration-200">KES {subtotal}</span>
      </div>
      <div className="flex justify-between text-text-mid mb-2">
        <span>Delivery fee</span>
        <span>KES {deliveryFee}</span>
      </div>
      <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-blue-900 text-[15px]">
        <span>Total</span>
        <span className="transition-all duration-200">KES {total}</span>
      </div>
    </div>
  );
}
