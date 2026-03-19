"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, Suspense } from "react";
import { MapPin, User, Star, Phone, Share2, Droplets, Package, Truck, CheckCircle2, Clock, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { mockOrders } from "@/data/orders";

const statusSteps = [
  { key: "Processing", label: "Processing", description: "Your order is being prepared", icon: Clock, color: "text-rating" },
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
  const order = orderId ? mockOrders.find((o) => o.id === orderId) : null;
  const currentStep = order ? getStepIndex(order.status) : 2; // default to In Transit
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  useEffect(() => {
    if (currentStep < 3) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const minutes = Math.floor(secondsLeft / 60);

  const trackContent = (
    <>
      {/* Order Info Header */}
      {order && (
        <div className="bg-surface shadow-card rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded-full">{order.id}</span>
            <span className="text-xs text-text-secondary">{order.date}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Droplets size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-text-primary">{order.productName}</p>
              <p className="text-text-secondary text-xs">KES {order.amountPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ETA */}
      {currentStep < 3 && (
        <div className="text-center mb-4">
          <p className="text-text-secondary text-sm">Estimated delivery</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{minutes} min</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <MapPin size={14} className="text-primary" />
            <span className="text-text-secondary text-sm">Kilimani, Nairobi</span>
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

      {/* Driver Card - Only show for In Transit */}
      {currentStep >= 2 && currentStep < 3 && (
        <div className="bg-surface shadow-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-text-primary">Driver: Moses</p>
              <p className="text-text-secondary text-sm">KCX 246F - Toyota</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="text-rating" fill="currentColor" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" className="flex-1">
              <Phone size={16} />
              Contact
            </Button>
            <button className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Share2 size={16} className="text-primary" />
            </button>
          </div>
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
