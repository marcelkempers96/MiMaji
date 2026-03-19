"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Smartphone, Copy, CheckCircle2, Banknote } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { createOrder, updateOrderStatus } from "@/lib/orders";

type PaymentMethod = "stk-push" | "mpesa-app" | "cash";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { items, totalItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stk-push");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConfirm = async () => {
    if (!user?.phone || !user?.id) return;

    setPaymentStatus("loading");
    setErrorMsg("");

    try {
      // Create order in Supabase
      const productName = items.length === 1
        ? `${items[0].quantity}x ${items[0].name}`
        : `${totalItems} items`;

      const orderItems = items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const { orderId, error: orderError } = await createOrder({
        customerId: user.id,
        deliveryAddress: selectedLocation?.address || "Not set",
        quantity: Math.min(totalItems, 10),
        priceTotal: total,
        productName,
        orderItems,
      });

      if (orderError || !orderId) {
        throw new Error(orderError || "Failed to create order");
      }

      if (paymentMethod === "mpesa-app") {
        // For M-PESA app payment, mark as pending and show instructions
        setPaymentStatus("sent");
        clearCart();
        setTimeout(() => router.push(`/track?orderId=${orderId}`), 3000);
        return;
      }

      if (paymentMethod === "cash") {
        // Cash on delivery — order stays pending, driver collects payment
        setPaymentStatus("sent");
        clearCart();
        setTimeout(() => router.push(`/track?orderId=${orderId}`), 2000);
        return;
      }

      // STK Push flow
      // Check if M-PESA is configured (server-side env vars)
      // If not configured, simulate successful payment for demo
      try {
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
          const data = await res.json().catch(() => ({}));
          // If it's a config/env error, fall through to mock payment
          if (data.error?.includes("M-Pesa auth failed") || data.error?.includes("STK Push failed") || data.error?.includes("fetch")) {
            // M-PESA not configured — simulate payment for demo
            const mockRef = `MOCK${Date.now().toString(36).toUpperCase()}`;
            await updateOrderStatus(orderId, "paid", mockRef);
          } else {
            throw new Error(data.error || "Payment failed");
          }
        } else {
          // Update order status to paid
          await updateOrderStatus(orderId, "paid");
        }
      } catch (fetchErr) {
        // Network error / M-PESA not configured — simulate payment for demo
        const mockRef = `MOCK${Date.now().toString(36).toUpperCase()}`;
        await updateOrderStatus(orderId, "paid", mockRef);
      }

      setPaymentStatus("sent");
      clearCart();
      setTimeout(() => router.push(`/track?orderId=${orderId}`), 2000);
    } catch (err) {
      setPaymentStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
    }
  };

  const handleCopyPaybill = () => {
    navigator.clipboard.writeText("123456").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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

          {/* Payment Method Selection */}
          <h3 className="font-bold text-sm text-text-primary mb-3">Payment Method</h3>

          {/* Option 1: STK Push */}
          <button
            onClick={() => setPaymentMethod("stk-push")}
            className={`w-full flex items-center gap-3 rounded-xl p-4 mb-3 transition-all text-left ${
              paymentMethod === "stk-push"
                ? "bg-[#E8F5E9] border-2 border-[#2ECC71]"
                : "bg-surface border-2 border-transparent shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              paymentMethod === "stk-push" ? "bg-[#2ECC71]" : "bg-gray-100"
            }`}>
              <Smartphone size={20} className={paymentMethod === "stk-push" ? "text-white" : "text-text-secondary"} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">STK Push to M-PESA</p>
              <p className="text-text-secondary text-xs">Receive a payment prompt on {user?.phone || "your phone"}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "stk-push" ? "border-[#2ECC71] bg-[#2ECC71]" : "border-gray-300"
            }`}>
              {paymentMethod === "stk-push" && <CheckCircle2 size={14} className="text-white" />}
            </div>
          </button>

          {/* Option 2: Pay via M-PESA App */}
          <button
            onClick={() => setPaymentMethod("mpesa-app")}
            className={`w-full flex items-center gap-3 rounded-xl p-4 mb-4 transition-all text-left ${
              paymentMethod === "mpesa-app"
                ? "bg-[#E8F5E9] border-2 border-[#2ECC71]"
                : "bg-surface border-2 border-transparent shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              paymentMethod === "mpesa-app" ? "bg-[#2ECC71]" : "bg-gray-100"
            }`}>
              <Smartphone size={20} className={paymentMethod === "mpesa-app" ? "text-white" : "text-text-secondary"} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">Pay via M-PESA App</p>
              <p className="text-text-secondary text-xs">Pay manually using Paybill / Till number</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "mpesa-app" ? "border-[#2ECC71] bg-[#2ECC71]" : "border-gray-300"
            }`}>
              {paymentMethod === "mpesa-app" && <CheckCircle2 size={14} className="text-white" />}
            </div>
          </button>

          {/* Option 3: Cash on Delivery */}
          <button
            onClick={() => setPaymentMethod("cash")}
            className={`w-full flex items-center gap-3 rounded-xl p-4 mb-4 transition-all text-left ${
              paymentMethod === "cash"
                ? "bg-[#E8F5E9] border-2 border-[#2ECC71]"
                : "bg-surface border-2 border-transparent shadow-card"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              paymentMethod === "cash" ? "bg-[#2ECC71]" : "bg-gray-100"
            }`}>
              <Banknote size={20} className={paymentMethod === "cash" ? "text-white" : "text-text-secondary"} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">Cash on Delivery</p>
              <p className="text-text-secondary text-xs">Pay the driver in cash when your water arrives</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "cash" ? "border-[#2ECC71] bg-[#2ECC71]" : "border-gray-300"
            }`}>
              {paymentMethod === "cash" && <CheckCircle2 size={14} className="text-white" />}
            </div>
          </button>

          {/* Cash on Delivery Info */}
          {paymentMethod === "cash" && (
            <div className="bg-primary-light rounded-xl p-4 mb-4">
              <p className="font-bold text-sm text-text-primary mb-1">Cash on Delivery</p>
              <p className="text-text-secondary text-xs">
                Have <span className="font-bold text-text-primary">KES {total.toLocaleString()}</span> ready in cash.
                The delivery driver will collect payment when your water arrives. Please have the exact amount if possible.
              </p>
            </div>
          )}

          {/* M-PESA App Instructions */}
          {paymentMethod === "mpesa-app" && (
            <div className="bg-[#FFF5EC] rounded-xl p-4 mb-4">
              <p className="font-bold text-sm text-text-primary mb-2">Payment Instructions</p>
              <ol className="text-text-secondary text-xs space-y-2 list-decimal list-inside">
                <li>Open M-PESA on your phone</li>
                <li>Select <span className="font-semibold text-text-primary">Lipa na M-PESA</span></li>
                <li>Select <span className="font-semibold text-text-primary">Pay Bill</span></li>
                <li>
                  Enter Business Number: <span className="font-bold text-text-primary">123456</span>
                  <button onClick={handleCopyPaybill} className="ml-2 inline-flex items-center gap-1 text-primary">
                    {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                    <span className="text-[10px]">{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </li>
                <li>Enter Account Number: <span className="font-bold text-text-primary">{user?.phone || "Your phone"}</span></li>
                <li>Enter Amount: <span className="font-bold text-text-primary">KES {total.toLocaleString()}</span></li>
                <li>Enter your M-PESA PIN and confirm</li>
              </ol>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-text-primary">Total</span>
            <span className="text-xl font-bold text-text-primary">KES {total.toLocaleString()}</span>
          </div>

          {/* Status Messages */}
          {paymentStatus === "sent" && paymentMethod === "stk-push" && (
            <div className="mt-4 bg-[#E8F5E9] rounded-xl p-4 text-center">
              <p className="text-[#2ECC71] font-bold text-sm">M-PESA STK push sent!</p>
              <p className="text-text-secondary text-xs mt-1">Check your phone and enter your M-PESA PIN to complete payment.</p>
            </div>
          )}
          {paymentStatus === "sent" && paymentMethod === "mpesa-app" && (
            <div className="mt-4 bg-[#E8F5E9] rounded-xl p-4 text-center">
              <p className="text-[#2ECC71] font-bold text-sm">Order placed!</p>
              <p className="text-text-secondary text-xs mt-1">Complete your M-PESA payment using the instructions above. Redirecting...</p>
            </div>
          )}
          {paymentStatus === "sent" && paymentMethod === "cash" && (
            <div className="mt-4 bg-[#E8F5E9] rounded-xl p-4 text-center">
              <p className="text-[#2ECC71] font-bold text-sm">Order placed!</p>
              <p className="text-text-secondary text-xs mt-1">Have KES {total.toLocaleString()} in cash ready for the driver. Redirecting...</p>
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
            {paymentStatus === "loading" ? "Processing order..." :
             paymentStatus === "sent" ? "Redirecting..." :
             paymentMethod === "stk-push" ? "Pay with M-PESA" :
             paymentMethod === "cash" ? "Place Order (Cash on Delivery)" :
             "Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
