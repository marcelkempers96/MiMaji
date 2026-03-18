"use client";

import { useRouter } from "next/navigation";
import { MapPin, Search, Crosshair, Home as HomeIcon, Building2 } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useLocation } from "@/context/LocationContext";

export default function LocationPage() {
  const router = useRouter();
  const { savedLocations, selectedLocation, selectLocation } = useLocation();

  const handleConfirm = () => {
    router.push("/cart");
  };

  return (
    <div className="bg-background min-h-screen max-w-md mx-auto pb-36">
      <TopBar title="Select Location" />

      {/* Map Placeholder */}
      <div className="mx-4 mt-2 h-64 bg-primary-light rounded-2xl flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary opacity-50 flex items-center justify-center">
          <MapPin size={48} className="text-primary opacity-100" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-4 mt-4 flex items-center bg-white rounded-full shadow-card h-12 px-4 gap-3">
        <Search size={20} className="text-text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Search location"
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
        <Crosshair size={20} className="text-primary shrink-0 cursor-pointer" />
      </div>

      {/* Saved Locations */}
      <div className="mx-4 mt-5 flex flex-col gap-3">
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
      </div>

      {/* Bottom: Confirm Location */}
      <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
        <Button variant="coral" fullWidth onClick={handleConfirm}>
          Confirm Location
        </Button>
      </div>
    </div>
  );
}
