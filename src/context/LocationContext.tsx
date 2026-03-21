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

/** Check if there is a real Supabase auth session (not a mock user) */
async function hasActiveSupabaseSession(): Promise<boolean> {
  if (!hasSupabaseConfig) return false;
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

async function loadLocationsFromSupabase(userId: string): Promise<SavedLocation[] | null> {
  if (!hasSupabaseConfig) return null;
  // Only attempt if there's an active Supabase session (RLS requires auth.uid())
  if (!(await hasActiveSupabaseSession())) return null;
  try {
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase
      .from("profiles")
      .select("saved_locations")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.warn("Failed to load locations from Supabase:", error.message);
      return null;
    }
    if (data?.saved_locations && Array.isArray(data.saved_locations)) {
      return data.saved_locations as SavedLocation[];
    }
    return [];
  } catch (e) {
    console.warn("Failed to load locations from Supabase:", e);
    return null;
  }
}

async function persistLocationsToSupabase(userId: string, locations: SavedLocation[]): Promise<boolean> {
  if (!hasSupabaseConfig) return false;
  // Only attempt if there's an active Supabase session (RLS requires auth.uid())
  if (!(await hasActiveSupabaseSession())) return false;
  try {
    const { supabase } = await import("@/lib/supabase");
    const { error } = await supabase
      .from("profiles")
      .update({ saved_locations: locations })
      .eq("id", userId);
    if (error) {
      console.warn("Failed to save locations to Supabase:", error.message);
      // If update fails (no row), try upsert
      if (error.code === "PGRST116" || error.message.includes("0 rows")) {
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({ id: userId, saved_locations: locations }, { onConflict: "id" });
        if (upsertError) {
          console.warn("Failed to upsert locations to Supabase:", upsertError.message);
          return false;
        }
        return true;
      }
      return false;
    }
    return true;
  } catch (e) {
    console.warn("Failed to save locations to Supabase:", e);
    return false;
  }
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
  const { user, session } = useAuth();
  const [neighbourhood, setNeighbourhood] = useState("Nairobi");
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const prevUserIdRef = useRef<string | null>(null);
  const supabaseSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // Step 2: If Supabase is configured and user has a real session, fetch and merge
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
  // localStorage: immediate. Supabase: debounced (500ms) to avoid excessive writes.
  useEffect(() => {
    if (!loaded) return;

    // Always save to localStorage immediately
    persistLocations(savedLocations, user?.id);

    // Debounce Supabase writes
    if (user?.id && hasSupabaseConfig) {
      if (supabaseSaveTimerRef.current) clearTimeout(supabaseSaveTimerRef.current);
      supabaseSaveTimerRef.current = setTimeout(() => {
        persistLocationsToSupabase(user.id, savedLocations);
      }, 500);
    }
  }, [savedLocations, loaded, user?.id]);

  // When a real Supabase session appears (e.g. after login), push any local addresses to Supabase
  useEffect(() => {
    if (!session || !user?.id || !hasSupabaseConfig || !loaded) return;
    // User just got a real Supabase session — sync local addresses up
    const localLocs = loadSavedLocations(user.id);
    if (localLocs.length > 0) {
      persistLocationsToSupabase(user.id, localLocs);
    }
  }, [session, user?.id, loaded]);

  const selectLocation = useCallback((location: SavedLocation) => {
    setSelectedLocation(location);
    setNeighbourhood(location.neighbourhood || location.address);
  }, []);

  const setCustomAddress = useCallback((address: string) => {
    setSelectedLocation({ id: "custom", label: "Custom", address, type: "home" });
    setNeighbourhood(address);
  }, []);

  const addSavedLocation = useCallback((location: SavedLocation) => {
    setSavedLocations((prev) => {
      const next = [...prev, location];
      // Persist immediately to localStorage (don't wait for effect)
      persistLocations(next, user?.id);
      return next;
    });
  }, [user?.id]);

  const removeSavedLocation = useCallback((id: string) => {
    setSavedLocations((prev) => {
      const next = prev.filter((loc) => loc.id !== id);
      persistLocations(next, user?.id);
      return next;
    });
  }, [user?.id]);

  const updateSavedLocation = useCallback((id: string, updates: Partial<SavedLocation>) => {
    setSavedLocations((prev) => {
      const next = prev.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc));
      persistLocations(next, user?.id);
      return next;
    });
  }, [user?.id]);

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
