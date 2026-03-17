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

const zones = ["Westlands","Kilimani","Karen","Kileleshwa","CBD","Parklands","Langata","Embakasi","Kasarani","Thika Road"];

const vehicleTypes = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "bicycle", label: "Bicycle" },
  { value: "tuktuk", label: "Tuk-tuk" },
  { value: "van", label: "Van / Pickup" },
];

const availabilitySlots = ["Morning (6AM–12PM)","Afternoon (12PM–5PM)","Evening (5PM–9PM)","Weekends","Full-time"];

export default function RiderSignupPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<RiderForm>({
    fullName: "", phone: "", idNumber: "", zone: "", vehicleType: "",
    licenseNumber: "", experience: "", availability: [],
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
    console.log("Rider application:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Application Received!</h1>
          <p className="text-text-mid text-sm mb-6 max-w-xs">
            Thanks, {form.fullName}! We&apos;ll review your application and contact you on +254 {form.phone} within 24–48 hours.
          </p>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-bold text-blue-900 text-sm mb-3">What&apos;s next?</h3>
            <div className="space-y-2.5 text-sm text-text-mid">
              {["We verify your details", "Brief phone interview", "Get your rider account activated", "Start delivering & earning!"].map((s, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-blue-700 font-bold">{i + 1}.</span> {s}
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-8 pb-12">
        <h1 className="text-2xl font-bold text-blue-900 leading-tight mb-1">Deliver with MiMaji</h1>
        <p className="text-text-mid text-sm">Earn money delivering water in your neighbourhood</p>
      </div>

      <div className="-mt-5 mx-4 bg-white rounded-2xl p-4 relative z-10 mb-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { title: "Earn daily", sub: "Get paid per delivery" },
            { title: "Flexible hours", sub: "Work when you want" },
            { title: "Your area", sub: "Deliver in your zone" },
          ].map((b) => (
            <div key={b.title} className="p-2">
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-400"}`}>
                {step > s ? "\u2713" : s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-1 ${step > s ? "bg-blue-700" : "bg-blue-100"}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-mid">Personal</span>
          <span className="text-[10px] text-text-mid">Delivery</span>
          <span className="text-[10px] text-text-mid">Schedule</span>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">Personal Details</h2>
              {[
                { label: "Full Name", field: "fullName" as const, placeholder: "e.g. John Kamau" },
                { label: "National ID Number", field: "idNumber" as const, placeholder: "e.g. 12345678" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">{f.label}</label>
                  <input type="text" value={form[f.field] as string} onChange={(e) => updateForm(f.field, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Phone Number</label>
                <div className="flex rounded-2xl overflow-hidden bg-blue-50">
                  <span className="px-3 py-3 bg-blue-100 text-blue-900 text-sm font-semibold">+254</span>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="712 345 678" className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900" />
                </div>
              </div>
              <Button size="lg" onClick={() => setStep(2)} disabled={!canProceedStep1}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">Delivery Details</h2>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Preferred Zone</label>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button key={zone} onClick={() => updateForm("zone", zone)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${form.zone === zone ? "bg-blue-700 text-white" : "bg-blue-50 text-text-mid"}`}>{zone}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Vehicle Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {vehicleTypes.map((v) => (
                    <button key={v.value} onClick={() => updateForm("vehicleType", v.value)} className={`p-3 rounded-2xl text-center transition-all ${form.vehicleType === v.value ? "bg-blue-50 border-2 border-blue-700 text-blue-900" : "bg-white border-2 border-blue-50 text-text-mid"}`}>
                      <div className="text-xs font-semibold">{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">License / Permit Number (optional)</label>
                <input type="text" value={form.licenseNumber} onChange={(e) => updateForm("licenseNumber", e.target.value)} placeholder="e.g. DL-12345" className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">Your Availability</h2>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">When can you deliver?</label>
                <div className="space-y-2">
                  {availabilitySlots.map((slot) => (
                    <button key={slot} onClick={() => toggleAvailability(slot)} className={`w-full p-3 rounded-2xl text-left text-sm font-medium transition-all flex items-center gap-3 ${form.availability.includes(slot) ? "bg-blue-50 border-2 border-blue-700 text-blue-900" : "bg-white border-2 border-blue-50 text-text-mid"}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${form.availability.includes(slot) ? "bg-blue-700 text-white" : "border-2 border-blue-200"}`}>
                        {form.availability.includes(slot) && "\u2713"}
                      </div>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Delivery experience (optional)</label>
                <textarea value={form.experience} onChange={(e) => updateForm("experience", e.target.value)} placeholder="Tell us about any delivery or water distribution experience..." rows={3} className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 resize-none" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" onClick={handleSubmit} disabled={!canSubmit} className="flex-1">Submit Application</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
