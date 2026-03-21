"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

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

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

// New accounts start with no saved addresses — user needs to add their first address
const STORAGE_KEY_PREFIX = "mimaji_saved_locations";

function getStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

function loadSavedLocations(userId?: string | null): SavedLocation[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistLocations(locations: SavedLocation[], userId?: string | null) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(locations));
  } catch {}
}

async function loadLocationsFromSupabase(userId: string): Promise<SavedLocation[] | null> {
  if (!hasSupabaseConfig) return null;
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase
      .from("profiles")
      .select("saved_locations")
      .eq("id", userId)
      .single();
    if (data?.saved_locations && Array.isArray(data.saved_locations)) {
      return data.saved_locations as SavedLocation[];
    }
    return [];
  } catch {
    return null;
  }
}

async function persistLocationsToSupabase(userId: string, locations: SavedLocation[]) {
  if (!hasSupabaseConfig) return;
  try {
    const { supabase } = await import("@/lib/supabase");
    await supabase
      .from("profiles")
      .update({ saved_locations: locations })
      .eq("id", userId);
  } catch {}
}

const LocationContext = createContext<LocationContextType>({
  neighbourhood: "Nairobi",
  setNeighbourhood: () => {},
  selectedLocation: null,
  savedLocations: [],
  selectLocation: () => {},
  setCustomAddress: () => {},
  addSavedLocation: () => {},
  removeSavedLocation: () => {},
  updateSavedLocation: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [neighbourhood, setNeighbourhood] = useState("Nairobi");
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);

  // Load saved locations: always from localStorage first (instant), then merge Supabase
  useEffect(() => {
    let cancelled = false;
    const userId = user?.id || null;

    // Skip if user hasn't changed
    if (userId === prevUserIdRef.current && loaded) return;

    // Clear selected location when user changes to prevent cross-account leakage
    if (prevUserIdRef.current !== null && userId !== prevUserIdRef.current) {
      setSelectedLocation(null);
    }
    prevUserIdRef.current = userId;

    // Step 1: Always load from localStorage immediately (instant, no network)
    const localLocs = loadSavedLocations(userId);
    setSavedLocations(localLocs);
    setLoaded(true);

    // Step 2: If Supabase is configured and user is logged in, fetch from Supabase
    // and merge (Supabase wins if it has data, otherwise push local data up)
    if (userId && hasSupabaseConfig) {
      loadLocationsFromSupabase(userId).then((supaLocs) => {
        if (cancelled) return;
        if (supaLocs && supaLocs.length > 0) {
          setSavedLocations(supaLocs);
          persistLocations(supaLocs, userId); // sync to localStorage as cache
        } else if (localLocs.length > 0) {
          // Supabase has nothing — push local data up as backup
          persistLocationsToSupabase(userId, localLocs);
        }
      });
    }

    return () => { cancelled = true; };
  }, [user?.id, loaded]);

  // Persist whenever savedLocations changes (only after initial load)
  useEffect(() => {
    if (loaded) {
      persistLocations(savedLocations, user?.id);
      if (user?.id && hasSupabaseConfig) {
        persistLocationsToSupabase(user.id, savedLocations);
      }
    }
  }, [savedLocations, loaded, user?.id]);

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
