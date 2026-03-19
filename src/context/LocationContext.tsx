"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type LocationType = "house" | "apartment" | "office" | "other";

export interface SavedLocation {
  id: string;
  label: string;
  address: string;
  type: "home" | "office";
  // Detailed fields
  streetName?: string;
  buildingName?: string;
  unitNumber?: string;
  floor?: string;
  locationType?: LocationType;
  postalCode?: string;
  additionalDirections?: string;
  neighbourhood?: string;
  // Google Maps coords
  lat?: number;
  lng?: number;
}

// Build a display-friendly address string from detailed fields
export function buildDisplayAddress(loc: Partial<SavedLocation>): string {
  const parts: string[] = [];
  if (loc.buildingName) parts.push(loc.buildingName);
  if (loc.unitNumber) {
    const unit = loc.floor ? `Floor ${loc.floor}, Unit ${loc.unitNumber}` : `Unit ${loc.unitNumber}`;
    parts.push(unit);
  } else if (loc.floor) {
    parts.push(`Floor ${loc.floor}`);
  }
  if (loc.streetName) parts.push(loc.streetName);
  if (loc.neighbourhood) parts.push(loc.neighbourhood);
  if (loc.postalCode) parts.push(loc.postalCode);
  if (parts.length > 0) return parts.join(", ");
  return loc.address || "";
}

interface LocationContextType {
  neighbourhood: string;
  setNeighbourhood: (n: string) => void;
  selectedLocation: SavedLocation | null;
  savedLocations: SavedLocation[];
  selectLocation: (location: SavedLocation) => void;
  setCustomAddress: (address: string) => void;
  addSavedLocation: (location: SavedLocation) => void;
  removeSavedLocation: (id: string) => void;
  updateSavedLocation: (id: string, updates: Partial<SavedLocation>) => void;
}

const defaultSavedLocations: SavedLocation[] = [
  { id: "loc1", label: "Home", address: "Kilimani, Nairobi", type: "home", neighbourhood: "Kilimani", streetName: "Argwings Kodhek Road", locationType: "apartment" },
  { id: "loc2", label: "Office", address: "Westlands, Nairobi", type: "office", neighbourhood: "Westlands", streetName: "Waiyaki Way", locationType: "office" },
];

const LocationContext = createContext<LocationContextType>({
  neighbourhood: "Kilimani, Nairobi",
  setNeighbourhood: () => {},
  selectedLocation: null,
  savedLocations: defaultSavedLocations,
  selectLocation: () => {},
  setCustomAddress: () => {},
  addSavedLocation: () => {},
  removeSavedLocation: () => {},
  updateSavedLocation: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [neighbourhood, setNeighbourhood] = useState("Kilimani, Nairobi");
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(defaultSavedLocations);

  const selectLocation = useCallback((location: SavedLocation) => {
    setSelectedLocation(location);
    setNeighbourhood(location.neighbourhood || location.address);
  }, []);

  const setCustomAddress = useCallback((address: string) => {
    setSelectedLocation({ id: "custom", label: "Custom", address, type: "home" });
    setNeighbourhood(address);
  }, []);

  const addSavedLocation = useCallback((location: SavedLocation) => {
    setSavedLocations((prev) => [...prev, location]);
  }, []);

  const removeSavedLocation = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((loc) => loc.id !== id));
  }, []);

  const updateSavedLocation = useCallback((id: string, updates: Partial<SavedLocation>) => {
    setSavedLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc))
    );
  }, []);

  return (
    <LocationContext.Provider
      value={{
        neighbourhood,
        setNeighbourhood,
        selectedLocation,
        savedLocations,
        selectLocation,
        setCustomAddress,
        addSavedLocation,
        removeSavedLocation,
        updateSavedLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
