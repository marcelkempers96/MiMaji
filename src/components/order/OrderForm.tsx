"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressInput from "./AddressInput";
import QuantitySelector from "./QuantitySelector";
import PriceBreakdown from "./PriceBreakdown";
import Button from "../shared/Button";

const JUG_PRICE = 200;
const DELIVERY_FEE = 100;

export default function OrderForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [quantity, setQuantity] = useState(2);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = quantity * JUG_PRICE + DELIVERY_FEE;
  const canSubmit = address.length > 0 && phone.length >= 9 && !loading;

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 9);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const phoneFormatted = `254${phone}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_address: address,
          lat,
          lng,
          quantity,
          phone: phoneFormatted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      router.push(`/order/${data.orderId}?step=payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg -mt-6 mx-4 relative z-10 animate-fade-in">
      <div className="mb-4">
        <AddressInput
          value={address}
          onChange={(addr, la, ln) => {
            setAddress(addr);
            setLat(la);
            setLng(ln);
          }}
        />
      </div>

      <div className="mb-4">
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      <div className="mb-4">
        <PriceBreakdown
          quantity={quantity}
          jugPrice={JUG_PRICE}
          deliveryFee={DELIVERY_FEE}
        />
      </div>

      <div className="mb-5">
        <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
          📱 M-Pesa Number
        </label>
        <div className="flex border-[1.5px] border-blue-200 rounded-xl overflow-hidden bg-blue-50">
          <span className="px-3 py-2.5 bg-blue-200 text-blue-900 text-sm font-semibold whitespace-nowrap">
            +254
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="712 345 678"
            className="flex-1 px-3 py-2.5 border-none bg-transparent text-sm text-blue-900"
          />
        </div>
      </div>

      {error && (
        <div className="mb-3 text-error text-sm text-center bg-red-50 rounded-lg p-2">
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
      >
        {loading ? "Sending to your phone..." : "Order & Pay via M-Pesa"}
      </Button>

      <div className="text-center mt-2.5 text-text-light text-[11px] flex justify-center gap-4">
        <span>🔒 Secure</span>
        <span>⚡ Instant</span>
        <span>🌍 Local</span>
      </div>
    </div>
  );
}
