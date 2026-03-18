"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileTab = "account" | "addresses" | "preferences";

export default function ProfilePage() {
  const { user, isLoading, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<ProfileTab>("account");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    mpesaNumber: "",
  });

  // Initialize form when user loads
  useState(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        phone: user.phone.replace("254", ""),
        address: user.address || "",
        mpesaNumber: user.mpesaNumber?.replace("254", "") || "",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="text-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg font-body">
        <Navbar />
        <div className="px-4 py-16 max-w-md mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-blue-900 mb-2">My Profile</h1>
          <p className="text-text-mid text-sm mb-6">Sign in to manage your account settings and preferences.</p>
          <div className="flex flex-col gap-3">
            <Link href="/login"><Button size="lg" onClick={() => localStorage.setItem("mimaji-redirect", "/profile")}>Log In</Button></Link>
            <Link href="/signup"><Button variant="outline" size="lg" onClick={() => localStorage.setItem("mimaji-redirect", "/profile")}>Create Account</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSave = () => {
    updateProfile({
      fullName: form.fullName,
      address: form.address,
      mpesaNumber: form.mpesaNumber ? `254${form.mpesaNumber}` : undefined,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: "account", label: "Account" },
    { key: "addresses", label: "Addresses" },
    { key: "preferences", label: "Preferences" },
  ];

  return (
    <div className="min-h-screen bg-bg font-body">
      <Navbar />

      <div className="bg-gradient-to-b from-blue-50 to-bg px-5 pt-8 pb-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-2xl">
            {user.fullName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">{user.fullName}</h1>
            <p className="text-text-mid text-sm">+{user.phone.slice(0, 3)} {user.phone.slice(3, 6)} *** ***</p>
            <p className="text-xs text-text-light capitalize">{user.role} account</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-4 relative z-10 pb-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.key ? "bg-blue-700 text-white shadow-sm" : "bg-white text-text-mid hover:bg-blue-50"
              }`}
              style={tab !== t.key ? { boxShadow: "var(--shadow-soft)" } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        {saved && (
          <div className="mb-4 bg-emerald-50 text-success text-sm font-semibold rounded-2xl p-3 text-center animate-fade-in">
            Profile updated successfully!
          </div>
        )}

        {tab === "account" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-blue-900">Personal Information</h3>
                <button onClick={() => setEditing(!editing)} className="text-blue-700 text-xs font-semibold">
                  {editing ? "Cancel" : "Edit"}
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                    disabled={!editing}
                    className={`w-full px-4 py-3 rounded-2xl text-sm text-blue-900 ${editing ? "bg-blue-50" : "bg-gray-50"}`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="flex rounded-2xl overflow-hidden bg-gray-50">
                    <span className="px-3 py-3 bg-gray-100 text-blue-900 text-sm font-semibold">+254</span>
                    <input type="tel" value={form.phone} disabled className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-text-mid" />
                  </div>
                  <p className="text-[10px] text-text-light mt-1">Phone number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">M-Pesa Number</label>
                  <div className={`flex rounded-2xl overflow-hidden ${editing ? "bg-blue-50" : "bg-gray-50"}`}>
                    <span className={`px-3 py-3 text-blue-900 text-sm font-semibold ${editing ? "bg-blue-100" : "bg-gray-100"}`}>+254</span>
                    <input
                      type="tel"
                      value={form.mpesaNumber}
                      onChange={(e) => setForm((f) => ({ ...f, mpesaNumber: e.target.value.replace(/\D/g, "").slice(0, 9) }))}
                      disabled={!editing}
                      className="flex-1 px-3 py-3 border-none bg-transparent text-sm text-blue-900"
                    />
                  </div>
                </div>
                {editing && (
                  <Button size="lg" onClick={handleSave}>Save Changes</Button>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "My Orders", href: "/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                  { label: "Subscriptions", href: "/subscriptions", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
                  { label: "Rewards", href: "/rewards", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
                  { label: "Support", href: "/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7BD6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={link.icon}/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-blue-900">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full p-4 text-center text-error text-sm font-semibold bg-white rounded-2xl hover:bg-red-50 transition-colors" style={{ boxShadow: "var(--shadow-card)" }}>
              Log Out
            </button>
          </div>
        )}

        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Saved Addresses</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-blue-900 text-sm mb-1">Home</div>
                      <div className="text-xs text-text-mid">{user.address || "Kilimani, Nairobi"}</div>
                    </div>
                    <span className="bg-blue-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Default</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">Add New Address</label>
                <input
                  type="text"
                  placeholder="Enter address"
                  className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 mb-3"
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
                <Button variant="outline" size="md" onClick={() => {
                  if (form.address) {
                    updateProfile({ address: form.address });
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                  }
                }}>
                  Save Address
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === "preferences" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
              <h3 className="font-bold text-blue-900 mb-3">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { label: "Order updates via SMS", defaultChecked: true },
                  { label: "Delivery notifications", defaultChecked: true },
                  { label: "Promotional offers", defaultChecked: false },
                  { label: "Weekly water tips", defaultChecked: false },
                ].map((pref) => (
                  <label key={pref.label} className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl cursor-pointer">
                    <span className="text-sm text-blue-900">{pref.label}</span>
                    <input type="checkbox" defaultChecked={pref.defaultChecked} className="w-5 h-5 rounded accent-blue-700" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
