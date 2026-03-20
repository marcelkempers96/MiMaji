"use client";

import { logo1 } from "@/assets/images";
import { useState } from "react";
import { MapPin, Plus, Home as HomeIcon, Building2, Trash2, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useLocation, SavedLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";
import AddressForm, { AddressDisplay } from "@/components/AddressForm";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function SavedAddressesPage() {
  const { savedLocations, addSavedLocation, removeSavedLocation, updateSavedLocation } = useLocation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push("/login?redirect=/saved-addresses");
    return null;
  }
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveAddress = (loc: SavedLocation) => {
    addSavedLocation(loc);
    setShowAddForm(false);
  };

  const handleUpdateAddress = (loc: SavedLocation) => {
    updateSavedLocation(loc.id, loc);
    setEditingId(null);
  };

  const editingLocation = editingId ? savedLocations.find((l) => l.id === editingId) : null;

  const content = (
    <>
      <p className="text-text-secondary text-sm mb-4">
        Save your delivery addresses for quick checkout. These addresses will be available when placing orders.
      </p>

      {/* Saved Addresses List */}
      {savedLocations.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          {savedLocations.map((location) => (
            <div key={location.id}>
              {editingId === location.id ? (
                <AddressForm
                  initial={location}
                  onSubmit={handleUpdateAddress}
                  onCancel={() => setEditingId(null)}
                  submitLabel="Update Address"
                />
              ) : (
                <div className="bg-surface shadow-card rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      {location.type === "home" ? (
                        <HomeIcon size={20} className="text-primary" />
                      ) : (
                        <Building2 size={20} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <AddressDisplay location={location} />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingId(location.id)}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => removeSavedLocation(location.id)}
                        className="p-2 text-text-secondary hover:text-cta-alt transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
        <AddressForm
          onSubmit={handleSaveAddress}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Save Address"
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
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

