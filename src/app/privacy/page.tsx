"use client";

import { Shield, Lock, Eye, Trash2, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

export default function PrivacyPage() {
  const sections = [
    {
      icon: Lock,
      title: "Data Protection",
      description: "Your personal data is encrypted and stored securely. We use industry-standard encryption to protect your information.",
    },
    {
      icon: Eye,
      title: "Information We Collect",
      description: "We collect your name, phone number, delivery addresses, and order history to provide our services.",
    },
    {
      icon: Smartphone,
      title: "M-PESA Security",
      description: "Payment processing is handled securely through Safaricom M-PESA. We never store your M-PESA PIN or full payment details.",
    },
    {
      icon: Trash2,
      title: "Delete Your Data",
      description: "You can request deletion of your account and all associated data at any time by contacting our support team.",
    },
  ];

  const content = (
    <>
      <div className="bg-gradient-to-r from-[#EAF2FB] to-[#D4E8FA] rounded-xl p-5 mb-5">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-primary" />
          <h2 className="font-bold text-base text-text-primary">Your Privacy Matters</h2>
        </div>
        <p className="text-text-secondary text-sm">
          At MiMaji, we are committed to protecting your personal information and being transparent about how we use it.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-surface shadow-card rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-text-primary mb-1">{section.title}</p>
                  <p className="text-text-secondary text-sm leading-relaxed">{section.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 bg-surface shadow-card rounded-xl p-5">
        <h3 className="font-bold text-sm text-text-primary mb-2">Contact Us About Privacy</h3>
        <p className="text-text-secondary text-sm mb-3">
          If you have questions about your privacy or want to exercise your data rights, contact us:
        </p>
        <a href="mailto:privacy@mimaji.co.ke" className="text-primary text-sm font-semibold">
          privacy@mimaji.co.ke
        </a>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Privacy & Security" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Privacy & Security</h1>
          {content}
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo1" alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
