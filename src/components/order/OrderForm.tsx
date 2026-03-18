"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddressInput from "./AddressInput";
import QuantitySelector from "./QuantitySelector";
import PriceBreakdown from "./PriceBreakdown";
import Button from "../shared/Button";
import { calculateTotal } from "@/lib/pricing";

export default function OrderForm() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [quantity, setQuantity] = useState(2);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);

  const { total } = calculateTotal(quantity);
  const canSubmit = address.length > 0 && phone.length >= 9 && !loading;

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 9);
  };

  const handleApplyVoucher = () => {
    if (voucherCode.trim()) {
      setVoucherApplied(true);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const isLoggedIn = localStorage.getItem("mimaji-user");
    if (!isLoggedIn) {
      localStorage.setItem(
        "mimaji-order-intent",
        JSON.stringify({ address, lat, lng, quantity, phone })
      );
      router.push("/signup");
      return;
    }

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
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      router.push(`/order/${data.orderId}?step=payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 -mt-6 mx-4 relative z-10 animate-fade-in" style={{ boxShadow: "0 8px 30px rgba(26, 58, 92, 0.1)" }}>
      <div className="mb-5">
        <AddressInput
          value={address}
          onChange={(addr, la, ln) => {
            setAddress(addr);
            setLat(la);
            setLng(ln);
          }}
        />
      </div>

      <div className="mb-5">
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>

      <div className="mb-5">
        <PriceBreakdown quantity={quantity} />
      </div>

      <div className="mb-5">
        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
          <Image src="/images/mpesa-logo.svg" alt="M-Pesa" width={20} height={20} className="inline-block" />
          M-Pesa Number
        </label>
        <div className="flex rounded-2xl overflow-hidden bg-blue-50">
          <span className="px-3 py-3 bg-blue-100 text-blue-900 text-sm font-semibold whitespace-nowrap">
            +254
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="712 345 678"
            className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
          />
        </div>
      </div>

      {/* Voucher code */}
      <div className="mb-6">
        {!showVoucher ? (
          <button
            onClick={() => setShowVoucher(true)}
            className="text-blue-700 text-sm font-semibold"
          >
            Have a voucher code?
          </button>
        ) : (
          <div className="animate-fade-in">
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Voucher Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setVoucherApplied(false);
                }}
                placeholder="Enter code"
                className="flex-1 px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 font-mono"
              />
              <Button
                size="md"
                variant={voucherApplied ? "ghost" : "outline"}
                onClick={handleApplyVoucher}
                disabled={!voucherCode.trim()}
              >
                {voucherApplied ? "Applied" : "Apply"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 text-error text-sm text-center bg-red-50 rounded-2xl p-3">
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={handleSubmit}
        loading={loading}
        disabled={!canSubmit}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? "Sending to your phone..." : (
            <>
              Order &amp; Pay KES {total} via
              <Image src="/images/mpesa-logo.svg" alt="M-Pesa" width={24} height={24} className="inline-block" />
              M-Pesa
            </>
          )}
        </span>
      </Button>

      <div className="text-center mt-3 text-text-light text-[11px] flex justify-center gap-4">
        <span>Secure</span>
        <span>Instant</span>
        <span>Local</span>
      </div>
    </div>
  );
}
