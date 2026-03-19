"use client";

import { logo1 } from "@/assets/images";
import { useState } from "react";
import { MapPin, Plus, X, Home as HomeIcon, Building2, Trash2, Edit2, Search, Crosshair } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useLocation } from "@/context/LocationContext";

interface AddressForm {
  label: string;
  address: string;
  type: "home" | "office";
}

export default function SavedAddressesPage() {
  const { savedLocations, addSavedLocation, removeSavedLocation } = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<AddressForm>({ label: "", address: "", type: "home" });

  const handleSaveAddress = () => {
    if (form.label.trim() && form.address.trim()) {
      addSavedLocation({
        id: `loc-${Date.now()}`,
        label: form.label.trim(),
        address: form.address.trim(),
        type: form.type,
      });
      setForm({ label: "", address: "", type: "home" });
      setShowAddForm(false);
    }
  };

  const handleSearchAddress = () => {
    if (searchQuery.trim()) {
      setForm((prev) => ({ ...prev, address: searchQuery.trim() }));
    }
  };

  const content = (
    <>
      <p className="text-text-secondary text-sm mb-4">
        Save your delivery addresses for quick checkout. These addresses will be available when placing orders.
      </p>

      {/* Saved Addresses List */}
      {savedLocations.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {savedLocations.map((location) => (
            <div key={location.id} className="bg-surface shadow-card rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  {location.type === "home" ? (
                    <HomeIcon size={20} className="text-primary" />
                  ) : (
                    <Building2 size={20} className="text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary">{location.label}</p>
                  <p className="text-text-secondary text-sm">{location.address}</p>
                </div>
                <button
                  onClick={() => removeSavedLocation(location.id)}
                  className="p-2 text-text-secondary hover:text-cta-alt transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedLocations.length === 0 && !showAddForm && (
        <div className="bg-surface shadow-card rounded-xl p-8 text-center mb-5">
          <MapPin size={36} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-primary font-semibold text-sm mb-1">No saved addresses</p>
          <p className="text-text-secondary text-xs">Add your delivery addresses for faster checkout.</p>
        </div>
      )}

      {/* Add New Address */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-3 w-full bg-surface shadow-card rounded-xl p-4 text-left border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Plus size={20} className="text-primary" />
          </div>
          <p className="font-semibold text-sm text-primary">Add New Address</p>
        </button>
      ) : (
        <div className="bg-surface shadow-card rounded-xl p-5 border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-text-primary">New Address</h3>
            <button onClick={() => setShowAddForm(false)}>
              <X size={18} className="text-text-secondary" />
            </button>
          </div>

          {/* Map / Search Area */}
          <div className="h-40 bg-primary-light rounded-xl flex flex-col items-center justify-center mb-4 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary opacity-50 flex items-center justify-center mx-auto">
              <MapPin size={32} className="text-primary opacity-100" />
            </div>
            <p className="text-primary/60 text-xs mt-2 font-medium">Google Maps integration</p>
            <p className="text-primary/40 text-[10px] mt-0.5">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env</p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-background rounded-xl h-11 px-3 gap-2 border border-[#E0E0E0] mb-4">
            <Search size={18} className="text-text-secondary flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for address or area"
              className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
              onKeyDown={(e) => e.key === "Enter" && handleSearchAddress()}
            />
            <button onClick={handleSearchAddress}>
              <Crosshair size={18} className="text-primary" />
            </button>
          </div>

          {/* Label */}
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Label</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder={'e.g. "Home", "Office", "Mom\'s house"'}
            className="w-full h-11 px-4 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary mb-3"
          />

          {/* Address */}
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Address</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. Kilimani, Argwings Kodhek Rd"
            className="w-full h-11 px-4 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary mb-3"
          />

          {/* Type */}
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">Type</label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setForm({ ...form, type: "home" })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                form.type === "home" ? "bg-primary text-white" : "bg-background text-text-secondary border border-[#E0E0E0]"
              }`}
            >
              <HomeIcon size={16} /> Home
            </button>
            <button
              onClick={() => setForm({ ...form, type: "office" })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                form.type === "office" ? "bg-primary text-white" : "bg-background text-text-secondary border border-[#E0E0E0]"
              }`}
            >
              <Building2 size={16} /> Office
            </button>
          </div>

          <Button variant="primary" fullWidth onClick={handleSaveAddress} disabled={!form.label.trim() || !form.address.trim()}>
            Save Address
          </Button>
        </div>
      )}

      {/* Google Maps Info */}
      <div className="mt-5 bg-[#FFF5EC] rounded-xl p-4">
        <p className="text-text-primary text-sm font-semibold mb-1">Google Maps Integration</p>
        <p className="text-text-secondary text-xs leading-relaxed">
          For autocomplete address search and map pin dropping, set the <code className="bg-white px-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable with a valid Google Maps JavaScript API key that has Places and Geocoding APIs enabled.
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="md:hidden">
        <TopBar title="Saved Addresses" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Saved Addresses</h1>
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
