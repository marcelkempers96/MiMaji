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

const zones = ["Westlands","Kilimani","Karen","Kileleshwa","CBD","Parklands","Langata","Embakasi","Kasarani","Thika Road"];

const businessTypes = [
  { value: "kiosk", label: "Water Kiosk", desc: "Standalone water point" },
  { value: "depot", label: "Water Depot", desc: "Large-scale water storage" },
  { value: "shop", label: "Shop / Retail", desc: "Shop selling water" },
  { value: "borehole", label: "Borehole Owner", desc: "Private borehole supply" },
];

const waterSources = ["Municipal / NCWSC","Borehole","Rainwater harvesting","Private tanker supply","Mixed sources"];

export default function ProviderSignupPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ProviderForm>({
    businessName: "", ownerName: "", phone: "", email: "", zone: "", address: "",
    businessType: "", jugCapacity: "", waterSource: "", hasPermit: false,
    permitNumber: "", operatingHours: "", pricePerJug: "200", deliveryCapable: false,
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
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Application Submitted!</h1>
          <p className="text-text-mid text-sm mb-6 max-w-xs">
            Thanks, {form.ownerName}! We&apos;ll review <strong>{form.businessName}</strong> and reach out on +254 {form.phone} within 48 hours.
          </p>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <h3 className="font-bold text-blue-900 text-sm mb-3">Verification process</h3>
            <div className="space-y-2.5 text-sm text-text-mid">
              {["Application review (24–48 hrs)", "Site visit & water quality check", "Account activation & training", "Go live on MiMaji!"].map((s, i) => (
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
        <h1 className="text-2xl font-bold text-blue-900 leading-tight mb-1">List your water business</h1>
        <p className="text-text-mid text-sm">Join MiMaji and reach thousands of customers</p>
      </div>

      <div className="-mt-5 mx-4 bg-white rounded-2xl p-4 relative z-10 mb-4" style={{ boxShadow: "var(--shadow-elevated)" }}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { title: "More sales", sub: "Reach new customers" },
            { title: "Easy orders", sub: "Digital order system" },
            { title: "M-Pesa pay", sub: "Instant payments" },
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
          <span className="text-[10px] text-text-mid">Business</span>
          <span className="text-[10px] text-text-mid">Location</span>
          <span className="text-[10px] text-text-mid">Operations</span>
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">Business Information</h2>
              {[
                { label: "Business Name", field: "businessName" as const, placeholder: "e.g. AquaPure Water Kiosk" },
                { label: "Owner / Manager Name", field: "ownerName" as const, placeholder: "e.g. Jane Wanjiku" },
                { label: "Email (optional)", field: "email" as const, placeholder: "e.g. info@aquapure.co.ke", type: "email" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">{f.label}</label>
                  <input type={f.type || "text"} value={form[f.field] as string} onChange={(e) => updateForm(f.field, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
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
              <h2 className="font-bold text-blue-900 text-lg">Location &amp; Business Type</h2>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Zone / Area</label>
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button key={zone} onClick={() => updateForm("zone", zone)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${form.zone === zone ? "bg-blue-700 text-white" : "bg-blue-50 text-text-mid"}`}>{zone}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Physical Address</label>
                <input type="text" value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="e.g. 123 Waiyaki Way, Westlands" className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Business Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {businessTypes.map((bt) => (
                    <button key={bt.value} onClick={() => updateForm("businessType", bt.value)} className={`p-3 rounded-2xl text-center transition-all ${form.businessType === bt.value ? "bg-blue-50 border-2 border-blue-700 text-blue-900" : "bg-white border-2 border-blue-50 text-text-mid"}`}>
                      <div className="text-xs font-bold">{bt.label}</div>
                      <div className="text-[10px] text-text-light">{bt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>Back</Button>
                <Button size="lg" onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="font-bold text-blue-900 text-lg">Operations &amp; Capacity</h2>
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Water Source</label>
                <div className="space-y-1.5">
                  {waterSources.map((src) => (
                    <button key={src} onClick={() => updateForm("waterSource", src)} className={`w-full p-3 rounded-2xl text-left text-sm font-medium transition-all flex items-center gap-2 ${form.waterSource === src ? "bg-blue-50 border-2 border-blue-700 text-blue-900" : "bg-white border-2 border-blue-50 text-text-mid"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.waterSource === src ? "border-blue-700" : "border-blue-200"}`}>
                        {form.waterSource === src && <div className="w-2 h-2 rounded-full bg-blue-700" />}
                      </div>
                      {src}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: "Daily Capacity (20L jugs)", field: "jugCapacity" as const, placeholder: "e.g. 100" },
                { label: "Operating Hours", field: "operatingHours" as const, placeholder: "e.g. 6:00 AM – 8:00 PM" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">{f.label}</label>
                  <input type="text" value={form[f.field] as string} onChange={(e) => updateForm(f.field, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50" />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Price per 20L Jug (KES)</label>
                <div className="flex items-center gap-2">
                  <span className="text-text-mid text-sm">KES</span>
                  <input type="text" value={form.pricePerJug} onChange={(e) => updateForm("pricePerJug", e.target.value)} className="flex-1 px-4 py-3 rounded-2xl text-sm font-bold text-blue-900 bg-blue-50" />
                </div>
              </div>
              {[
                { field: "hasPermit" as const, label: "I have a valid water business permit" },
                { field: "deliveryCapable" as const, label: "We can deliver to customers" },
              ].map((c) => (
                <button key={c.field} onClick={() => updateForm(c.field, !form[c.field])} className="w-full p-3 rounded-2xl bg-blue-50 text-left text-sm font-medium flex items-center gap-3 text-text-mid">
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${form[c.field] ? "bg-blue-700 text-white" : "border-2 border-blue-200"}`}>
                    {form[c.field] && "\u2713"}
                  </div>
                  {c.label}
                </button>
              ))}
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
