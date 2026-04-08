"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Smartphone, Copy, CheckCircle2, Banknote, MapPin, Truck, Clock, KeyRound, Calendar, Gift, Info } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation, buildDisplayAddress } from "@/context/LocationContext";
import { createOrder, formatOrderId, generateDeliveryCode, DeliveryAddressDetails } from "@/lib/orders";
import { assignOrderToVendor } from "@/lib/vendor";
import { processOrderRewards, getRewardsSummaryAsync, useFreeLitresAsync } from "@/lib/rewards";
import { getProductImage, products } from "@/data/products";

// ── Discount tier logic (same as cart page) ──
const DISCOUNT_TIERS = [
  { minQty: 1, maxQty: 2, discount: 0, label: "Standard" },
  { minQty: 3, maxQty: 5, discount: 5, label: "5% off" },
  { minQty: 6, maxQty: 9, discount: 10, label: "10% off" },
  { minQty: 10, maxQty: Infinity, discount: 15, label: "15% off" },
];

function getDiscount(qty: number) {
  return DISCOUNT_TIERS.find((t) => qty >= t.minQty && qty <= t.maxQty) || DISCOUNT_TIERS[0];
}

function parseCartItemId(cartItemId: string): { productId: string; bottleType: "new" | "refill" } {
  const match = cartItemId.match(/^(.+)-(new|refill)$/);
  if (match) return { productId: match[1], bottleType: match[2] as "new" | "refill" };
  return { productId: cartItemId, bottleType: "refill" };
}

function getBasePrice(itemId: string): number {
  const { productId, bottleType } = parseCartItemId(itemId);
  const product = products.find((p) => p.id === productId);
  if (!product) return 0;
  return bottleType === "new" ? product.priceNew : product.priceRefill;
}

function getDiscountedPrice(basePrice: number, qty: number) {
  const tier = getDiscount(qty);
  return Math.round(basePrice * (1 - tier.discount / 100));
}

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

/**
 * Timeout that only counts time when the page is visible.
 * Pauses when user switches to another app (e.g. M-Pesa) and resumes when they return.
 * This prevents false "timed out" errors when users switch apps during payment.
 */
function visibilityAwareTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    let remaining = ms;
    let lastVisible = Date.now();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        remaining -= (Date.now() - lastVisible);
        if (remaining <= 0) {
          clearInterval(timer);
          document.removeEventListener("visibilitychange", onVisChange);
          reject(new Error(message));
        }
      }
      lastVisible = Date.now();
    }, 1000);

    const onVisChange = () => {
      if (document.visibilityState === "visible") {
        // Reset the tick reference when coming back to avoid counting hidden time
        lastVisible = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
  });
}

