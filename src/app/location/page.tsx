"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, Crosshair, Home as HomeIcon, Building2, Plus, X } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useLocation } from "@/context/LocationContext";

export default function LocationPage() {
  const router = useRouter();
  const { savedLocations, selectedLocation, selectLocation, setCustomAddress } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  const handleConfirm = () => {
    router.push("/cart");
  };

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setCustomAddress(newAddress.trim());
      setShowAddForm(false);
      setNewAddress("");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCustomAddress(searchQuery.trim());
    }
  };

  return (
    <div className="bg-background min-h-screen pb-36">
      <TopBar title="Select Location" />

      <div className="max-w-md mx-auto md:max-w-2xl">
        {/* Map Placeholder */}
        <div className="mx-4 mt-2 h-64 bg-primary-light rounded-2xl flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary opacity-50 flex items-center justify-center mx-auto">
              <MapPin size={48} className="text-primary opacity-100" />
            </div>
            <p className="text-primary/60 text-xs mt-3 font-medium">
              Google Maps integration available
            </p>
            <p className="text-primary/40 text-[10px] mt-1">
              Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mx-4 mt-4 flex items-center bg-white rounded-full shadow-card h-12 px-4 gap-3">
          <Search size={20} className="text-text-secondary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an address or area"
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>
            <Crosshair size={20} className="text-primary shrink-0 cursor-pointer" />
          </button>
        </div>

        <p className="mx-4 mt-2 text-text-secondary text-xs">
          Type your address/area and press Enter, or select from saved locations below.
        </p>

        {/* Saved Locations */}
        <div className="mx-4 mt-4 flex flex-col gap-3">
          {savedLocations.map((location) => (
            <button
              key={location.id}
              onClick={() => selectLocation(location)}
              className={`flex items-center gap-4 bg-white rounded-xl p-4 shadow-card text-left transition-all ${
                selectedLocation?.id === location.id
                  ? "border-2 border-primary"
                  : "border-2 border-transparent"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                {location.type === "home" ? (
                  <HomeIcon size={20} className="text-primary" />
                ) : (
                  <Building2 size={20} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-primary">{location.label}</p>
                <p className="text-[13px] text-text-secondary">{location.address}</p>
              </div>
            </button>
          ))}

          {/* Custom address if set */}
          {selectedLocation?.id === "custom" && (
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-card border-2 border-primary">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-primary">Custom Address</p>
                <p className="text-[13px] text-text-secondary">{selectedLocation.address}</p>
              </div>
            </div>
          )}

          {/* Add New Address */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-card text-left border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Plus size={20} className="text-text-secondary" />
              </div>
              <p className="text-[14px] font-medium text-text-secondary">Add New Address</p>
            </button>
          ) : (
            <div className="bg-white rounded-xl p-4 shadow-card border-2 border-primary">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-text-primary">New Address</p>
                <button onClick={() => setShowAddForm(false)}>
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="e.g. Kilimani, Argwings Kodhek Rd"
                className="w-full h-11 px-4 rounded-xl bg-background border border-[#E0E0E0] text-text-primary text-sm focus:outline-none focus:border-primary mb-3"
                onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
                autoFocus
              />
              <Button variant="primary" fullWidth onClick={handleAddAddress}>
                Save Address
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Confirm Location */}
      <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto md:max-w-2xl">
        <Button variant="coral" fullWidth onClick={handleConfirm} disabled={!selectedLocation}>
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
