"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Home, Briefcase, Check, Trash2 } from "lucide-react";

import { logo1 } from "@/assets/images";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import AddressForm, { AddressDisplay } from "@/components/AddressForm";
import { useLocation, SavedLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";

export default function DeliveryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { savedLocations, selectedLocation, selectLocation, addSavedLocation, removeSavedLocation } = useLocation();

  const [showAddNew, setShowAddNew] = useState(false);
  const [saveNew, setSaveNew] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedLocation?.id || null);

  const handleSelectLocation = (loc: SavedLocation) => {
    setSelectedId(loc.id);
    selectLocation(loc);
    setShowAddNew(false);
  };

  const handleNewAddress = (loc: SavedLocation) => {
    if (saveNew) {
      addSavedLocation(loc);
    }
    selectLocation(loc);
    setSelectedId(loc.id);
    setShowAddNew(false);
  };

  const handleContinue = () => {
    if (selectedId || selectedLocation) {
      router.push("/confirm");
    }
  };

  if (!user) {
    router.push("/login?redirect=/delivery");
    return null;
  }

  const content = (
    <>
      {/* Saved Locations */}
      {savedLocations.length > 0 && (
        <div className="mb-4">
          <h2 className="font-bold text-sm text-text-primary mb-3">Saved Locations</h2>
          {savedLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleSelectLocation(loc)}
              className={`w-full flex items-center gap-3 rounded-xl p-4 mb-2 transition-all text-left ${
                selectedId === loc.id
                  ? "bg-primary-light border-2 border-primary"
                  : "bg-surface border-2 border-transparent shadow-card"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedId === loc.id ? "bg-primary" : "bg-gray-100"
              }`}>
                {loc.type === "home" ? (
                  <Home size={20} className={selectedId === loc.id ? "text-white" : "text-text-secondary"} />
                ) : (
                  <Briefcase size={20} className={selectedId === loc.id ? "text-white" : "text-text-secondary"} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <AddressDisplay location={loc} />
              </div>
              {selectedId === loc.id && (
                <Check size={20} className="text-primary flex-shrink-0" />
              )}
              {selectedId !== loc.id && !["loc1", "loc2"].includes(loc.id) && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeSavedLocation(loc.id); }}
                  className="p-1"
                >
                  <Trash2 size={16} className="text-text-secondary" />
                </button>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Add New Location Button */}
      {!showAddNew && (
        <button
          onClick={() => setShowAddNew(true)}
          className="w-full flex items-center gap-3 rounded-xl p-4 bg-surface shadow-card border-2 border-dashed border-gray-200 hover:border-primary transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
            <Plus size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm text-primary">Add New Location</p>
            <p className="text-text-secondary text-xs">Enter a new delivery address</p>
          </div>
        </button>
      )}

      {/* Add New Location Form */}
      {showAddNew && (
        <div className="mt-2">
          <AddressForm
            onSubmit={handleNewAddress}
            onCancel={() => setShowAddNew(false)}
            showSaveCheckbox
            defaultSave={saveNew}
            onSaveToggle={setSaveNew}
            submitLabel="Use This Address"
          />
        </div>
      )}
    </>
  );

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Delivery Address" />
        <div className="max-w-md mx-auto px-4 pt-4">
          {content}
        </div>
        <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={handleContinue}
            disabled={!selectedId && !selectedLocation}
          >
            Continue to Payment
          </Button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <header className="bg-surface border-b border-[#E0E0E0]">
          <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Choose Delivery Address</h1>
          {content}
          <div className="max-w-md mx-auto mt-8">
            <Button
              variant="primary"
              fullWidth
              onClick={handleContinue}
              disabled={!selectedId && !selectedLocation}
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
