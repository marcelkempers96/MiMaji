"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

interface ProviderForm {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  zone: string;
  address: string;
  businessType: string;
  jugCapacity: string;
  waterSource: string;
  hasPermit: boolean;
  permitNumber: string;
  operatingHours: string;
  pricePerJug: string;
  deliveryCapable: boolean;
  description: string;
}

const zones = [
  "Westlands",
  "Kilimani",
  "Karen",
  "Kileleshwa",
  "CBD",
  "Parklands",
  "Langata",
  "Embakasi",
  "Kasarani",
  "Thika Road",
];

const businessTypes = [
  { value: "kiosk", label: "Water Kiosk", icon: "🏪", desc: "Standalone water point" },
  { value: "depot", label: "Water Depot", icon: "🏭", desc: "Large-scale water storage" },
  { value: "shop", label: "Shop / Retail", icon: "🏬", desc: "Shop selling water" },
  { value: "borehole", label: "Borehole Owner", icon: "🕳", desc: "Private borehole supply" },
];

const waterSources = [
  "Municipal / NCWSC",
  "Borehole",
  "Rainwater harvesting",
  "Private tanker supply",
  "Mixed sources",
];

export default function ProviderSignupPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ProviderForm>({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    zone: "",
    address: "",
    businessType: "",
    jugCapacity: "",
    waterSource: "",
    hasPermit: false,
    permitNumber: "",
    operatingHours: "",
    pricePerJug: "200",
    deliveryCapable: false,
    description: "",
  });

  const updateForm = (field: keyof ProviderForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = form.businessName && form.ownerName && form.phone.length >= 9;
  const canProceedStep2 = form.zone && form.businessType;
  const canSubmit = canProceedStep2 && form.waterSource;

  const handleSubmit = () => {
    console.log("Provider application:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="font-display text-2xl font-bold text-blue-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-text-mid text-sm mb-6 max-w-xs">
            Thanks, {form.ownerName}! We&apos;ll review{" "}
            <strong>{form.businessName}</strong> and reach out on +254{" "}
            {form.phone} within 48 hours.
          </p>
          <div className="bg-white rounded-2xl p-5 border border-blue-200 w-full max-w-sm mb-6">
            <h3 className="font-bold text-blue-900 text-sm mb-3">
              Verification process
            </h3>
            <div className="space-y-2.5 text-sm text-text-mid">
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                Application review (24–48 hrs)
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                Site visit & water quality check
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                Account activation & training
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                Go live on MiMaji! 🎉
              </div>
            </div>
          </div>
          <Button onClick={() => (window.location.href = "/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-body">
      <Navbar />

      {/* Header */}
      <div
        className="px-5 pt-6 pb-10 relative overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1A4B8C 0%, #0A2342 100%)",
        }}
      >
        <h1 className="font-display text-2xl font-bold text-white leading-tight mb-1">
          List your water business
        </h1>
        <p className="text-blue-200 text-sm">
          Join MiMaji and reach thousands of customers
        </p>
      </div>

      {/* Benefits */}
      <div className="-mt-5 mx-4 bg-white rounded-2xl p-4 shadow-lg relative z-10 mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "📈", title: "More sales", sub: "Reach new customers" },
            { icon: "📱", title: "Easy orders", sub: "Digital order system" },
            { icon: "💳", title: "M-Pesa pay", sub: "Instant payments" },
          ].map((b) => (
            <div key={b.title} className="p-2">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="font-bold text-blue-900 text-xs">{b.title}</div>
              <div className="text-[10px] text-text-light">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? "bg-blue-700 text-white"
                    : "bg-blue-200 text-blue-500"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    step > s ? "bg-blue-700" : "bg-blue-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-mid">Business</span>
          <span className="text-[10px] text-text-mid">Location</span>
          <span className="text-[10px] text-text-mid">Operations</span>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm">
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-display font-bold text-blue-900 text-lg">
                Business Information
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => updateForm("businessName", e.target.value)}
                  placeholder="e.g. AquaPure Water Kiosk"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Owner / Manager Name
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => updateForm("ownerName", e.target.value)}
                  placeholder="e.g. Jane Wanjiku"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  📱 Phone Number
                </label>
                <div className="flex border-[1.5px] border-blue-200 rounded-xl overflow-hidden bg-blue-50">
                  <span className="px-3 py-2.5 bg-blue-200 text-blue-900 text-sm font-semibold">
                    +254
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      updateForm(
                        "phone",
                        e.target.value.replace(/\D/g, "").slice(0, 9)
                      )
                    }
                    placeholder="712 345 678"
                    className="flex-1 px-3 py-2.5 border-none bg-transparent text-sm text-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="e.g. info@aquapure.co.ke"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <Button
                size="lg"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Continue →
              </Button>
            </div>
          )}

          {/* Step 2: Location & Type */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-display font-bold text-blue-900 text-lg">
                Location & Business Type
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  📍 Zone / Area
                </label>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button
                      key={zone}
                      onClick={() => updateForm("zone", zone)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-[1.5px] transition-all ${
                        form.zone === zone
                          ? "bg-blue-700 text-white border-blue-700"
                          : "bg-blue-50 text-blue-500 border-blue-200"
                      }`}
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="e.g. 123 Waiyaki Way, Westlands"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  🏪 Business Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => updateForm("businessType", bt.value)}
                      className={`p-3 rounded-xl border-[1.5px] text-center transition-all ${
                        form.businessType === bt.value
                          ? "bg-blue-50 border-blue-700 text-blue-900"
                          : "bg-white border-blue-200 text-text-mid"
                      }`}
                    >
                      <div className="text-2xl mb-1">{bt.icon}</div>
                      <div className="text-xs font-bold">{bt.label}</div>
                      <div className="text-[10px] text-text-light">
                        {bt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  size="lg"
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className="flex-1"
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Operations */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-display font-bold text-blue-900 text-lg">
                Operations & Capacity
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  💧 Water Source
                </label>
                <div className="space-y-1.5">
                  {waterSources.map((src) => (
                    <button
                      key={src}
                      onClick={() => updateForm("waterSource", src)}
                      className={`w-full p-2.5 rounded-xl border-[1.5px] text-left text-sm font-medium transition-all flex items-center gap-2 ${
                        form.waterSource === src
                          ? "bg-blue-50 border-blue-700 text-blue-900"
                          : "bg-white border-blue-200 text-text-mid"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          form.waterSource === src
                            ? "border-blue-700"
                            : "border-blue-200"
                        }`}
                      >
                        {form.waterSource === src && (
                          <div className="w-2 h-2 rounded-full bg-blue-700" />
                        )}
                      </div>
                      {src}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Daily Capacity (20L jugs)
                </label>
                <input
                  type="text"
                  value={form.jugCapacity}
                  onChange={(e) => updateForm("jugCapacity", e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Price per 20L Jug (KES)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-text-mid text-sm">KES</span>
                  <input
                    type="text"
                    value={form.pricePerJug}
                    onChange={(e) => updateForm("pricePerJug", e.target.value)}
                    className="flex-1 px-3 py-2.5 border-[1.5px] border-blue-200 rounded-xl text-sm font-bold text-blue-900 bg-blue-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  🕐 Operating Hours
                </label>
                <input
                  type="text"
                  value={form.operatingHours}
                  onChange={(e) => updateForm("operatingHours", e.target.value)}
                  placeholder="e.g. 6:00 AM – 8:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
              </div>

              <div>
                <button
                  onClick={() =>
                    updateForm("hasPermit", !form.hasPermit)
                  }
                  className="w-full p-3 rounded-xl border-[1.5px] text-left text-sm font-medium flex items-center gap-3 border-blue-200 text-text-mid"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                      form.hasPermit
                        ? "bg-blue-700 text-white"
                        : "border-[1.5px] border-blue-200"
                    }`}
                  >
                    {form.hasPermit && "✓"}
                  </div>
                  I have a valid water business permit
                </button>
              </div>

              <div>
                <button
                  onClick={() =>
                    updateForm("deliveryCapable", !form.deliveryCapable)
                  }
                  className="w-full p-3 rounded-xl border-[1.5px] text-left text-sm font-medium flex items-center gap-3 border-blue-200 text-text-mid"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                      form.deliveryCapable
                        ? "bg-blue-700 text-white"
                        : "border-[1.5px] border-blue-200"
                    }`}
                  >
                    {form.deliveryCapable && "✓"}
                  </div>
                  We can deliver to customers
                </button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  Submit Application
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
