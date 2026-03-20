"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect } from "react";
import { User, Mail, Phone, Smartphone, Save, Building2, Camera, Banknote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

export default function AccountSettingsPage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");

  // Redirect unauthenticated users to login
  if (!authLoading && !user) {
    router.push("/login?redirect=/account-settings");
    return null;
  }
  const [email, setEmail] = useState("");
  const [phone] = useState(user?.phone || "");
  const [mpesaNumber, setMpesaNumber] = useState(user?.phone || "");
  const [mpesaDifferent, setMpesaDifferent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  // Load saved profile data on mount
  useEffect(() => {
    if (!user?.id) return;

    if (hasSupabaseConfig) {
      // Load from Supabase profiles table
      supabase.from("profiles").select("email, mpesa_number, avatar_url").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          if (data.email) setEmail(data.email);
          if (data.mpesa_number) {
            setMpesaNumber(data.mpesa_number);
            if (data.mpesa_number !== user.phone) setMpesaDifferent(true);
          }
          if (data.avatar_url) setProfilePicUrl(data.avatar_url);
        }
      });
    } else {
      // Fallback: localStorage
      try {
        const profileKey = `mimaji_profile_${user.id}`;
        const profile = JSON.parse(localStorage.getItem(profileKey) || "{}");
        if (profile.email) setEmail(profile.email);
        if (profile.mpesaNumber) {
          setMpesaNumber(profile.mpesaNumber);
          if (profile.mpesaNumber !== user.phone) setMpesaDifferent(true);
        }
        if (profile.profilePicUrl) setProfilePicUrl(profile.profilePicUrl);
      } catch {}
    }
  }, [user?.id, user?.phone]);

  // Update name when user changes (e.g. after login)
  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) {
      // Only reset mpesa if not different
      if (!mpesaDifferent) setMpesaNumber(user.phone);
    }
  }, [user?.name, user?.phone, mpesaDifferent]);

  const handleSave = async () => {
    setSaving(true);
    const mpesaToSave = mpesaDifferent ? mpesaNumber : phone;
    const result = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      mpesaNumber: mpesaToSave,
    });

    // Save profile pic URL
    if (user?.id) {
      if (hasSupabaseConfig && profilePicUrl) {
        await supabase.from("profiles").update({ avatar_url: profilePicUrl }).eq("id", user.id);
      } else {
        try {
          const profileKey = `mimaji_profile_${user.id}`;
          const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
          existing.profilePicUrl = profilePicUrl;
          localStorage.setItem(profileKey, JSON.stringify(existing));
        } catch {}
      }
    }

    setSaving(false);
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProfilePicUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const content = (
    <>
      {/* Profile Picture */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center overflow-hidden">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-primary" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-[#1a5a9a] transition-colors">
            <Camera size={14} className="text-white" />
            <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* User ID */}
      {user?.id && (
        <div className="bg-primary-light rounded-xl p-3 mb-3 text-center">
          <p className="text-xs text-text-secondary">User ID</p>
          <p className="text-sm font-mono font-bold text-primary">USR-{user.id.slice(0, 8).toUpperCase()}</p>
        </div>
      )}

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

      {/* Support - M-PESA Info */}
      <div className="bg-surface shadow-card rounded-xl p-5 mb-3">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">Support & Payment Info</label>
        <div className="flex items-start gap-3 mb-3">
          <Banknote size={20} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-text-primary font-medium">MiMaji M-PESA Payment Details</p>
            <p className="text-text-secondary text-xs">For any missed payments or manual transfers</p>
          </div>
        </div>
        <div className="bg-[#E8F5E9] rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Business Number (Paybill)</span>
              <span className="text-sm font-bold text-text-primary font-mono">123456</span>
            </div>
            <div className="h-px bg-white/50" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">Account Number</span>
              <span className="text-sm font-bold text-text-primary font-mono">{user?.phone || "Your Phone Number"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-5">
        <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {saved && (
        <div className="mt-3 bg-[#E8F5E9] rounded-xl p-3 text-center">
          <p className="text-[#2ECC71] text-sm font-semibold">Your settings have been saved successfully.</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
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
