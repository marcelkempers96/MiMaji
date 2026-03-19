"use client";

import { logo1 } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const sections = [
  { title: "1. Order Cancellations", body: "Before dispatch: You may cancel any order free of charge within five (5) minutes of placing it, or at any point before the Vendor confirms dispatch \u2014 whichever comes first. Use the \u201cCancel Order\u201d button in the app or contact support.\n\nAfter dispatch: Once a rider has been assigned and is en route, cancellation may incur an attempted-delivery charge equal to the delivery fee. This compensates the rider for time and fuel already expended." },
  { title: "2. Grounds for a Refund or Replacement", body: "You are entitled to a refund or free replacement if any of the following occurs:\n\n(a) Non-delivery: Your order was never received.\n(b) Excessive delay: Delivery arrived more than sixty (60) minutes beyond the estimated window.\n(c) Incorrect items: Products delivered differ in brand, size, or quantity from what was ordered.\n(d) Incomplete delivery: One or more items from your order are missing.\n(e) Quality or safety concerns: Delivered products show signs of contamination, have broken or loose seals, unusual odour or taste, visible foreign particles, or physical damage to the container." },
  { title: "3. Reporting Timelines", body: "To be eligible, you must report the issue within the following windows:\n\nRefill deliveries (dispenser, bowser, jerrican refills): within twelve (12) hours of delivery.\nSealed container deliveries (bottled water, new jugs, cartons): within forty-eight (48) hours of delivery.\nNon-delivery: Within twenty-four (24) hours after the scheduled delivery window has elapsed.\n\nReports submitted outside these windows may be declined at our discretion, except where extraordinary circumstances prevented timely reporting." },
  { title: "4. Supporting Evidence", body: "When reporting an issue, please include your order number and a brief description of the problem. Where relevant, attach a clear photograph (for example, a damaged container, wrong label, or visible contamination). This helps us resolve your case quickly." },
  { title: "5. Resolution Options", body: "Non-delivery: Full refund to your M-Pesa account.\nIncorrect or missing items: Free replacement delivery of the correct or missing items (default). Alternatively, a refund for the affected items if you prefer.\nQuality or safety issues: Free replacement (default) or refund for the affected items.\nExcessive delay \u2014 order accepted: Partial refund of the delivery fee or equivalent platform credit.\nExcessive delay \u2014 order rejected: Full refund including delivery fee.\nDelivery fees: Refunded when the issue is caused by the Vendor or rider. Not refunded when the issue originates with the Customer (e.g., unreachable at delivery, incorrect address, refusal without a covered reason)." },
  { title: "6. Refund Processing", body: "Approved refunds are sent exclusively to the M-Pesa number used for the original payment. We aim to process refunds within twenty-four (24) hours of approval. Actual receipt may be subject to M-Pesa processing times. Where instant resolution is preferred, we may offer platform credit of equivalent value; however, you always retain the right to choose a cash refund if eligible." },
  { title: "7. Quality & Safety Expectations", body: "All Vendors on MiMaji are required to deliver products in sealed, undamaged containers using clean, food-grade equipment. In the event of a contamination claim, MiMaji may arrange collection of the affected item for independent inspection. Resolution will proceed based on the inspection outcome, and the Customer will be informed of the findings." },
  { title: "8. Vendor Accountability", body: "Where an issue is attributable to the Vendor, the cost of the refund or replacement is borne by that Vendor. MiMaji may advance the refund to the Customer and recover the amount from the Vendor subsequently." },
  { title: "9. Fair Use & Fraud Prevention", body: "To maintain a fair marketplace, MiMaji reserves the right to review, delay, or decline refund requests in cases of: repeated claims without supporting evidence; conflicting or inconsistent accounts of the same order; accounts exhibiting patterns inconsistent with genuine use. We may request additional verification in such instances." },
  { title: "10. Reaching Our Support Team", body: "WhatsApp: +254 758 434 076\nEmail: support@mimaji.co.ke\nAvailability: 07:00 \u2013 21:00 EAT, seven days a week. Urgent cases (e.g., safety concerns) are prioritised.\n\nIf you are dissatisfied with the initial resolution, you may request escalation to a senior support manager for further review." },
  { title: "11. Applicable Law", body: "This policy is governed by the laws of the Republic of Kenya. Nothing in this policy limits your statutory consumer protection rights under Kenyan law." },
];

export default function CancellationPage() {
  const content = (
    <>
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <p className="text-text-secondary text-xs mb-1">Last updated: 17 March 2026</p>
        <p className="text-text-secondary text-xs">Operated by: Reef Support B.V.</p>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          MiMaji is a digital marketplace connecting Customers with independent water Vendors. All payments are handled via M-Pesa. This policy sets out the circumstances under which you may cancel an order, request a replacement, or receive a refund.
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
        <TopBar title="Cancellation & Refund" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/"><Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" /></Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/terms" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Terms</Link>
              <Link href="/cancellation" className="text-primary font-medium text-sm">Cancellation</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Cancellation & Refund Policy</h1>
          {content}
        </div>
        <footer className="bg-[#1A2A3A] text-white py-12"><div className="max-w-6xl mx-auto px-8 text-center"><p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p></div></footer>
      </div>
    </div>
  );
}
