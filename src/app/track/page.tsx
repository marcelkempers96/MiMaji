"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, Suspense } from "react";
import { MapPin, Droplets, Package, Truck, CheckCircle2, Clock, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useSearchParams } from "next/navigation";
import { fetchOrderById, OrderRecord, mapOrderStatus, formatOrderDate, formatOrderId } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

const statusSteps = [
  { key: "Processing", label: "Processing", description: "Your order has been received and is being processed", icon: Clock, color: "text-rating" },
  { key: "Confirmed", label: "Order Confirmed", description: "Payment received & order confirmed", icon: Package, color: "text-primary" },
  { key: "In Transit", label: "Out for Delivery", description: "Your water is on the way!", icon: Truck, color: "text-[#2ECC71]" },
  { key: "Delivered", label: "Delivered", description: "Order has been delivered", icon: CheckCircle2, color: "text-[#2ECC71]" },
];

function getStepIndex(status: string) {
  if (status === "Processing") return 0;
  if (status === "Confirmed") return 1;
  if (status === "In Transit") return 2;
  if (status === "Delivered") return 3;
  return 0;
}

export default function TrackPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Droplets size={32} className="text-primary animate-pulse" /></div>}>
      <TrackPage />
    </Suspense>
  );
}

function TrackPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order from Supabase
  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Subscribe to realtime updates on this order
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => prev ? { ...prev, ...payload.new } as OrderRecord : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const displayStatus = order ? mapOrderStatus(order.status) : "Processing";
  const currentStep = getStepIndex(displayStatus);
  const displayDate = order ? formatOrderDate(order.created_at) : "";
  const displayId = order ? formatOrderId(order.id) : "";
  const orderItemsList = order?.order_items && order.order_items.length > 0
    ? order.order_items
    : order?.product_name
      ? [{ name: order.product_name, quantity: order.quantity || 1, price: order.price_total }]
      : [{ name: "Water Order", quantity: 1, price: order?.price_total || 0 }];
  const estimatedMinutes = order?.estimated_delivery_minutes;

  const trackContent = (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Droplets size={32} className="text-primary animate-pulse" />
        </div>
      ) : !order ? (
        <div className="bg-surface shadow-card rounded-xl p-8 text-center">
          <Droplets size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-primary font-bold mb-1">Order not found</p>
          <p className="text-text-secondary text-sm">This order may not exist or you may not have access.</p>
          <Link href="/orders" className="text-primary font-semibold text-sm mt-3 inline-block">
            View My Orders →
          </Link>
        </div>
      ) : (
        <>
          {/* Order Info Header */}
          <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">{displayId}</span>
              <span className="text-xs text-text-secondary">{displayDate}</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Droplets size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                {orderItemsList.map((item, idx) => (
                  <p key={idx} className="text-sm text-text-primary">
                    <span className="font-bold">{item.quantity}x</span> {item.name}
                  </p>
                ))}
                <p className="text-text-secondary text-sm mt-1">KES {order.price_total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ETA - only show if vendor has set estimated_delivery_minutes and order is confirmed or in transit */}
          {currentStep >= 1 && currentStep < 3 && estimatedMinutes && (
            <div className="text-center mb-4">
              <p className="text-text-secondary text-sm">Estimated delivery</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{estimatedMinutes} min</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin size={14} className="text-primary" />
                <span className="text-text-secondary text-sm">{order.delivery_address}</span>
              </div>
            </div>
          )}

          {/* Processing info - when no ETA yet */}
          {currentStep === 0 && (
            <div className="text-center mb-4 bg-[#FFF5EC] rounded-xl p-4">
              <Clock size={24} className="text-rating mx-auto mb-2" />
              <p className="font-bold text-sm text-text-primary">Order is being processed</p>
              <p className="text-text-secondary text-xs mt-1">
                We&apos;re connecting with our vendor. Estimated delivery time will appear once confirmed.
              </p>
            </div>
          )}

          {/* Delivery address */}
          {currentStep >= 1 && currentStep < 3 && !estimatedMinutes && (
            <div className="text-center mb-4">
              <p className="text-text-secondary text-sm">Delivering to</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin size={14} className="text-primary" />
                <span className="text-text-primary text-sm font-medium">{order.delivery_address}</span>
              </div>
            </div>
          )}

          {/* Order Status Steps */}
          <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
            <h3 className="font-bold text-sm text-text-primary mb-4">Order Status</h3>
            <div className="relative">
              {statusSteps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = i <= currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Vertical line */}
                    {i < statusSteps.length - 1 && (
                      <div
                        className={`absolute left-[17px] top-[36px] w-0.5 h-[calc(100%-8px)] ${
                          i < currentStep ? "bg-[#2ECC71]" : "bg-gray-200"
                        }`}
                      />
                    )}
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isActive
                          ? isCurrent
                            ? "bg-primary ring-4 ring-primary-light"
                            : "bg-[#2ECC71]"
                          : "bg-gray-100"
                      }`}
                    >
                      <StepIcon size={18} className={isActive ? "text-white" : "text-text-secondary"} />
                    </div>
                    {/* Text */}
                    <div className={`pb-6 ${i === statusSteps.length - 1 ? "pb-0" : ""}`}>
                      <p className={`font-semibold text-sm ${isActive ? "text-text-primary" : "text-text-secondary"}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isCurrent ? "text-primary font-medium" : "text-text-secondary"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map Placeholder - Only show for In Transit */}
          {currentStep >= 2 && currentStep < 3 && (
            <div className="h-48 md:h-64 bg-primary-light rounded-2xl mb-4 flex flex-col items-center justify-center">
              <MapPin size={32} className="text-primary" />
              <div className="border-t-2 border-dashed border-primary w-1/2 mx-auto mt-2" />
              <p className="text-primary/40 text-xs mt-2">Live tracking coming soon</p>
            </div>
          )}

          {/* Vendor / Store Info */}
          {order.vendor_name && (
            <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
              <p className="text-xs text-text-secondary mb-2">Your water is coming from</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                  <Droplets size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary">{order.vendor_name}</p>
                  {order.vendor_location && (
                    <p className="text-text-secondary text-xs flex items-center gap-1">
                      <MapPin size={12} /> {order.vendor_location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* M-Pesa reference if available */}
          {order.mpesa_ref && (
            <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
              <p className="text-xs text-text-secondary">M-Pesa Reference</p>
              <p className="font-bold text-sm text-text-primary">{order.mpesa_ref}</p>
            </div>
          )}

          {/* Back to orders */}
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 mt-6 text-primary text-sm font-semibold"
          >
            <ChevronLeft size={16} />
            Back to My Orders
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Track Order" />
        <div className="px-4 pt-4 max-w-md mx-auto">{trackContent}</div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
              <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Track Your Delivery</h1>
          {trackContent}
        </div>
      </div>
    </div>
  );
}
