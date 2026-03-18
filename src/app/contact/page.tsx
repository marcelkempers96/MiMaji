"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", category: "general" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.message) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Contact Us</h1>
          <p className="text-text-mid text-sm lg:text-base">We&apos;re here to help with any questions about MiMaji</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-5 relative z-10 pb-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Contact Methods */}
          <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
            {/* WhatsApp */}
            <a
              href="https://wa.me/254758434076"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm">WhatsApp</div>
                  <div className="text-xs text-text-mid">Quick replies, 9am - 6pm</div>
                </div>
              </div>
              <div className="text-blue-700 font-semibold text-sm">+254 758 434 076</div>
            </a>

            {/* Phone */}
            <a
              href="tel:+254758434076"
              className="block bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm">Call Us</div>
                  <div className="text-xs text-text-mid">Mon - Sat, 8am - 7pm</div>
                </div>
              </div>
              <div className="text-blue-700 font-semibold text-sm">+254 758 434 076</div>
            </a>

            {/* Email */}
            <a
              href="mailto:hello@mimaji.co.ke"
              className="block bg-white rounded-2xl p-5 hover:shadow-lg transition-shadow"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm">Email</div>
                  <div className="text-xs text-text-mid">We reply within 24 hours</div>
                </div>
              </div>
              <div className="text-blue-700 font-semibold text-sm">hello@mimaji.co.ke</div>
            </a>

            {/* Location */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-blue-900 text-sm">Office</div>
                  <div className="text-xs text-text-mid">Visit us</div>
                </div>
              </div>
              <div className="text-text-mid text-sm">Nairobi, Kenya</div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-blue-900 mb-2">Message Sent!</h2>
                  <p className="text-text-mid text-sm mb-4">We&apos;ll get back to you as soon as possible.</p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "", category: "general" }); }}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-blue-900 text-lg mb-4">Send us a message</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "general", label: "General" },
                          { key: "order", label: "Order Issue" },
                          { key: "delivery", label: "Delivery" },
                          { key: "payment", label: "Payment" },
                          { key: "partnership", label: "Partnership" },
                        ].map((cat) => (
                          <button
                            key={cat.key}
                            onClick={() => setForm((f) => ({ ...f, category: cat.key }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              form.category === cat.key
                                ? "bg-blue-700 text-white"
                                : "bg-blue-50 text-text-mid hover:bg-blue-100"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:grid lg:grid-cols-2 lg:gap-4 space-y-4 lg:space-y-0">
                      <div>
                        <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Name</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Phone</label>
                        <div className="flex rounded-2xl overflow-hidden bg-blue-50">
                          <span className="px-3 py-3 bg-blue-100 text-blue-900 text-sm font-semibold">+254</span>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                            placeholder="712 345 678"
                            className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Email (optional)</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="How can we help?"
                        rows={4}
                        className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 resize-none"
                      />
                    </div>

                    <Button size="lg" onClick={handleSubmit} disabled={!form.name || !form.message}>
                      Send Message
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
