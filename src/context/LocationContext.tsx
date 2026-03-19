"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface SavedLocation {
  id: string;
  label: string;
  address: string;
  type: "home" | "office";
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
}

const defaultSavedLocations: SavedLocation[] = [
  { id: "loc1", label: "Home", address: "Kilimani, Nairobi", type: "home" },
  { id: "loc2", label: "Office", address: "Westlands, Nairobi", type: "office" },
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
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [neighbourhood, setNeighbourhood] = useState("Kilimani, Nairobi");
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(defaultSavedLocations);

  const selectLocation = useCallback((location: SavedLocation) => {
    setSelectedLocation(location);
    setNeighbourhood(location.address);
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
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
