"use client";

import { useState } from "react";
import { Tag, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { validateVoucher, calculateDiscount } from "@/lib/vouchers";

/** Litres implied by a cart line, read off names like "20L Hard Jug". */
export function parseLitresFromName(name: string): number {
  const m = name.match(/(\d+(?:\.\d+)?)\s*L\b/i);
  return m ? parseFloat(m[1]) : 0;
}

export default function VoucherField() {
  const { user } = useAuth();
  const { items, subtotal, voucher, applyVoucher, clearVoucher } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const litres = items.reduce((s, i) => s + parseLitresFromName(i.name) * i.quantity, 0);

  const handleApply = async () => {
    const entered = code.trim().toUpperCase();
    if (!entered || checking) return;
    setChecking(true);
    setError("");
    try {
      const result = await validateVoucher(entered, user?.id || "guest", litres, subtotal);
      if (!result.valid || !result.voucher) {
        setError(result.error || "Invalid voucher code");
        return;
      }
      const d = calculateDiscount(result.voucher, subtotal);
      applyVoucher({
        code: result.voucher.code,
        freeDelivery: d.freeDelivery,
        discountAmount: d.discountAmount,
        description: result.voucher.description,
      });
      setCode("");
    } catch (e) {
      console.error("[voucher] validation failed:", e);
      setError("Could not check that code. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  if (voucher) {
    return (
      <div className="flex items-center justify-between gap-3 bg-[#E8F5E9] rounded-xl px-4 py-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Check size={16} className="text-[#2ECC71] shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{voucher.code} applied</p>
            <p className="text-xs text-text-secondary truncate">{voucher.description}</p>
          </div>
        </div>
        <button
          onClick={clearVoucher}
          aria-label={`Remove voucher ${voucher.code}`}
          className="text-text-secondary hover:text-text-primary shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Voucher code"
            aria-label="Voucher code"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold tracking-wide uppercase outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || checking}
          className="px-4 rounded-xl bg-primary text-white text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          {checking ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-cta-alt text-xs mt-1.5">{error}</p>}
    </div>
  );
}
