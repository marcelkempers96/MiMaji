"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

interface RiderForm {
  fullName: string;
  phone: string;
  idNumber: string;
  zone: string;
  vehicleType: string;
  licenseNumber: string;
  experience: string;
  availability: string[];
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

const vehicleTypes = [
  { value: "motorcycle", label: "🏍 Motorcycle", icon: "🏍" },
  { value: "bicycle", label: "🚲 Bicycle", icon: "🚲" },
  { value: "tuktuk", label: "🛺 Tuk-tuk", icon: "🛺" },
  { value: "van", label: "🚐 Van / Pickup", icon: "🚐" },
];

const availabilitySlots = [
  "Morning (6AM–12PM)",
  "Afternoon (12PM–5PM)",
  "Evening (5PM–9PM)",
  "Weekends",
  "Full-time",
];

export default function RiderSignupPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<RiderForm>({
    fullName: "",
    phone: "",
    idNumber: "",
    zone: "",
    vehicleType: "",
    licenseNumber: "",
    experience: "",
    availability: [],
  });

  const updateForm = (field: keyof RiderForm, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAvailability = (slot: string) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter((s) => s !== slot)
        : [...prev.availability, slot],
    }));
  };

  const canProceedStep1 = form.fullName && form.phone.length >= 9 && form.idNumber;
  const canProceedStep2 = form.zone && form.vehicleType;
  const canSubmit = canProceedStep2 && form.availability.length > 0;

  const handleSubmit = () => {
    // In production: POST to /api/join/rider
    console.log("Rider application:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-blue-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Application Received!
          </h1>
          <p className="text-text-mid text-sm mb-6 max-w-xs">
            Thanks, {form.fullName}! We&apos;ll review your application and
            contact you on +254 {form.phone} within 24–48 hours.
          </p>
          <div className="bg-white rounded-2xl p-5 border border-blue-200 w-full max-w-sm mb-6">
            <h3 className="font-bold text-blue-900 text-sm mb-3">What&apos;s next?</h3>
            <div className="space-y-2.5 text-sm text-text-mid">
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                We verify your details
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                Brief phone interview
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                Get your rider account activated
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                Start delivering & earning!
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
        className="px-5 pt-6 pb-10 relative overflow-hidden bg-blue-900"
      >
        <h1 className="text-2xl font-bold text-white leading-tight mb-1">
          Deliver with MiMaji
        </h1>
        <p className="text-blue-200 text-sm">
          Earn money delivering water in your neighbourhood
        </p>
      </div>

      {/* Benefits */}
      <div className="-mt-5 mx-4 bg-white rounded-2xl p-4 shadow-lg relative z-10 mb-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: "💰", title: "Earn daily", sub: "Get paid per delivery" },
            { icon: "🕐", title: "Flexible hours", sub: "Work when you want" },
            { icon: "📍", title: "Your area", sub: "Deliver in your zone" },
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
          <span className="text-[10px] text-text-mid">Personal</span>
          <span className="text-[10px] text-text-mid">Delivery</span>
          <span className="text-[10px] text-text-mid">Schedule</span>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">
                Personal Details
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateForm("fullName", e.target.value)}
                  placeholder="e.g. John Kamau"
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
                  National ID Number
                </label>
                <input
                  type="text"
                  value={form.idNumber}
                  onChange={(e) => updateForm("idNumber", e.target.value)}
                  placeholder="e.g. 12345678"
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

          {/* Step 2: Delivery Details */}
          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">
                Delivery Details
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  📍 Preferred Zone
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
                  🚗 Vehicle Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {vehicleTypes.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => updateForm("vehicleType", v.value)}
                      className={`p-3 rounded-xl border-[1.5px] text-center transition-all ${
                        form.vehicleType === v.value
                          ? "bg-blue-50 border-blue-700 text-blue-900"
                          : "bg-white border-blue-200 text-text-mid"
                      }`}
                    >
                      <div className="text-2xl mb-1">{v.icon}</div>
                      <div className="text-xs font-semibold">{v.label.split(" ")[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  License / Permit Number (optional)
                </label>
                <input
                  type="text"
                  value={form.licenseNumber}
                  onChange={(e) => updateForm("licenseNumber", e.target.value)}
                  placeholder="e.g. DL-12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50"
                />
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

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">
                Your Availability
              </h2>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  🕐 When can you deliver?
                </label>
                <div className="space-y-2">
                  {availabilitySlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => toggleAvailability(slot)}
                      className={`w-full p-3 rounded-xl border-[1.5px] text-left text-sm font-medium transition-all flex items-center gap-3 ${
                        form.availability.includes(slot)
                          ? "bg-blue-50 border-blue-700 text-blue-900"
                          : "bg-white border-blue-200 text-text-mid"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          form.availability.includes(slot)
                            ? "bg-blue-700 text-white"
                            : "border-[1.5px] border-blue-200"
                        }`}
                      >
                        {form.availability.includes(slot) && "✓"}
                      </div>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">
                  💧 Delivery experience (optional)
                </label>
                <textarea
                  value={form.experience}
                  onChange={(e) => updateForm("experience", e.target.value)}
                  placeholder="Tell us about any delivery or water distribution experience..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-blue-200 text-sm text-blue-900 bg-blue-50 resize-none"
                />
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
