"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Smartphone, Copy, CheckCircle2, Banknote, MapPin, Truck, Clock, KeyRound, Calendar, Gift } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation, buildDisplayAddress } from "@/context/LocationContext";
import { createOrder, updateOrderStatus, formatOrderId } from "@/lib/orders";
import { assignOrderToVendor } from "@/lib/vendor";
import { processOrderRewards, initRewards, getRewardsSummary, useFreeLitres, calculateOrderLitres } from "@/lib/rewards";

function getEstimatedDelivery(): { duration: string; arrivalTime: string } {
  const now = new Date();
  // Convert to Kenya time (UTC+3)
  const kenyaOffset = 3 * 60;
  const kenyaNow = new Date(now.getTime() + (kenyaOffset + now.getTimezoneOffset()) * 60000);
  // Add 35 minutes (average delivery time)
  const arrival = new Date(kenyaNow.getTime() + 35 * 60000);
  const hours = arrival.getHours();
  const minutes = arrival.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const displayMin = minutes.toString().padStart(2, "0");
  return {
    duration: "30–45 min",
    arrivalTime: `${displayHour}:${displayMin} ${ampm} EAT`,
  };
}

type PaymentMethod = "stk-push" | "mpesa-app" | "cash";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { items, totalItems, total, clearCart } = useCart();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stk-push");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "confirmed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [stkFailedPopup, setStkFailedPopup] = useState(false);

  // Scheduled delivery
  const [scheduledDelivery, setScheduledDelivery] = useState<{ date: string; time: string } | null>(null);
  useState(() => {
    try {
      const raw = sessionStorage.getItem("mimaji_scheduled_delivery");
      if (raw) {
        setScheduledDelivery(JSON.parse(raw));
      }
    } catch {}
  });

  // Rewards
  const [freeLitres, setFreeLitres] = useState(0);
  const [claimRewards, setClaimRewards] = useState(false);
  const [rewardsApplied, setRewardsApplied] = useState(0);

  useState(() => {
    if (user?.id) {
      initRewards(user.id);
      const summary = getRewardsSummary(user.id);
      setFreeLitres(summary.freeLitres);
    }
  });

  const orderLitres = items.reduce((acc, item) => {
    const match = item.name.match(/(\d+)L/i);
    return acc + (match ? parseInt(match[1]) * item.quantity : 0);
  }, 0);

  const handleClaimRewards = (claim: boolean) => {
    setClaimRewards(claim);
    if (claim && freeLitres > 0) {
      const claimable = Math.min(freeLitres, orderLitres);
      setRewardsApplied(claimable);
    } else {
      setRewardsApplied(0);
    }
  };

  // Store confirmed order details so they persist after cart is cleared
  const confirmedOrderRef = useRef<{
    orderId: string;
    mpesaRef: string | null;
    items: typeof items;
    total: number;
    address: string;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const handleConfirm = async () => {
    if (!user?.phone || !user?.id) return;

    setPaymentStatus("loading");
    setErrorMsg("");

    try {
      // Create order
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
        scheduledDate: scheduledDelivery?.date,
        scheduledTime: scheduledDelivery?.time,
      });

      if (orderError || !orderId) {
        throw new Error(orderError || "Failed to create order");
      }

      let mpesaRef: string | null = null;

      if (paymentMethod === "mpesa-app") {
        // For M-PESA app payment, mark as pending
        mpesaRef = null;
      } else if (paymentMethod === "cash") {
        // Cash on delivery
        mpesaRef = null;
      } else {
        // STK Push flow
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

          const data = await res.json().catch(() => ({}));

          if (data.mock) {
            // Demo mode — simulate successful payment
            mpesaRef = `MOCK${Date.now().toString(36).toUpperCase()}`;
            await updateOrderStatus(orderId, "paid", mpesaRef);
          } else if (!res.ok) {
            // STK Push failed — show popup to choose different method
            setStkFailedPopup(true);
            setPaymentStatus("idle");
            return;
          } else {
            // Real STK push sent
            await updateOrderStatus(orderId, "paid");
            mpesaRef = data.CheckoutRequestID || null;
          }
        } catch (fetchErr) {
          // Network/STK error — show popup to choose different method
          setStkFailedPopup(true);
          setPaymentStatus("idle");
          return;
        }
      }

      // Trigger vendor assignment
      try {
        await assignOrderToVendor(orderId);
      } catch (e) {
        console.error("Vendor assignment failed:", e);
      }

      // Process referral rewards (checks if this order qualifies for referral bonuses)
      try {
        initRewards(user.id);
        processOrderRewards(user.id, orderItems);
        // Apply claimed rewards
        if (claimRewards && rewardsApplied > 0) {
          useFreeLitres(user.id, rewardsApplied);
        }
      } catch (e) {
        console.error("Rewards processing failed:", e);
      }

      // Save order details before clearing cart
      confirmedOrderRef.current = {
        orderId,
        mpesaRef,
        items: [...items],
        total,
        address: selectedLocation?.address || "Not set",
        paymentMethod,
      };

      clearCart();
      try { sessionStorage.removeItem("mimaji_scheduled_delivery"); } catch {}
      setPaymentStatus("confirmed");
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

  // ── M-PESA Payment Code Entry (for mpesa-app method) ──
  const [mpesaCode, setMpesaCode] = useState("");
  const [codeSubmitted, setCodeSubmitted] = useState(false);

  const handleMpesaCodeSubmit = async () => {
    if (!mpesaCode.trim() || !confirmedOrderRef.current) return;
    try {
      await updateOrderStatus(confirmedOrderRef.current.orderId, "paid", mpesaCode.trim().toUpperCase());
      confirmedOrderRef.current.mpesaRef = mpesaCode.trim().toUpperCase();
      setCodeSubmitted(true);
    } catch (e) {
      console.error("Failed to update M-PESA code:", e);
      setCodeSubmitted(true);
    }
  };

  // ── Payment Confirmation Screen ──
  if (paymentStatus === "confirmed" && confirmedOrderRef.current) {
    const order = confirmedOrderRef.current;

    // Show M-PESA code entry screen for mpesa-app payments before showing success
    if (order.paymentMethod === "mpesa-app" && !codeSubmitted) {
      return (
        <div className="bg-background min-h-screen pb-28">
          <TopBar title="Enter M-PESA Code" />
          <div className="max-w-md mx-auto md:max-w-lg px-4 mt-6">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center">
                <KeyRound size={40} className="text-primary" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary text-center mb-1">
              Enter M-PESA Payment Code
            </h2>
            <p className="text-text-secondary text-sm text-center mb-6">
              Key in your M-PESA payment code so we can confirm that you have paid and process your order.
            </p>

            <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
              <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-2 block">
                M-PESA Confirmation Code
              </label>
              <input
                type="text"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. SJ12ABCDEF"
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-mono font-bold text-text-primary tracking-widest text-center focus:border-primary focus:outline-none transition-colors"
                maxLength={15}
              />
              <p className="text-text-secondary text-xs mt-2 text-center">
                You will receive this code via SMS after completing your M-PESA payment.
              </p>
            </div>

            <div className="bg-[#FFF5EC] rounded-xl p-4 mb-6">
              <p className="text-[#F5A623] text-xs font-bold mb-1">Payment Details Reminder</p>
              <div className="text-text-secondary text-xs space-y-1">
                <p>Business Number: <span className="font-bold text-text-primary">123456</span></p>
                <p>Account Number: <span className="font-bold text-text-primary">{user?.phone || "Your phone"}</span></p>
                <p>Amount: <span className="font-bold text-text-primary">KES {order.total.toLocaleString()}</span></p>
              </div>
            </div>

            <button
              onClick={handleMpesaCodeSubmit}
              disabled={mpesaCode.trim().length < 5}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 transition-colors ${
                mpesaCode.trim().length >= 5
                  ? "bg-primary text-white hover:bg-[#1a5a9a]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 size={18} />
              Confirm Payment Code
            </button>

            <button
              onClick={() => setCodeSubmitted(true)}
              className="w-full mt-3 text-text-secondary text-sm font-medium text-center hover:text-primary transition-colors"
            >
              Skip for now — I&apos;ll provide the code later
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-background min-h-screen pb-28">
        <TopBar title="Payment Confirmation" />
        <div className="max-w-md mx-auto md:max-w-lg px-4 mt-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center">
              <CheckCircle2 size={44} className="text-[#2ECC71]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-text-primary text-center mb-1">
            {order.paymentMethod === "cash" ? "Order Placed!" : "Payment Confirmed!"}
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6">
            {order.paymentMethod === "cash"
              ? "Your order has been placed. Have cash ready for the driver."
              : order.paymentMethod === "mpesa-app"
              ? (order.mpesaRef ? "Your M-PESA payment code has been received. We will confirm your order shortly." : "Complete your M-PESA payment to confirm your order.")
              : "Your payment has been processed successfully."}
          </p>

          {/* Order Details Card */}
          <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {formatOrderId(order.orderId)}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-primary" />
                    <span className="text-sm text-text-primary">{item.quantity}x {item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">KES {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gray-100 my-3" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-bold text-text-primary text-lg">KES {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-surface shadow-card rounded-xl p-4 mb-4 flex items-center gap-3">
            <MapPin size={20} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-text-secondary">Deliver To</p>
              <p className="text-sm font-medium text-text-primary">{order.address}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-surface shadow-card rounded-xl p-4 mb-4 flex items-center gap-3">
            {order.paymentMethod === "cash" ? (
              <Banknote size={20} className="text-[#2ECC71] flex-shrink-0" />
            ) : (
              <Smartphone size={20} className="text-[#2ECC71] flex-shrink-0" />
            )}
            <div>
              <p className="text-xs text-text-secondary">Payment Method</p>
              <p className="text-sm font-medium text-text-primary">
                {order.paymentMethod === "stk-push" ? "M-PESA STK Push" :
                 order.paymentMethod === "mpesa-app" ? "M-PESA App" :
                 "Cash on Delivery"}
              </p>
            </div>
          </div>

          {/* M-PESA Reference */}
          {order.mpesaRef && (
            <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
              <p className="text-xs text-text-secondary">M-Pesa Reference</p>
              <p className="font-bold text-sm text-text-primary">{order.mpesaRef}</p>
            </div>
          )}

          {/* Track Order Button */}
          <Link href={`/track?orderId=${order.orderId}`}>
            <div className="w-full bg-primary text-white rounded-xl py-3.5 font-semibold text-sm text-center flex items-center justify-center gap-2 hover:bg-[#1a5a9a] transition-colors">
              <Truck size={18} />
              Track Your Order
            </div>
          </Link>

          <Link href="/orders" className="block text-center mt-3 text-primary text-sm font-semibold">
            View All Orders
          </Link>

          <Link href="/dashboard" className="block text-center mt-2 text-text-secondary text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Main Confirm Order Screen ──
  return (
    <div className="bg-background min-h-screen pb-28">
      {/* STK Push Failed Popup */}
      {stkFailedPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="w-14 h-14 bg-[#FFEBEE] rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone size={28} className="text-cta-alt" />
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">STK Push Failed</h3>
            <p className="text-text-secondary text-sm mb-6">
              The M-PESA payment prompt could not be sent to your phone. Please choose a different payment method below.
            </p>
            <button
              onClick={() => { setStkFailedPopup(false); setPaymentMethod("mpesa-app"); }}
              className="w-full bg-[#2ECC71] text-white py-3 rounded-xl font-semibold text-sm mb-2 hover:bg-[#27ae60] transition-colors"
            >
              Pay via M-PESA App
            </button>
            <button
              onClick={() => { setStkFailedPopup(false); setPaymentMethod("cash"); }}
              className="w-full bg-gray-100 text-text-primary py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Cash on Delivery
            </button>
          </div>
        </div>
      )}

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

            {/* Full Delivery Address */}
            <div className="bg-primary-light rounded-xl p-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-1">Deliver To</p>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedLocation
                      ? buildDisplayAddress(selectedLocation) || selectedLocation.address
                      : "Not set"}
                  </p>
                  {selectedLocation?.additionalDirections && (
                    <p className="text-xs text-text-secondary italic mt-1">
                      &quot;{selectedLocation.additionalDirections}&quot;
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            <div className="bg-[#E8F5E9] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-[#2ECC71] flex-shrink-0" />
                <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Estimated Delivery</p>
              </div>
              <p className="text-2xl font-extrabold text-text-primary">
                ETA: {getEstimatedDelivery().duration}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Arriving ~{getEstimatedDelivery().arrivalTime}
              </p>
            </div>

            {/* Scheduled Delivery Info */}
            {scheduledDelivery && (
              <div className="bg-primary-light rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-primary" />
                  <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Scheduled Delivery</p>
                </div>
                <p className="text-sm font-bold text-text-primary">{scheduledDelivery.date} at {scheduledDelivery.time}</p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Amount</span>
              <span className="text-text-primary font-medium">{amountSummary()}</span>
            </div>
          </div>

          {/* Claim Rewards */}
          {freeLitres > 0 && (
            <div className="mt-4">
              <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
                <Gift size={16} className="text-[#2ECC71]" />
                Claim Rewards
              </h3>
              <button
                onClick={() => handleClaimRewards(!claimRewards)}
                className={`w-full flex items-center gap-3 rounded-xl p-4 transition-all text-left ${
                  claimRewards
                    ? "bg-[#E8F5E9] border-2 border-[#2ECC71]"
                    : "bg-surface border-2 border-transparent shadow-card"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  claimRewards ? "bg-[#2ECC71]" : "bg-gray-100"
                }`}>
                  <Gift size={20} className={claimRewards ? "text-white" : "text-text-secondary"} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-text-primary">
                    Use {freeLitres}L Free Water
                  </p>
                  <p className="text-text-secondary text-xs">
                    {claimRewards
                      ? `Applying ${rewardsApplied}L to this order`
                      : `You have ${freeLitres}L of free water available`}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  claimRewards ? "border-[#2ECC71] bg-[#2ECC71]" : "border-gray-300"
                }`}>
                  {claimRewards && <CheckCircle2 size={14} className="text-white" />}
                </div>
              </button>
              {claimRewards && rewardsApplied > 0 && (
                <p className="text-[#2ECC71] text-xs font-semibold mt-2 text-center">
                  {rewardsApplied}L of free water will be applied to this order!
                </p>
              )}
            </div>
          )}

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
              <div className="mt-2 bg-[#FFF5EC] rounded-lg p-3">
                <p className="text-[#F5A623] text-xs font-bold">Reminder:</p>
                <p className="text-text-primary text-xs mt-1">
                  Please have your cash ready upon arrival of the delivery driver to avoid delays.
                </p>
              </div>
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
              <div className="mt-3 bg-primary-light rounded-lg p-3">
                <p className="text-primary text-xs font-bold">Important:</p>
                <p className="text-text-primary text-xs mt-1">
                  After completing payment, you will need to enter the M-PESA payment code on the next page to confirm your payment.
                </p>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-text-primary">Total</span>
            <span className="text-xl font-bold text-text-primary">KES {total.toLocaleString()}</span>
          </div>

          {/* Error Message */}
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
            disabled={paymentStatus === "loading"}
          >
            {paymentStatus === "loading" ? "Processing order..." :
             paymentMethod === "stk-push" ? "Pay with M-PESA" :
             paymentMethod === "cash" ? "Place Order (Cash on Delivery)" :
             "Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
