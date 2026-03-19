"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Home, Briefcase, Check, Trash2 } from "lucide-react";

import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useLocation, SavedLocation } from "@/context/LocationContext";
import { useAuth } from "@/context/AuthContext";

export default function DeliveryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { savedLocations, selectedLocation, selectLocation, addSavedLocation, removeSavedLocation } = useLocation();

  const [showAddNew, setShowAddNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newType, setNewType] = useState<"home" | "office">("home");
  const [saveNew, setSaveNew] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedLocation?.id || null);

  const handleSelectLocation = (loc: SavedLocation) => {
    setSelectedId(loc.id);
    selectLocation(loc);
    setShowAddNew(false);
  };

  const handleAddNew = () => {
    if (!newAddress.trim()) return;

    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      label: newLabel.trim() || (newType === "home" ? "Home" : "Office"),
      address: newAddress.trim(),
      type: newType,
    };

    if (saveNew) {
      addSavedLocation(newLoc);
    }

    selectLocation(newLoc);
    setSelectedId(newLoc.id);
    setShowAddNew(false);
    setNewLabel("");
    setNewAddress("");
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

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Delivery Address" />
        <div className="max-w-md mx-auto px-4 pt-4">
          <DeliveryContent
            savedLocations={savedLocations}
            selectedId={selectedId}
            showAddNew={showAddNew}
            newLabel={newLabel}
            newAddress={newAddress}
            newType={newType}
            saveNew={saveNew}
            setShowAddNew={setShowAddNew}
            setNewLabel={setNewLabel}
            setNewAddress={setNewAddress}
            setNewType={setNewType}
            setSaveNew={setSaveNew}
            handleSelectLocation={handleSelectLocation}
            handleAddNew={handleAddNew}
            removeSavedLocation={removeSavedLocation}
          />
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
            <a href="/" className="flex items-center">
              <img src="/logo1.png" alt="MiMaji" className="h-8 w-auto" />
            </a>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Choose Delivery Address</h1>
          <DeliveryContent
            savedLocations={savedLocations}
            selectedId={selectedId}
            showAddNew={showAddNew}
            newLabel={newLabel}
            newAddress={newAddress}
            newType={newType}
            saveNew={saveNew}
            setShowAddNew={setShowAddNew}
            setNewLabel={setNewLabel}
            setNewAddress={setNewAddress}
            setNewType={setNewType}
            setSaveNew={setSaveNew}
            handleSelectLocation={handleSelectLocation}
            handleAddNew={handleAddNew}
            removeSavedLocation={removeSavedLocation}
          />
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

function DeliveryContent({
  savedLocations,
  selectedId,
  showAddNew,
  newLabel,
  newAddress,
  newType,
  saveNew,
  setShowAddNew,
  setNewLabel,
  setNewAddress,
  setNewType,
  setSaveNew,
  handleSelectLocation,
  handleAddNew,
  removeSavedLocation,
}: {
  savedLocations: SavedLocation[];
  selectedId: string | null;
  showAddNew: boolean;
  newLabel: string;
  newAddress: string;
  newType: "home" | "office";
  saveNew: boolean;
  setShowAddNew: (v: boolean) => void;
  setNewLabel: (v: string) => void;
  setNewAddress: (v: string) => void;
  setNewType: (v: "home" | "office") => void;
  setSaveNew: (v: boolean) => void;
  handleSelectLocation: (loc: SavedLocation) => void;
  handleAddNew: () => void;
  removeSavedLocation: (id: string) => void;
}) {
  return (
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
                <p className="font-bold text-sm text-text-primary">{loc.label}</p>
                <p className="text-text-secondary text-xs truncate">{loc.address}</p>
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
        <div className="bg-surface shadow-card rounded-xl p-4 mt-2">
          <h3 className="font-bold text-sm text-text-primary mb-3">New Delivery Address</h3>

          {/* Type selector */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setNewType("home")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                newType === "home" ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"
              }`}
            >
              <Home size={16} /> Home
            </button>
            <button
              onClick={() => setNewType("office")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                newType === "office" ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"
              }`}
            >
              <Briefcase size={16} /> Office
            </button>
          </div>

          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. My Home, Work)"
            className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
          />

          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Full address (e.g. Kilimani, Ring Road, Apt 5B)"
            className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
          />

          {/* Save checkbox */}
          <label className="flex items-center gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={saveNew}
              onChange={(e) => setSaveNew(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-secondary">Save this location for future orders</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowAddNew(false); setNewLabel(""); setNewAddress(""); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-text-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNew}
              disabled={!newAddress.trim()}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                newAddress.trim()
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <MapPin size={16} />
                Use This Address
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
