"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, CreditCard, Smartphone } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { items, totalItems, total } = useCart();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirm = async () => {
    if (!user?.phone) return;

    setPaymentStatus("loading");
    setErrorMsg("");

    try {
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user.phone,
          amount: total,
          orderId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Payment failed");
      }

      setPaymentStatus("sent");
      // Wait a moment then redirect to tracking
      setTimeout(() => router.push("/track"), 2000);
    } catch (err) {
      setPaymentStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
    }
  };

  const amountSummary = () => {
    if (items.length === 1) {
      const item = items[0];
      return `${item.quantity} ${item.name}`;
    }
    return `${totalItems} items`;
  };

  return (
    <div className="bg-background min-h-screen pb-28">
      <TopBar title="Confirm Order" />

      <div className="max-w-md mx-auto md:max-w-lg">
        {/* Product Image Placeholder */}
        <div className="flex justify-center mt-6">
          <div className="w-[120px] h-[120px] bg-primary-light rounded-2xl flex items-center justify-center">
            <Droplets size={48} className="text-primary" />
          </div>
        </div>

        {/* Order Details */}
        <div className="px-4 mt-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Account</span>
              <span className="text-text-primary font-medium">{user?.phone || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Deliver To</span>
              <span className="text-text-primary font-medium">{selectedLocation?.address || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Amount</span>
              <span className="text-text-primary font-medium">{amountSummary()}</span>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Payment Method */}
          <div className="flex items-center gap-3 bg-[#E8F5E9] rounded-xl p-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#2ECC71] flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">M-Pesa</p>
              <p className="text-text-secondary text-xs">STK push to {user?.phone || "your phone"}</p>
            </div>
            <CreditCard size={20} className="text-[#2ECC71]" />
          </div>

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-text-primary">Total</span>
            <span className="text-xl font-bold text-text-primary">KES {total.toLocaleString()}</span>
          </div>

          {/* Status Messages */}
          {paymentStatus === "sent" && (
            <div className="mt-4 bg-[#E8F5E9] rounded-xl p-4 text-center">
              <p className="text-[#2ECC71] font-bold text-sm">M-Pesa STK push sent!</p>
              <p className="text-text-secondary text-xs mt-1">Check your phone and enter your M-Pesa PIN to complete payment.</p>
            </div>
          )}
          {paymentStatus === "error" && (
            <div className="mt-4 bg-[#FFEBEE] rounded-xl p-4 text-center">
              <p className="text-cta-alt font-bold text-sm">Payment Error</p>
              <p className="text-text-secondary text-xs mt-1">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Bottom: Confirm Order */}
        <div className="fixed bottom-0 left-0 right-0 bg-background px-4 py-4 max-w-md mx-auto md:max-w-lg">
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            disabled={paymentStatus === "loading" || paymentStatus === "sent"}
          >
            {paymentStatus === "loading" ? "Sending M-Pesa request..." :
             paymentStatus === "sent" ? "Waiting for payment..." :
             "Pay with M-Pesa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