type PaymentMethod = "stk-push" | "mpesa-app" | "cash";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { items, totalItems, deliveryFee, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { selectedLocation } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa-app");
  // Restore payment status from sessionStorage (survives app-switching on mobile)
  const [paymentStatus, setPaymentStatusRaw] = useState<"idle" | "loading" | "awaiting_code" | "awaiting_stk" | "confirmed" | "error">(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("mimaji_payment_status");
        if (saved === "awaiting_code" || saved === "awaiting_stk") return saved as "awaiting_code" | "awaiting_stk";
      }
    } catch {}
    return "idle";
  });
  const setPaymentStatus = (status: "idle" | "loading" | "awaiting_code" | "awaiting_stk" | "confirmed" | "error") => {
    setPaymentStatusRaw(status);
    try {
      if (status === "awaiting_code" || status === "awaiting_stk") {
        sessionStorage.setItem("mimaji_payment_status", status);
      } else {
        sessionStorage.removeItem("mimaji_payment_status");
      }
    } catch {}
  };
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState<string | false>(false);
  const [stkFailedPopup, setStkFailedPopup] = useState(false);
  // Track the order ID created during STK push for polling
  const stkOrderIdRef = useRef<string | null>(
    typeof window !== "undefined" ? (sessionStorage.getItem("mimaji_stk_order_id") ?? null) : null
  );
  const stkPollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stkElapsed, setStkElapsed] = useState(0);

  // Scheduled delivery
  const [scheduledDelivery, setScheduledDelivery] = useState<{ date: string; time: string } | null>(() => {
    try {
      if (typeof window !== "undefined") {
        const raw = sessionStorage.getItem("mimaji_scheduled_delivery");
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return null;
  });

  // Rewards
  const [freeLitres, setFreeLitres] = useState(0);
  const [claimRewards, setClaimRewards] = useState(false);
  const [rewardsApplied, setRewardsApplied] = useState(0);

  // M-PESA code entry state
  const [mpesaCode, setMpesaCode] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Store confirmed order details so they persist after cart is cleared
  const confirmedOrderRef = useRef<{
    orderId: string;
    mpesaRef: string | null;
    items: typeof items;
    total: number;
    address: string;
    addressDetails: DeliveryAddressDetails | null;
    paymentMethod: PaymentMethod;
    deliveryCode: string;
  } | null>(null);

  // Pending order params — saved before order is actually created
  const pendingOrderRef = useRef<{
    productName: string;
    orderItems: Array<{ name: string; quantity: number; price: number }>;
    savedItems: typeof items;
    address: string;
    stkMpesaRef: string | null;
  } | null>(null);

  // ── All useEffect hooks (must be called before any conditional returns) ──

  // Restore pending order data from sessionStorage (survives app-switching)
  useEffect(() => {
    if ((paymentStatus === "awaiting_code" || paymentStatus === "awaiting_stk") && !pendingOrderRef.current) {
      try {
        const saved = sessionStorage.getItem("mimaji_pending_order");
        if (saved) pendingOrderRef.current = JSON.parse(saved);
      } catch {}
    }
    // Restore STK order ID
    if (paymentStatus === "awaiting_stk" && !stkOrderIdRef.current) {
      try { stkOrderIdRef.current = sessionStorage.getItem("mimaji_stk_order_id"); } catch {}
    }
  }, [paymentStatus]);

  // Poll payment status after STK push
  useEffect(() => {
    if (paymentStatus !== "awaiting_stk") {
      if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
      return;
    }

    const orderId = stkOrderIdRef.current;
    if (!orderId) return;

    let elapsed = 0;
    const POLL_INTERVAL = 3000; // 3 seconds
    const MAX_WAIT = 90000; // 90 seconds

    const poll = async () => {
      elapsed += POLL_INTERVAL;
      setStkElapsed(elapsed);

      if (elapsed > MAX_WAIT) {
        // Timed out — payment not confirmed
        if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
        setPaymentStatus("error");
        setErrorMsg("M-Pesa payment not confirmed within 90 seconds. If you completed the payment, check your orders — it may still be processing.");
        return;
      }

      try {
        const res = await fetch(`/api/mpesa/status?orderId=${orderId}`);
        const data = await res.json().catch(() => ({ status: "pending" }));

        if (data.status === "success") {
          if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
          // Update confirmed order ref with receipt
          if (confirmedOrderRef.current) {
            confirmedOrderRef.current.mpesaRef = data.mpesa_receipt || confirmedOrderRef.current.mpesaRef;
          }
          try {
            sessionStorage.removeItem("mimaji_stk_order_id");
            sessionStorage.removeItem("mimaji_pending_order");
            sessionStorage.removeItem("mimaji_payment_status");
          } catch {}
          setPaymentStatus("confirmed");
        } else if (data.status === "failed") {
          if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
          setPaymentStatus("error");
          setErrorMsg("M-Pesa payment was declined or cancelled. Please try again.");
        }
      } catch {
        // Network error — keep polling
      }
    };

    stkPollTimerRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
    };
  }, [paymentStatus]);

  // Load rewards summary
  useEffect(() => {
    if (user?.id) {
      getRewardsSummaryAsync(user.id).then((summary) => {
        setFreeLitres(summary.freeLitres);
      });
    }
  }, [user?.id]);

  // ── Computed values ──

  // Recalculate cart totals using discount tiers (matches cart page exactly)
  const cartWithDiscounts = items.map((item) => {
    const basePrice = getBasePrice(item.id) || item.price;
    const discount = getDiscount(item.quantity);
    const discountedPrice = getDiscountedPrice(basePrice, item.quantity);
    return { ...item, basePrice, discountedPrice, discount };
  });
  const discountedSubtotal = cartWithDiscounts.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const originalSubtotal = cartWithDiscounts.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const totalSavings = originalSubtotal - discountedSubtotal;
  const cartTotal = discountedSubtotal + (items.length > 0 ? deliveryFee : 0);

  const orderLitres = items.reduce((acc, item) => {
    const match = item.name.match(/(\d+)L/i);
    return acc + (match ? parseInt(match[1]) * item.quantity : 0);
  }, 0);

  // Calculate discount per litre based on average price
  const pricePerLitre = orderLitres > 0 ? discountedSubtotal / orderLitres : 0;

  const handleClaimRewards = (claim: boolean) => {
    setClaimRewards(claim);
    if (claim && freeLitres > 0) {
      const claimable = Math.min(freeLitres, orderLitres);
      setRewardsApplied(claimable);
    } else {
      setRewardsApplied(0);
    }
  };

  // Rewards discount amount
  const rewardsDiscount = claimRewards && rewardsApplied > 0 ? Math.round(rewardsApplied * pricePerLitre) : 0;

  // Final total: no additional COD charge for M-PESA / Cash on Delivery
  const finalTotal = Math.max(cartTotal - rewardsDiscount, 0);

  // ── Guards (AFTER all hooks) ──

  // Auth guard: redirect to login if not authenticated (after loading completes)
  if (!authLoading && !user && paymentStatus === "idle") {
    router.push("/login?redirect=/delivery");
    return null;
  }

  // Empty cart guard: redirect to shop if cart is empty (unless in payment flow)
  if (!authLoading && user && items.length === 0 && paymentStatus === "idle") {
    router.push("/buy");
    return null;
  }

  /** Create the real order, assign vendor, process rewards, clear cart */
  const finalizeOrder = async (mpesaRef: string | null) => {
    if (!user?.phone || !user?.id) {
      throw new Error("You are not logged in. Please log in and try again.");
    }
    if (!pendingOrderRef.current) {
      throw new Error("Order data missing. Please go back and try again.");
    }

    const pending = pendingOrderRef.current;

    // Build full address details for vendor visibility
    const addressDetails: DeliveryAddressDetails | null = selectedLocation ? {
      streetName: selectedLocation.streetName,
      buildingName: selectedLocation.buildingName,
      unitNumber: selectedLocation.unitNumber,
      floor: selectedLocation.floor,
      locationType: selectedLocation.locationType,
      postalCode: selectedLocation.postalCode,
      additionalDirections: selectedLocation.additionalDirections,
      neighbourhood: selectedLocation.neighbourhood,
      label: selectedLocation.label,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    } : null;

    // Read brand preference from session
    let brandPreference: string[] = [];
    try { const bp = sessionStorage.getItem("mimaji_brand_preference"); if (bp) brandPreference = JSON.parse(bp); } catch {}

    let orderId: string | null = null;
    let orderError: string | null = null;

    // Determine initial status so we don't need a separate UPDATE call
    const initialStatus = mpesaRef ? "paid" : paymentMethod === "cash" ? "confirmed" : "pending_payment";

    try {
      const result = await createOrder({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        deliveryAddress: pending.address,
        deliveryAddressDetails: addressDetails,
        quantity: Math.min(totalItems || pending.savedItems.length, 10),
        priceTotal: finalTotal,
        productName: pending.productName,
        orderItems: pending.orderItems,
        scheduledDate: scheduledDelivery?.date,
        scheduledTime: scheduledDelivery?.time,
        deliveryCode: user.deliveryPin,
        paymentMethod,
        brandPreference,
        initialStatus,
        mpesaRef: mpesaRef || undefined,
      });
      orderId = result.orderId;
      orderError = result.error;
    } catch (e) {
      console.error("createOrder threw:", e);
      throw new Error("Failed to create order. Please try again.");
    }

    if (orderError || !orderId) {
      throw new Error(orderError || "Failed to create order");
    }

    // Trigger vendor assignment — non-fatal, with timeout
    try {
      await Promise.race([
        assignOrderToVendor(orderId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Vendor assignment timeout")), 8000)),
      ]);
    } catch (e) {
      console.error("Vendor assignment failed:", e);
    }

    // Process referral rewards — non-fatal, with timeout
    try {
      processOrderRewards(user.id, pending.orderItems);
      if (claimRewards && rewardsApplied > 0) {
        await Promise.race([
          useFreeLitresAsync(user.id, rewardsApplied),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Rewards timeout")), 5000)),
        ]);
      }
    } catch (e) {
      console.error("Rewards processing failed:", e);
    }

    const deliveryCode = user.deliveryPin || generateDeliveryCode(orderId);

    confirmedOrderRef.current = {
      orderId,
      mpesaRef,
      items: [...pending.savedItems],
      total: finalTotal,
      address: pending.address,
      addressDetails: addressDetails,
      paymentMethod,
      deliveryCode,
    };

    // Notify the owner on WhatsApp for cash and manual M-PESA orders.
    // STK-push orders are notified server-side from the M-PESA callback,
    // so we skip them here to avoid double notifications.
    if (paymentMethod !== "stk-push") {
      try {
        fetch("/api/notify-new-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
          keepalive: true,
        }).catch((e) => console.error("Owner WhatsApp notification failed:", e));
      } catch (e) {
        console.error("Owner WhatsApp notification failed:", e);
      }
    }

    // Save delivery code for cross-device access
    try {
      const codeKey = `mimaji_user_delivery_code_${user.id}`;
      const existingCodes = JSON.parse(localStorage.getItem(codeKey) || "[]");
      existingCodes.push({ orderId, code: deliveryCode, createdAt: new Date().toISOString() });
      localStorage.setItem(codeKey, JSON.stringify(existingCodes));
    } catch {}

    clearCart();
    try {
      sessionStorage.removeItem("mimaji_scheduled_delivery");
      sessionStorage.removeItem("mimaji_pending_order");
      sessionStorage.removeItem("mimaji_payment_status");
    } catch {}
  };

  const handleConfirm = async () => {
    if (!user?.phone || !user?.id) {
      router.push("/login?redirect=/delivery");
      return;
    }

    setPaymentStatus("loading");
    setErrorMsg("");

    try {
      const productName = items.length === 1
        ? `${items[0].quantity}x ${items[0].name}`
        : `${totalItems} items`;

      const orderItems = cartWithDiscounts.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.discountedPrice,
      }));

      // Save order params — order is NOT created yet
      pendingOrderRef.current = {
        productName,
        orderItems,
        savedItems: [...items],
        address: selectedLocation?.address || "Not set",
        stkMpesaRef: null,
      };

      if (paymentMethod === "stk-push") {
        // STK Push: create order as pending_payment, send STK push, then poll for confirmation
        try {
          // 1. Create order first with pending_payment status
          let orderId: string | null = null;
          try {
            await Promise.race([
              finalizeOrder(null), // creates with pending_payment
              visibilityAwareTimeout(60000, "Order creation timed out."),
            ]);
            orderId = confirmedOrderRef.current?.orderId || null;
          } catch (orderErr) {
            setPaymentStatus("error");
            setErrorMsg(orderErr instanceof Error ? orderErr.message : "Failed to create order. Please try again.");
            return;
          }

          // 2. Send STK push with the real order ID
          const res = await fetch("/api/mpesa/stkpush", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: user.phone,
              amount: finalTotal,
              orderId: orderId || "pending",
            }),
          });

          const data = await res.json().catch(() => ({}));

          if (data.mock) {
            // Demo mode — simulate successful payment immediately
            const mpesaRef = `MOCK${Date.now().toString(36).toUpperCase()}`;
            if (confirmedOrderRef.current) {
              confirmedOrderRef.current.mpesaRef = mpesaRef;
            }
            setPaymentStatus("confirmed");
          } else if (!res.ok) {
            setStkFailedPopup(true);
            setPaymentStatus("idle");
            return;
          } else {
            // Real STK push sent — show waiting UI and poll for callback
            if (orderId) {
              stkOrderIdRef.current = orderId;
              try { sessionStorage.setItem("mimaji_stk_order_id", orderId); } catch {}
            }
            setStkElapsed(0);
            setPaymentStatus("awaiting_stk");
            // Polling starts via useEffect below
          }
        } catch (fetchErr) {
          setStkFailedPopup(true);
          setPaymentStatus("idle");
          return;
        }
      } else if (paymentMethod === "mpesa-app") {
        // M-PESA App: go to code entry screen, order created when code submitted or skipped
        // Save pending order to sessionStorage so it survives app-switching
        try { sessionStorage.setItem("mimaji_pending_order", JSON.stringify(pendingOrderRef.current)); } catch {}
        setPaymentStatus("awaiting_code");
      } else {
        // Cash on Delivery: create order immediately
        try {
          await Promise.race([
            finalizeOrder(null),
            visibilityAwareTimeout(60000, "Order creation timed out. Please check your orders page."),
          ]);
          setPaymentStatus("confirmed");
        } catch (codErr) {
          setPaymentStatus("error");
          setErrorMsg(codErr instanceof Error ? codErr.message : "Failed to place order. Please try again.");
          return;
        }
      }
    } catch (err) {
      setPaymentStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
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

  const handleMpesaCodeSubmit = async () => {
    if (!mpesaCode.trim()) return;
    setCreatingOrder(true);
    setErrorMsg("");
    try {
      await Promise.race([
        finalizeOrder(mpesaCode.trim().toUpperCase()),
        visibilityAwareTimeout(60000, "Order creation timed out. Your payment was received — please check your orders."),
      ]);
      setPaymentStatus("confirmed");
    } catch (e) {
      console.error("Failed to create order:", e);
      setErrorMsg(e instanceof Error ? e.message : "Failed to place order. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleMpesaSkip = async () => {
    setCreatingOrder(true);
    setErrorMsg("");
    try {
      await Promise.race([
        finalizeOrder(null),
        visibilityAwareTimeout(60000, "Order creation timed out. Please check your orders page."),
      ]);
      setPaymentStatus("confirmed");
    } catch (e) {
      console.error("Failed to create order:", e);
      setErrorMsg(e instanceof Error ? e.message : "Failed to place order. Please try again.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // ── STK Push Waiting Screen ──
  if (paymentStatus === "awaiting_stk") {
    const progressPct = Math.min((stkElapsed / 90000) * 100, 100);
    return (
      <div className="bg-background min-h-screen pb-28">
        <TopBar title="Processing Payment" />
        <div className="max-w-md mx-auto md:max-w-lg px-4 mt-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center animate-pulse">
              <Smartphone size={40} className="text-primary" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-text-primary text-center mb-1">
            Check Your Phone
          </h2>
          <p className="text-text-secondary text-sm text-center mb-6">
            Enter your M-PESA PIN on the prompt that appeared on your phone to complete the payment.
          </p>

          {/* Progress bar */}
          <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-text-secondary text-xs text-center mb-6">
            Waiting for payment confirmation... ({Math.ceil((90000 - stkElapsed) / 1000)}s remaining)
          </p>

          <div className="bg-[#FFF5EC] rounded-xl p-4 mb-6">
            <p className="text-[#F5A623] text-xs font-bold mb-2">Tips</p>
            <ul className="text-text-secondary text-xs space-y-1">
              <li>• Check your phone for the M-PESA PIN prompt</li>
              <li>• If the prompt didn&apos;t appear, wait a few seconds and check again</li>
              <li>• Do not close this page</li>
            </ul>
          </div>

          {errorMsg && (
            <div className="bg-[#FFEBEE] rounded-xl p-4 text-center mb-4">
              <p className="text-cta-alt font-bold text-sm">Payment Issue</p>
              <p className="text-text-secondary text-xs mt-1">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={() => {
              if (stkPollTimerRef.current) { clearInterval(stkPollTimerRef.current); stkPollTimerRef.current = null; }
              try { sessionStorage.removeItem("mimaji_stk_order_id"); } catch {}
              setPaymentStatus("idle");
              setStkFailedPopup(true);
            }}
            className="w-full mt-3 text-text-secondary text-sm font-medium text-center hover:text-primary transition-colors"
          >
            Cancel &amp; choose another payment method
          </button>
        </div>
      </div>
    );
  }

  // ── M-PESA Code Entry Screen (order not yet created) ──
  if (paymentStatus === "awaiting_code") {
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
              placeholder="e.g. UCJLD9PMW4"
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-mono font-bold text-text-primary tracking-widest text-center focus:border-primary focus:outline-none transition-colors"
              maxLength={15}
              disabled={creatingOrder}
            />
            <p className="text-text-secondary text-xs mt-2 text-center">
              You will receive this code via SMS after completing your M-PESA payment.
            </p>
          </div>

          <div className="bg-[#FFF5EC] rounded-xl p-4 mb-6">
            <p className="text-[#F5A623] text-xs font-bold mb-2">Payment Details</p>
            <p className="text-text-secondary text-[10px] mb-2">If you haven&apos;t paid yet, send money via M-PESA to:</p>
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-secondary">Send Money To</p>
                  <p className="text-sm font-bold text-text-primary font-mono">0758434076</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText("0758434076"); }} className="text-primary text-[10px] font-semibold flex items-center gap-1">
                  <Copy size={12} /> Copy
                </button>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-text-secondary">Amount</p>
                  <p className="text-sm font-bold text-[#2ECC71] font-mono">KES {finalTotal.toLocaleString()}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(finalTotal.toString()); }} className="text-primary text-[10px] font-semibold flex items-center gap-1">
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
            <p className="text-text-secondary text-[10px] mt-2">We are in the process of getting a new till number. In the meantime, send money to 0758434076 and paste your M-PESA confirmation code above.</p>
          </div>

          {/* Screenshot reminder */}
          <div className="bg-primary-light rounded-xl p-3 mb-4 text-center">
            <p className="text-primary text-xs font-semibold">
              We recommend you take a screenshot of this page for your records.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-[#FFEBEE] rounded-xl p-4 text-center mb-4">
              <p className="text-cta-alt font-bold text-sm">Order Error</p>
              <p className="text-text-secondary text-xs mt-1">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={handleMpesaCodeSubmit}
            disabled={mpesaCode.trim().length < 5 || creatingOrder}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 transition-colors ${
              mpesaCode.trim().length >= 5 && !creatingOrder
                ? "bg-primary text-white hover:bg-[#1a5a9a]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 size={18} />
            {creatingOrder ? "Placing Order..." : "Confirm Payment & Place Order"}
          </button>

          <button
            onClick={handleMpesaSkip}
            disabled={creatingOrder}
            className="w-full mt-3 text-text-secondary text-sm font-medium text-center hover:text-primary transition-colors"
          >
            {creatingOrder ? "Placing Order..." : "Skip for now — I\u2019ll provide the code later"}
          </button>
        </div>
      </div>
    );
  }

  // ── Payment Confirmation Screen ──
  if (paymentStatus === "confirmed" && confirmedOrderRef.current) {
    const order = confirmedOrderRef.current;

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
            {order.paymentMethod === "cash" ? "Order Placed!" :
             order.paymentMethod === "mpesa-app" && !order.mpesaRef ? "Order Received!" :
             "Payment Confirmed!"}
          </h2>
          <p className="text-text-secondary text-sm text-center mb-4">
            {order.paymentMethod === "cash"
              ? "Your order has been placed. Have cash ready for the driver."
              : order.paymentMethod === "mpesa-app" && !order.mpesaRef
              ? "Your order has been received. Please note: your order will only be confirmed once we receive and match your M-PESA payment code."
              : order.paymentMethod === "mpesa-app" && order.mpesaRef
              ? "Your M-PESA payment code has been received. We will verify and confirm your order shortly."
              : "Your payment has been processed successfully."}
          </p>

          {/* MPESA App - No code yet - Action needed banner */}
          {order.paymentMethod === "mpesa-app" && !order.mpesaRef && (
            <div className="bg-[#FFF5EC] border-2 border-[#F5A623] rounded-xl p-4 mb-4">
              <p className="text-[#F5A623] text-xs font-bold mb-2 uppercase tracking-wide">Action Required</p>
              <p className="text-text-primary text-sm font-medium mb-2">
                Please key in your M-PESA payment code in the My Orders page so we can confirm your order.
              </p>
              <p className="text-text-secondary text-xs">
                Go to My Orders → find this order → enter the M-PESA code (e.g. UCJLD9PMW4) you received via SMS after paying.
              </p>
            </div>
          )}

          {/* Show MPESA payment details for mpesa-app orders */}
          {order.paymentMethod === "mpesa-app" && (
            <div className="bg-[#E8F5E9] rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-text-primary mb-2">MiMaji M-PESA Payment Details</p>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-secondary">Send Money To</p>
                    <p className="text-sm font-bold text-text-primary font-mono">0758434076</p>
                  </div>
                  <button onClick={() => handleCopy("0758434076", "biz-confirm")} className="text-primary text-[10px] font-semibold flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-text-secondary">Amount to Pay</p>
                    <p className="text-sm font-bold text-[#2ECC71] font-mono">KES {order.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <p className="text-text-secondary text-[10px] mt-2 text-center">
                Send money to 0758434076 and paste your M-PESA confirmation code in My Orders.
              </p>
            </div>
          )}

          {/* Order Details Card */}
          <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">
                {formatOrderId(order.orderId)}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, i) => {
                const img = getProductImage(item.id || item.name);
                return (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                        {img ? (
                          <img src={img.src} alt={item.name} className="h-8 w-auto object-contain" />
                        ) : (
                          <Droplets size={16} className="text-primary" />
                        )}
                      </div>
                      <span className="text-sm text-text-primary">{item.quantity}x {item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">KES {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gray-100 my-3" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-bold text-text-primary text-lg">KES {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Deliver To</p>
                <p className="text-sm font-medium text-text-primary">{order.address}</p>
                {order.addressDetails?.additionalDirections && (
                  <p className="text-xs text-text-secondary italic mt-1">
                    &quot;{order.addressDetails.additionalDirections}&quot;
                  </p>
                )}
                {order.addressDetails?.neighbourhood && (
                  <p className="text-xs text-primary font-medium mt-1">{order.addressDetails.neighbourhood}</p>
                )}
              </div>
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

          {/* Delivery Confirmation Code */}
          <div className="bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] rounded-xl p-4 mb-4">
            <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-2 text-center">Your Delivery Code</p>
            <div className="flex justify-center gap-2 mb-2">
              {order.deliveryCode.split("").map((digit, i) => (
                <div key={i} className="w-12 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl font-extrabold text-primary">{digit}</span>
                </div>
              ))}
            </div>
            <p className="text-text-secondary text-[11px] text-center">
              Share this code with the delivery driver to confirm your delivery.
            </p>
          </div>

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
        {/* Product Images */}
        <div className="flex justify-center mt-6 gap-2">
          {items.slice(0, 3).map((item) => {
            const img = getProductImage(item.id);
            return (
              <div key={item.id} className="w-[100px] h-[100px] bg-primary-light rounded-2xl flex items-center justify-center p-2">
                {img ? (
                  <img src={img.src} alt={item.name} className="h-full w-auto object-contain" />
                ) : (
                  <Droplets size={36} className="text-primary" />
                )}
              </div>
            );
          })}
          {items.length > 3 && (
            <div className="w-[100px] h-[100px] bg-primary-light rounded-2xl flex items-center justify-center">
              <span className="text-primary font-bold text-sm">+{items.length - 3} more</span>
            </div>
          )}
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

          </div>

          {/* ── Full Order Breakdown ── */}
          <div className="bg-surface shadow-card rounded-xl p-4 mt-4">
            <h3 className="font-bold text-sm text-text-primary mb-3">Order Summary</h3>
            <div className="space-y-3">
              {cartWithDiscounts.map((item) => {
                const img = getProductImage(item.id);
                const hasDiscount = item.discount.discount > 0;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                      {img ? (
                        <img src={img.src} alt={item.name} className="h-8 w-auto object-contain" />
                      ) : (
                        <Droplets size={16} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary font-medium truncate">{item.quantity}x {item.name}</p>
                      <div className="flex items-center gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-xs text-text-secondary line-through">KES {item.basePrice.toLocaleString()}</span>
                            <span className="text-xs font-semibold text-[#2ECC71]">KES {item.discountedPrice.toLocaleString()} ea</span>
                          </>
                        ) : (
                          <span className="text-xs text-text-secondary">KES {item.basePrice.toLocaleString()} ea</span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                      KES {(item.discountedPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gray-100 my-3" />

            {/* Subtotal */}
            <div className="flex justify-between items-center text-sm text-text-secondary mb-1">
              <span>Subtotal</span>
              <span>KES {discountedSubtotal.toLocaleString()}</span>
            </div>
            {totalSavings > 0 && (
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-[#2ECC71] font-medium">Bulk discount savings</span>
                <span className="text-[#2ECC71] font-semibold">- KES {totalSavings.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm text-text-secondary mb-1">
              <span>Delivery Fee</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>

            {/* Rewards Discount */}
            {rewardsDiscount > 0 && (
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-[#2ECC71] font-semibold">Rewards Discount ({rewardsApplied}L)</span>
                <span className="text-[#2ECC71] font-semibold">- KES {rewardsDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="h-px bg-gray-100 my-3" />

            {/* Total to Pay - now inside the same card */}
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-text-primary">Total to Pay</span>
              <span className="text-xl font-bold text-text-primary">KES {finalTotal.toLocaleString()}</span>
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
                  {rewardsApplied}L free water applied — you save KES {rewardsDiscount.toLocaleString()}!
                </p>
              )}
            </div>
          )}

          <div className="h-px bg-gray-100 my-4" />

          {/* Payment Method Selection */}
          <h3 className="font-bold text-sm text-text-primary mb-3">Payment Method</h3>

          {/* Option 1: STK Push — CROSSED OUT */}
          <div
            className="w-full flex items-center gap-3 rounded-xl p-4 mb-3 bg-gray-100 border-2 border-transparent opacity-40 cursor-not-allowed relative"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
              <Smartphone size={20} className="text-text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-secondary line-through">M-PESA (STK Push)</p>
              <p className="text-text-secondary text-xs">Not available</p>
            </div>
          </div>

          {/* Option 2: Pay via M-PESA App — CROSSED OUT */}
          <div
            className="w-full flex items-center gap-3 rounded-xl p-4 mb-3 bg-gray-100 border-2 border-transparent opacity-40 cursor-not-allowed relative"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
              <Smartphone size={20} className="text-text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-secondary line-through">Pay via M-PESA App (Paybill)</p>
              <p className="text-text-secondary text-xs">Not available</p>
            </div>
          </div>

          {/* Option 3: M-PESA / Cash on Delivery — ONLY SELECTABLE OPTION */}
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
              <p className="font-bold text-sm text-text-primary">M-PESA / Cash on Delivery</p>
              <p className="text-text-secondary text-xs">Send money via M-PESA or pay cash to the driver</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "cash" ? "border-[#2ECC71] bg-[#2ECC71]" : "border-gray-300"
            }`}>
              {paymentMethod === "cash" && <CheckCircle2 size={14} className="text-white" />}
            </div>
          </button>

          {/* M-PESA / Cash on Delivery Info */}
          {paymentMethod === "cash" && (
            <div className="bg-primary-light rounded-xl p-4 mb-4">
              <p className="font-bold text-sm text-text-primary mb-1">M-PESA / Cash on Delivery</p>
              <p className="text-text-secondary text-xs">
                Have <span className="font-bold text-text-primary">KES {finalTotal.toLocaleString()}</span> ready.
                You can send money via M-PESA or pay the driver in cash when your water arrives.
              </p>

              <div className="mt-3 bg-[#E8F5E9] rounded-lg p-3">
                <p className="text-[#2ECC71] text-xs font-bold mb-1">Pay via M-PESA (Send Money)</p>
                <p className="text-text-primary text-xs">
                  We are in the process of getting a new till number. In the meantime, please send money to <span className="font-bold">0758434076</span> and paste your M-PESA payment confirmation code here so we can track your order.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold text-text-primary font-mono bg-white px-3 py-1.5 rounded-lg">0758434076</span>
                  <button onClick={() => handleCopy("0758434076", "phone")} className="flex items-center gap-1 bg-white text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
                    {copied === "phone" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied === "phone" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="mt-2 bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={14} className="text-primary flex-shrink-0" />
                  <p className="text-text-primary text-xs font-semibold">Cash Option</p>
                </div>
                <p className="text-text-secondary text-xs">
                  You can also pay KES {finalTotal.toLocaleString()} in cash to the driver on delivery.
                </p>
              </div>
            </div>
          )}


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
             paymentMethod === "cash" ? "Place Order (M-PESA / Cash on Delivery)" :
             "Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
