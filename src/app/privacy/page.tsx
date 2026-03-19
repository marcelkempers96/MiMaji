"use client";

import { logo1 } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const sections = [
  { title: "1. Data We Gather", body: "Account data: When you register, we collect your full name, telephone number, email address, and delivery address(es).\n\nTransaction data: We record details of each order you place, including product selection, order value, payment reference, delivery status, and timestamps.\n\nTechnical data: We automatically collect your IP address, browser type, device model, operating system, screen resolution, and approximate geolocation (derived from IP or GPS where you grant permission).\n\nCommunications: If you contact us via email, WhatsApp, or in-app chat, we retain the content of those exchanges.\n\nFeedback & reviews: Ratings and written reviews you submit about Vendors or delivery riders." },
  { title: "2. Why We Process Your Data", body: "We process your personal data for the following purposes: (a) to create and administer your account; (b) to process, dispatch, and track your orders; (c) to facilitate M-Pesa payments and issue refunds where applicable; (d) to communicate with you regarding your orders, account, or support queries; (e) to send you promotional offers, newsletters, or product updates (only with your explicit opt-in consent); (f) to analyse usage patterns and improve Platform functionality; (g) to detect, prevent, and investigate fraud or misuse; (h) to comply with legal obligations." },
  { title: "3. Legal Bases", body: "We rely on the following legal bases: contractual necessity (to fulfil orders), legitimate interest (to improve our services and prevent fraud), consent (for marketing communications), and legal obligation (to comply with tax, consumer protection, and data-related laws in Kenya and the EU/EEA where applicable)." },
  { title: "4. Who Receives Your Data", body: "Vendors: We share your name, telephone number, and delivery address with the Vendor fulfilling your order so they can prepare and deliver your products.\n\nDelivery riders: Riders receive your delivery address and contact details solely for the purpose of completing the delivery.\n\nPayment processors: Safaricom M-Pesa and any other integrated payment gateway receive transaction data necessary to process your payment.\n\nService providers: We may engage cloud hosting, analytics, and customer support tools operated by third parties under strict data processing agreements.\n\nAuthorities: We will disclose personal data if required by law, regulation, court order, or governmental authority." },
  { title: "5. International Transfers", body: "Your data may be transferred to and stored on servers located outside Kenya, including in The Netherlands and other jurisdictions where our service providers operate. Where such transfers occur, we ensure appropriate safeguards are in place, such as standard contractual clauses or equivalent protections." },
  { title: "6. Data Retention", body: "We retain your personal data for as long as your account remains active and for a reasonable period thereafter to fulfil legal, accounting, or reporting obligations. Transaction records are kept for a minimum of seven (7) years in accordance with Kenyan tax law. You may request deletion of your account data at any time, subject to our retention obligations." },
  { title: "7. Your Rights", body: "Depending on your jurisdiction, you may have the right to: access your personal data; correct inaccurate data; request erasure of your data; restrict or object to processing; receive your data in a portable format; and withdraw consent for marketing at any time. To exercise any of these rights, email us at privacy@mimaji.co.ke. We will respond within thirty (30) days." },
  { title: "8. Security Measures", body: "We implement industry-standard technical and organisational measures to protect your data, including encrypted data transmission (TLS/SSL), access controls, regular security audits, and staff training. Despite these precautions, no transmission over the internet or electronic storage method is entirely secure, and we cannot guarantee absolute security." },
  { title: "9. Age Restriction", body: "MiMaji is not designed for use by persons under the age of eighteen (18). We do not knowingly collect personal data from minors. If we become aware that a minor has provided us with personal data, we will take steps to delete that information." },
  { title: "10. External Links", body: "The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those external sites. We encourage you to review the privacy policies of any site you visit." },
  { title: "11. Changes to This Policy", body: "We may update this Privacy Policy from time to time. When we make material changes, we will notify you by posting the revised policy on the Platform and updating the \u201cLast updated\u201d date. Continued use after such changes constitutes acceptance." },
  { title: "12. Contact the Data Controller", body: "Reef Support B.V.\nEmail: privacy@mimaji.co.ke\nPhone: +254 758 434 076\nWebsite: www.mimaji.co.ke" },
];

export default function PrivacyPage() {
  const content = (
    <>
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <p className="text-text-secondary text-xs mb-1">Last updated: 17 March 2026</p>
        <p className="text-text-secondary text-xs">Data controller: Reef Support B.V., The Netherlands</p>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          Reef Support B.V. (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the MiMaji platform at mimaji.co.ke and through the MiMaji mobile application. We take the security and confidentiality of your personal data seriously. This Privacy Policy describes what information we gather, the purposes for which we use it, with whom we share it, and the choices available to you.
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
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Privacy Policy" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/"><Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" /></Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/terms" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-primary font-medium text-sm">Privacy</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">MiMaji Privacy Policy</h1>
          {content}
        </div>
        <footer className="bg-[#1A2A3A] text-white py-12"><div className="max-w-6xl mx-auto px-8 text-center"><p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p></div></footer>
      </div>
    </div>
  );
}
