"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import Link from "next/link";

const faqs = [
  {
    q: "How do I place an order?",
    a: "Simply enter your delivery address and quantity on our homepage, add your M-Pesa number, and tap 'Order & Pay'. You'll receive an STK push on your phone to confirm payment.",
  },
  {
    q: "What are the delivery hours?",
    a: "We deliver Monday to Saturday, 8:00 AM to 7:00 PM. Orders placed after 5:00 PM may be delivered the next day.",
  },
  {
    q: "How long does delivery take?",
    a: "Most deliveries within Nairobi are completed within 1-3 hours, depending on your location and time of order.",
  },
  {
    q: "Can I track my delivery?",
    a: "Yes! After placing your order, you can track your delivery in real-time on the Track page. You'll also receive SMS updates.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept M-Pesa payments only. An STK push will be sent to your phone for a secure, instant transaction.",
  },
  {
    q: "How do I cancel an order?",
    a: "You can cancel an order before it's been assigned to a rider. Contact us via WhatsApp at +254 758 434 076 for immediate assistance.",
  },
  {
    q: "What is the water quality?",
    a: "All our water is sourced from certified, KEBS-approved water providers. Every batch is tested for quality and safety before delivery.",
  },
  {
    q: "How does the referral program work?",
    a: "Share your referral code with friends. When they sign up and place their first order, you BOTH get 10 litres free. Refer 5 friends to earn up to 60 litres!",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-10 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">Help & Support</h1>
          <p className="text-text-mid text-sm lg:text-base">Find answers to common questions or reach out to our team</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-5 relative z-10 pb-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "WhatsApp", desc: "Quick support", href: "https://wa.me/254758434076", color: "bg-emerald-50", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
            { label: "Call Us", desc: "+254 758 434 076", href: "tel:+254758434076", color: "bg-blue-50", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
            { label: "Email", desc: "hello@mimaji.co.ke", href: "mailto:hello@mimaji.co.ke", color: "bg-blue-50", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "Contact Form", desc: "Send a message", href: "/contact", color: "bg-blue-50", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`${action.color} rounded-2xl p-4 text-center hover:shadow-md transition-shadow block`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={action.icon}/>
                </svg>
              </div>
              <div className="font-semibold text-blue-900 text-sm">{action.label}</div>
              <div className="text-[10px] text-text-mid">{action.desc}</div>
            </a>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-5 mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
          <h2 className="font-bold text-blue-900 text-lg mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-blue-50 last:border-b-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-3 flex justify-between items-center gap-4"
                >
                  <span className="font-semibold text-blue-900 text-sm">{faq.q}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5A7A9A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="pb-3 text-sm text-text-mid leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="bg-blue-700 rounded-2xl p-6 text-center">
          <h2 className="font-bold text-white text-lg mb-2">Still need help?</h2>
          <p className="text-blue-200 text-sm mb-4">Our support team is available Monday to Saturday, 8am - 7pm</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://wa.me/254758434076" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="!border-white !text-white hover:!bg-white/10 w-full sm:w-auto">
                WhatsApp Us
              </Button>
            </a>
            <Link href="/contact">
              <Button variant="outline" className="!border-white !text-white hover:!bg-white/10 w-full sm:w-auto">
                Contact Form
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
