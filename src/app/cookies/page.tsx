"use client";

import { logo1 } from "@/assets/images";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const sections = [
  { title: "1. Understanding Cookies", body: "Cookies are small data files stored on your browser or device by websites you visit. They serve various purposes, from remembering your preferences to helping us understand how visitors interact with our Site. Similar technologies include web beacons, pixels, and local storage objects." },
  { title: "2. Categories of Cookies We Use", body: "Strictly necessary cookies: These are essential for the basic operation of our Site, such as page navigation, session management, and security features. The Site cannot function properly without them, and they cannot be disabled.\n\nAnalytical and performance cookies: These help us measure and understand how visitors use the Site \u2014 for example, which pages receive the most visits, how long users stay, and where they navigate from. We use this data to improve Site structure, content, and speed. These cookies do not identify you personally.\n\nFunctional cookies: These remember choices you make (such as language or region preferences) to provide a more personalised experience. They may also be used to recall your most recent searches on the platform." },
  { title: "3. Account Access", body: "The MiMaji website is primarily informational. Account registration, login, ordering, and payment are conducted through the MiMaji mobile application (available on Google Play Store) or via the M-Pesa integration. Accordingly, cookies on the Site do not handle authentication or payment data." },
  { title: "4. Controlling Cookies", body: "Most web browsers allow you to manage cookie preferences through their settings. You can typically choose to block all cookies, accept all cookies, or receive a notification when a cookie is set. Please note that disabling strictly necessary cookies may affect the functionality of certain parts of the Site.\n\nFor detailed instructions on managing cookies, consult your browser\u2019s help documentation or visit www.allaboutcookies.org." },
  { title: "5. Third-Party Cookies", body: "We may utilise third-party analytics services (such as Google Analytics) that place their own cookies on your device. These third parties process data in accordance with their own privacy policies, which we encourage you to review. We do not control nor accept responsibility for the cookies set by third parties." },
  { title: "6. Revisions to This Policy", body: "We may revise this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. Any updates will be published on this page with a revised \u201cLast updated\u201d date." },
  { title: "7. Questions", body: "If you have any questions about our use of cookies, please contact us:\n\nEmail: privacy@mimaji.co.ke\nWebsite: www.mimaji.co.ke" },
];

export default function CookiesPage() {
  const content = (
    <>
      <div className="bg-surface shadow-card rounded-xl p-5 mb-4">
        <p className="text-text-secondary text-xs mb-1">Last updated: 17 March 2026</p>
        <p className="text-text-secondary text-xs">Operated by: Reef Support B.V.</p>
        <p className="text-text-secondary text-sm mt-3 leading-relaxed">
          Reef Support B.V. operates the MiMaji website at mimaji.co.ke (&quot;Site&quot;). This Cookie Policy explains our use of cookies and comparable tracking technologies when you visit our Site. By continuing to browse the Site, you acknowledge and accept the practices described below.
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
        <TopBar title="Cookie Policy" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/"><Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" /></Link>
            <nav className="flex items-center gap-8">
              <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
              <Link href="/privacy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Privacy</Link>
              <Link href="/cookies" className="text-primary font-medium text-sm">Cookies</Link>
            </nav>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">MiMaji Cookie Policy</h1>
          {content}
        </div>
        <footer className="bg-[#1A2A3A] text-white py-12"><div className="max-w-6xl mx-auto px-8 text-center"><p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p></div></footer>
      </div>
    </div>
  );
}
