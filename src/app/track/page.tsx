"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Button from "@/components/shared/Button";

type TrackingStep = "searching" | "assigned" | "picking_up" | "on_the_way" | "arriving" | "delivered";

interface RiderInfo {
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  rating: number;
}

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [step, setStep] = useState<TrackingStep>("on_the_way");
  const [eta, setEta] = useState(18);

  const rider: RiderInfo = {
    name: "James Ochieng",
    phone: "+254 722 XXX XXX",
    vehicle: "Motorcycle",
    plate: "KMFX 234P",
    rating: 4.9,
  };

  useEffect(() => {
    if (!tracking || step === "delivered") return;
    const timer = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(timer);
  }, [tracking, step]);

  const steps: { key: TrackingStep; label: string; time: string }[] = [
    { key: "searching", label: "Finding rider", time: "2:30 PM" },
    { key: "assigned", label: "Rider assigned", time: "2:31 PM" },
    { key: "picking_up", label: "Picking up water", time: "2:35 PM" },
    { key: "on_the_way", label: "On the way to you", time: "2:42 PM" },
    { key: "arriving", label: "Almost there", time: "" },
    { key: "delivered", label: "Delivered!", time: "" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === step);

  const stepMessages: Record<TrackingStep, string> = {
    searching: "Looking for a rider near the water depot...",
    assigned: "James is heading to the depot to pick up your water.",
    picking_up: "James is at the depot collecting your 20L jugs.",
    on_the_way: `James is on the way! Estimated arrival in ${eta} minutes.`,
    arriving: "James is almost at your location. Get ready!",
    delivered: "Your water has been delivered. Enjoy!",
  };

  if (!tracking) {
    return (
      <div className="min-h-screen bg-bg font-body">
        <Navbar />
        <div className="px-4 py-12 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-blue-900 mb-2">
              Track My Water
            </h1>
            <p className="text-text-mid text-sm">
              Enter your order number to track your delivery in real-time
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="e.g. MJ-2847"
              className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 mb-4 font-mono"
            />
            <Button
              size="lg"
              onClick={() => setTracking(true)}
              disabled={!orderId}
            >
              Track Order
            </Button>
          </div>

          <div className="mt-8 text-center text-text-light text-xs">
            You can also find your order number in your SMS confirmation or in{" "}
            <a href="/orders" className="text-blue-700 font-semibold">
              My Orders
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body">
      {/* Map area */}
      <div className="bg-blue-50 h-64 relative">
        {/* Back button */}
        <button
          onClick={() => setTracking(false)}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          &larr;
        </button>

        {/* Simulated map */}
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5A7A9A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                <line x1="9" y1="3" x2="9" y2="18"/>
                <line x1="15" y1="6" x2="15" y2="21"/>
              </svg>
            </div>
            <p className="text-sm text-text-mid font-semibold">Live Map</p>
            <p className="text-xs text-text-light">Connect Google Maps API to enable</p>
          </div>
        </div>

        {/* Rider marker */}
        <div className="absolute bottom-12 left-1/3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center shadow-md text-sm font-bold">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
        </div>

        {/* Destination marker */}
        <div className="absolute bottom-16 right-1/4">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-700 flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        </div>

        {/* ETA overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-2" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="text-[10px] text-text-mid font-semibold uppercase">ETA</div>
          <div className="text-xl font-bold text-blue-900">{eta} min</div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10" style={{ boxShadow: "0 -4px 20px rgba(26, 58, 92, 0.08)" }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-blue-100 rounded-full" />
        </div>

        {/* Status message */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-blue-900">
                {steps[currentIdx]?.label}
              </div>
              <div className="text-sm text-text-mid">
                {stepMessages[step]}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-blue-50 rounded-full h-2 mb-4">
            <div
              className="h-full bg-blue-700 rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Rider card */}
          {step !== "searching" && step !== "delivered" && (
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    {rider.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-bold text-blue-900 text-sm">
                      {rider.name}
                    </div>
                    <div className="text-xs text-text-mid">
                      {rider.vehicle} &middot; {rider.plate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-amber-500 font-bold">
                    &#9733; {rider.rating}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`tel:${rider.phone}`)}
                >
                  Call Rider
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`sms:${rider.phone}`)}
                >
                  Message
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-start gap-3">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      i < currentIdx
                        ? "bg-blue-700"
                        : i === currentIdx
                          ? "bg-blue-500 ring-2 ring-blue-200"
                          : "bg-blue-100"
                    }`}
                  />
                  {i < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        i < currentIdx ? "bg-blue-700" : "bg-blue-100"
                      }`}
                    />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6 -mt-0.5">
                  <div
                    className={`text-sm font-medium ${
                      i <= currentIdx ? "text-blue-900" : "text-text-light"
                    }`}
                  >
                    {s.label}
                  </div>
                  {s.time && i <= currentIdx && (
                    <div className="text-[11px] text-text-light">{s.time}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Demo controls */}
          <div className="bg-blue-50 rounded-2xl p-3 mt-2">
            <div className="text-[11px] text-text-light mb-2">
              Demo: Change delivery status
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setStep(s.key);
                    if (s.key === "on_the_way") setEta(18);
                    if (s.key === "arriving") setEta(3);
                    if (s.key === "delivered") setEta(0);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    step === s.key
                      ? "bg-blue-700 text-white"
                      : "bg-white text-blue-500"
                  }`}
                  style={step !== s.key ? { boxShadow: "var(--shadow-soft)" } : undefined}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
