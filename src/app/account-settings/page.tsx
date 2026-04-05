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
  const [email, setEmail] = useState("");
  const [phone] = useState(user?.phone || "");
  const [mpesaNumber, setMpesaNumber] = useState(user?.phone || "");
  const [mpesaDifferent, setMpesaDifferent] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [corpBusinessName, setCorpBusinessName] = useState("");
  const [corpBusinessReg, setCorpBusinessReg] = useState("");
  const [corpSaved, setCorpSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account-settings");
    }
  }, [authLoading, user, router]);

  // Load saved profile data on mount
  useEffect(() => {
    if (!user?.id) return;

    if (hasSupabaseConfig) {
      // Load from Supabase profiles table
      supabase.from("profiles").select("email, mpesa_number, avatar_url").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          if (data.email) setEmail(data.email);
          if (data.mpesa_number) {
            setMpesaNumber(data.mpesa_number);
            if (data.mpesa_number !== user.phone) setMpesaDifferent(true);
          }
          if (data.avatar_url) setProfilePicUrl(data.avatar_url);
          if ((data as Record<string, unknown>).business_name) { setCorpBusinessName((data as Record<string, unknown>).business_name as string); setShowCorporateForm(true); }
          if ((data as Record<string, unknown>).business_reg_no) setCorpBusinessReg((data as Record<string, unknown>).business_reg_no as string);
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
        if (profile.businessName) { setCorpBusinessName(profile.businessName); setShowCorporateForm(true); }
        if (profile.businessRegNo) setCorpBusinessReg(profile.businessRegNo);
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

  if (authLoading || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    const mpesaToSave = mpesaDifferent ? mpesaNumber : phone;

    // Save to localStorage immediately for instant feedback
    if (user?.id) {
      try {
        const profileKey = `mimaji_profile_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
        existing.email = email.trim();
        existing.mpesaNumber = mpesaToSave;
        if (profilePicUrl) existing.profilePicUrl = profilePicUrl;
        // Also persist corporate data in main save
        if (corpBusinessName) existing.businessName = corpBusinessName;
        if (corpBusinessReg) existing.businessRegNo = corpBusinessReg;
        if (corpBusinessName || corpBusinessReg) existing.isCorporate = true;
        localStorage.setItem(profileKey, JSON.stringify(existing));
      } catch {}
    }

    // Show saved immediately
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Update auth context and Supabase in background (non-blocking)
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      mpesaNumber: mpesaToSave,
    }).catch(() => {});

    // Supabase profile pic update in background
    if (user?.id && hasSupabaseConfig && profilePicUrl) {
      Promise.resolve(supabase.from("profiles").update({ avatar_url: profilePicUrl }).eq("id", user.id)).catch(() => {});
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
            <p className="text-text-secondary text-xs">Register your business for corporate invoicing and bulk orders.</p>
          </div>
        </div>
        {!showCorporateForm ? (
          <button
            onClick={() => setShowCorporateForm(true)}
            className="mt-3 block w-full text-center bg-primary-light text-primary rounded-xl py-2.5 font-semibold text-sm hover:bg-primary hover:text-white transition-colors"
          >
            Set Up Corporate Account
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-text-secondary font-medium mb-1 block">Business Name</label>
              <input
                type="text"
                value={corpBusinessName}
                onChange={(e) => setCorpBusinessName(e.target.value)}
                placeholder="e.g. Acme Ltd"
                className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary font-medium mb-1 block">Business Registration No.</label>
              <input
                type="text"
                value={corpBusinessReg}
                onChange={(e) => setCorpBusinessReg(e.target.value)}
                placeholder="e.g. PVT-2024-001234"
                className="w-full h-10 px-3 rounded-lg border border-[#E0E0E0] text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={async () => {
                if (!user?.id) return;
                if (hasSupabaseConfig) {
                  await supabase.from("profiles").update({ business_name: corpBusinessName, business_reg_no: corpBusinessReg, is_corporate: true }).eq("id", user.id);
                } else {
                  const profileKey = `mimaji_profile_${user.id}`;
                  const existing = JSON.parse(localStorage.getItem(profileKey) || "{}");
                  localStorage.setItem(profileKey, JSON.stringify({ ...existing, businessName: corpBusinessName, businessRegNo: corpBusinessReg, isCorporate: true }));
                }
                setCorpSaved(true);
                setTimeout(() => setCorpSaved(false), 2500);
              }}
              className="w-full bg-primary text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-[#1a5a9a] transition-colors"
            >
              {corpSaved ? "Saved!" : "Save Corporate Details"}
            </button>
            {corpSaved && (
              <p className="text-[#2ECC71] text-xs font-semibold text-center">Corporate account details saved.</p>
            )}
          </div>
        )}
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
              <span className="text-xs text-text-secondary">Send Money To</span>
              <span className="text-sm font-bold text-text-primary font-mono">0758434076</span>
            </div>
          </div>
          <p className="text-text-secondary text-[10px] mt-2">Paste your M-PESA confirmation code so we can track your order.</p>
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
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
        </nav>
      </div>
    </header>
  );
}
