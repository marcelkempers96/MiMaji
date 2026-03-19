"use client";

import { logo1 } from "@/assets/images";
import { useState } from "react";
import { User, Mail, Phone, Smartphone, Save, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState("");
  const [phone] = useState(user?.phone || "");
  const [mpesaNumber, setMpesaNumber] = useState(user?.phone || "");
  const [mpesaDifferent, setMpesaDifferent] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const content = (
    <>
      {/* Profile Picture */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
          <User size={36} className="text-primary" />
        </div>
      </div>

      {/* Name */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Full Name</label>
        <div className="flex items-center gap-3">
          <User size={18} className="text-text-secondary flex-shrink-0" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background"
            placeholder="Enter your full name"
          />
        </div>
      </div>

      {/* Email */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Email Address</label>
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-text-secondary flex-shrink-0" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary bg-background"
            placeholder="Enter your email address"
          />
        </div>
      </div>

      {/* Phone Number */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Phone Number</label>
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-text-secondary flex-shrink-0" />
          <input
            type="tel"
            value={phone}
            readOnly
            className="flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-secondary outline-none bg-gray-50"
          />
        </div>
        <p className="text-text-secondary text-xs mt-2">Phone number is linked to your account and cannot be changed.</p>
      </div>

      {/* M-PESA Number */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">M-PESA Number</label>

        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="mpesa-different"
            checked={mpesaDifferent}
            onChange={(e) => {
              setMpesaDifferent(e.target.checked);
              if (!e.target.checked) setMpesaNumber(phone);
            }}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-[#2979C1]"
          />
          <label htmlFor="mpesa-different" className="text-sm text-text-primary cursor-pointer">
            Use a different M-PESA number
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Smartphone size={18} className="text-[#2ECC71] flex-shrink-0" />
          <input
            type="tel"
            value={mpesaDifferent ? mpesaNumber : phone}
            onChange={(e) => setMpesaNumber(e.target.value)}
            disabled={!mpesaDifferent}
            className={`flex-1 h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm outline-none focus:border-primary ${
              mpesaDifferent ? "text-text-primary bg-background" : "text-text-secondary bg-gray-50"
            }`}
            placeholder="Enter M-PESA phone number"
          />
        </div>
        <p className="text-text-secondary text-xs mt-2">
          This number will receive STK push prompts for payments.
        </p>
      </div>

      {/* Set Up Corporate Account */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Corporate Account</label>
        <div className="flex items-center gap-3">
          <Building2 size={20} className="text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-text-primary font-medium">Set Up Corporate Account</p>
            <p className="text-text-secondary text-xs">Register a new business account for corporate invoicing and bulk orders.</p>
          </div>
        </div>
        <Link
          href="/login?mode=signup&corporate=true"
          className="mt-3 block w-full text-center bg-primary-light text-primary rounded-xl py-2.5 font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
        >
          Sign Up Corporate Account
        </Link>
      </div>

      {/* Save Button */}
      <div className="mt-5">
        <Button variant="primary" fullWidth onClick={handleSave}>
          <Save size={16} />
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {saved && (
        <div className="mt-3 bg-[#E8F5E9] rounded-xl p-3 text-center">
          <p className="text-[#2ECC71] text-sm font-semibold">Your settings have been saved.</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Account Settings" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Account & Profile Settings</h1>
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
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
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
