"use client";

import { logo1 } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const sections = [
  { title: "1. About MiMaji", body: "MiMaji operates a digital marketplace that enables consumers (\u201cCustomers\u201d) to browse, compare, and order water products from independent supply partners (\u201cVendors\u201d) for delivery within the Nairobi metropolitan area and, in time, other regions of Kenya. MiMaji is a technology intermediary. We do not manufacture, treat, bottle, store, or transport water products ourselves. All water products listed on the Platform are provided exclusively by independent Vendors." },
  { title: "2. Eligibility & Registration", body: "You must be at least eighteen (18) years of age and have the legal capacity to enter into a binding agreement to use MiMaji. When creating an account, you are required to supply truthful, current, and complete details. You bear sole responsibility for safeguarding your login credentials. Any activity conducted through your account is deemed to have been authorised by you. Should you become aware of any unauthorised access, you must contact us without delay at support@mimaji.co.ke." },
  { title: "3. Placing Orders", body: "By submitting an order through MiMaji, you are making a binding offer to purchase the selected products at the displayed price. Once a Vendor accepts your order and dispatch is confirmed, a binding contract is formed between you and the Vendor. MiMaji facilitates this transaction but is not a party to the sale agreement between you and the Vendor. We make commercially reasonable efforts to ensure that product descriptions, photographs, and prices shown on the Platform are accurate; however, these are provided by Vendors and MiMaji cannot guarantee their completeness." },
  { title: "4. Pricing, Fees & Payment", body: "Product prices are set by Vendors and shown inclusive of applicable taxes unless stated otherwise. A delivery fee may apply depending on your location and order size; this fee is displayed before you confirm your order. All payments are processed through M-Pesa or other integrated payment processors. By completing a transaction, you agree to abide by the relevant payment processor\u2019s terms. MiMaji does not store card details or M-Pesa PINs." },
  { title: "5. Delivery", body: "Estimated delivery windows are displayed at checkout and represent our best projection based on Vendor availability and rider capacity. MiMaji works with independent delivery riders and, where applicable, Vendor-operated vehicles. While we endeavour to meet every delivery estimate, delays may occur due to traffic, weather, supply constraints, or other circumstances beyond our control. MiMaji shall not be liable for losses arising from such delays." },
  { title: "6. Cancellations & Refunds", body: "Our Cancellation & Refund Policy is set out in a separate document and forms part of these Terms. In summary: free cancellation is available before dispatch; refunds for quality issues, non-delivery, or incorrect orders are handled in accordance with that policy. Please refer to the full Cancellation & Refund Policy for detailed eligibility criteria and timelines." },
  { title: "7. Vendor Relationship", body: "Vendors listed on MiMaji are independent businesses. MiMaji does not employ, direct, or supervise Vendors. Each Vendor is solely responsible for the quality, safety, and legality of the products it offers. MiMaji requires all Vendors to hold applicable permits and to comply with Kenya Bureau of Standards (KEBS) guidelines. However, MiMaji makes no warranty regarding the fitness, purity, or compliance of any product sold through the Platform." },
  { title: "8. Intellectual Property", body: "All trademarks, logos, text, designs, graphics, software, and other materials displayed on the Platform (\u201cMiMaji Content\u201d) are owned by or licensed to Reef Support B.V. and are protected under applicable intellectual property laws. You may not copy, adapt, distribute, publicly display, or create derivative works from any MiMaji Content without our prior written permission." },
  { title: "9. Acceptable Use", body: "You agree not to: (a) use the Platform for any unlawful purpose; (b) attempt to interfere with, disrupt, or compromise Platform security or performance; (c) impersonate another person or entity; (d) submit false, misleading, or fraudulent orders or reviews; (e) scrape, data-mine, or extract information from the Platform by automated means without our consent." },
  { title: "10. Limitation of Liability", body: "To the fullest extent allowed by the laws of Kenya and The Netherlands, Reef Support B.V., its directors, employees, and affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising from or related to your use of the Platform, including but not limited to loss of profits, data, business opportunity, or goodwill. Our total aggregate liability for any claim shall not exceed the total fees you paid to MiMaji in the twelve (12) months preceding the claim." },
  { title: "11. Indemnification", body: "You agree to indemnify and hold harmless Reef Support B.V. and its officers, directors, employees, and agents from any claims, damages, losses, costs, or expenses (including reasonable legal fees) arising from your breach of these Terms, your use of the Platform, or your violation of any third-party right." },
  { title: "12. Modifications", body: "We may revise these Terms at any time. Material changes will be communicated via the Platform or by email. Your continued use of MiMaji after changes are posted constitutes acceptance of the revised Terms. We recommend reviewing this page periodically." },
  { title: "13. Governing Law & Disputes", body: "These Terms are governed by the laws of the Republic of Kenya. Any dispute arising under these Terms shall first be submitted to good-faith mediation. If mediation fails, the dispute shall be referred to the courts of Nairobi, Kenya, which shall have exclusive jurisdiction." },
  { title: "14. Severability", body: "If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect." },
  { title: "15. Contact", body: "Reef Support B.V.\nEmail: legal@mimaji.co.ke\nPhone: +254 758 434 076\nWebsite: www.mimaji.co.ke" },
];

export default function TermsPage() {
  const content = (
    <>
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <p className="text-text-secondary text-xs mb-1">Last updated: 17 March 2026</p>
        <p className="text-text-secondary text-xs">Governing law: Republic of Kenya & The Netherlands (where applicable)</p>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          Welcome to MiMaji (&quot;mimaji.co.ke&quot;). The MiMaji platform and mobile application (&quot;Platform&quot;) are owned and operated by Reef Support B.V., a company registered in The Netherlands (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;). By using our Platform, you confirm that you have read, understood, and accepted these Terms of Use (&quot;Terms&quot;). If you do not agree, please discontinue use immediately.
        </p>
      </div>

      {sections.map((s) => (
        <div key={s.title} className="bg-surface shadow-card rounded-xl p-5 mb-3">
          <h3 className="font-bold text-sm text-text-primary mb-2">{s.title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{s.body}</p>
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="Terms of Use" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/"><Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" /></Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/privacy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Privacy</Link>
              <Link href="/terms" className="text-primary font-medium text-sm">Terms</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">MiMaji Terms of Use</h1>
          {content}
        </div>
        <footer className="bg-[#1A2A3A] text-white py-12"><div className="max-w-6xl mx-auto px-8 text-center"><p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p></div></footer>
      </div>
    </div>
  );
}
