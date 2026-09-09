"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  Home,
  Briefcase,
  Building2,
  Search,
  Crosshair,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import type { SavedLocation, LocationType } from "@/context/LocationContext";
import { buildDisplayAddress } from "@/context/LocationContext";

const LOCATION_TYPES: { value: LocationType; label: string; icon: typeof Home }[] = [
  { value: "house", label: "House", icon: Home },
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "office", label: "Office", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
];

import { NAIROBI_AREAS } from "@/data/products";

const POPULAR_AREAS = [
  "Kilimani", "Westlands", "Lavington", "Karen", "CBD", "South C", "South B", "Kileleshwa",
];

// Use the full NAIROBI_AREAS list (45+ areas) for the dropdown
const NAIROBI_NEIGHBOURHOODS = NAIROBI_AREAS;

interface AddressFormProps {
  /** Called when user submits the form */
  onSubmit: (location: SavedLocation) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Initial values for editing */
  initial?: Partial<SavedLocation>;
  /** Whether to show the "save for future" checkbox */
  showSaveCheckbox?: boolean;
  /** Callback for save checkbox */
  onSaveToggle?: (save: boolean) => void;
  /** Default save checkbox value */
  defaultSave?: boolean;
  /** Submit button label */
  submitLabel?: string;
}

export default function AddressForm({
  onSubmit,
  onCancel,
  initial,
  showSaveCheckbox = false,
  onSaveToggle,
  defaultSave = true,
  submitLabel = "Save Address",
}: AddressFormProps) {
  const [streetName, setStreetName] = useState(initial?.streetName || "");
  const [buildingName, setBuildingName] = useState(initial?.buildingName || "");
  const [unitNumber, setUnitNumber] = useState(initial?.unitNumber || "");
  const [floor, setFloor] = useState(initial?.floor || "");
  const [locationType, setLocationType] = useState<LocationType>(initial?.locationType || "apartment");
  const [postalCode, setPostalCode] = useState(initial?.postalCode || "");
  const [additionalDirections, setAdditionalDirections] = useState(initial?.additionalDirections || "");
  const [neighbourhood, setNeighbourhood] = useState(initial?.neighbourhood || "");
  const [customNeighbourhood, setCustomNeighbourhood] = useState("");
  const [isCustomNeighbourhood, setIsCustomNeighbourhood] = useState(
    initial?.neighbourhood ? !NAIROBI_NEIGHBOURHOODS.includes(initial.neighbourhood) : false
  );
  const [saveForFuture, setSaveForFuture] = useState(defaultSave);
  const [lat, setLat] = useState<number | undefined>(initial?.lat);
  const [lng, setLng] = useState<number | undefined>(initial?.lng);

  // Google Maps autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  // Check if Google Maps is available — poll until loaded (script uses lazyOnload)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      if (window.google?.maps?.places) {
        setMapsLoaded(true);
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        return true;
      }
      return false;
    };

    if (init()) return;

    // Poll every 500ms for up to 15 seconds
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (init() || attempts >= 30) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Initialize PlacesService (needs a map/div element)
  useEffect(() => {
    if (mapsLoaded && mapDivRef.current && !placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapDivRef.current);
    }
  }, [mapsLoaded]);

  // Nominatim fallback predictions
  const [nominatimResults, setNominatimResults] = useState<Array<{ place_id: string; display_name: string; lat: string; lon: string }>>([]);
  const nominatimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchNominatim = useCallback(async (query: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Nairobi Kenya")}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setNominatimResults(data);
      setShowPredictions(data.length > 0);
    } catch {
      setNominatimResults([]);
      setShowPredictions(false);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.length < 3) {
      setPredictions([]);
      setNominatimResults([]);
      setShowPredictions(false);
      return;
    }

    if (autocompleteServiceRef.current) {
      // Use Google Maps
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "ke" },
          types: ["address", "establishment"],
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            setPredictions(results);
            setShowPredictions(true);
          } else {
            // Google returned no results — fallback to Nominatim
            setPredictions([]);
            if (nominatimTimerRef.current) clearTimeout(nominatimTimerRef.current);
            nominatimTimerRef.current = setTimeout(() => searchNominatim(value), 300);
          }
        }
      );
    } else {
      // No Google Maps — use Nominatim (debounced to respect rate limits)
      if (nominatimTimerRef.current) clearTimeout(nominatimTimerRef.current);
      nominatimTimerRef.current = setTimeout(() => searchNominatim(value), 400);
    }
  }, [searchNominatim]);

  /** Try to match a neighbourhood string from the API to one of our predefined areas */
  const autoMatchNeighbourhood = (apiNeighbourhood: string) => {
    if (!apiNeighbourhood) return;
    // Exact match first
    const exact = NAIROBI_NEIGHBOURHOODS.find((n) => n.toLowerCase() === apiNeighbourhood.toLowerCase());
    if (exact) {
      setNeighbourhood(exact);
      setIsCustomNeighbourhood(false);
      setCustomNeighbourhood("");
      return;
    }
    // Partial match (API value contains or is contained in our list)
    const partial = NAIROBI_NEIGHBOURHOODS.find(
      (n) => apiNeighbourhood.toLowerCase().includes(n.toLowerCase()) || n.toLowerCase().includes(apiNeighbourhood.toLowerCase())
    );
    if (partial) {
      setNeighbourhood(partial);
      setIsCustomNeighbourhood(false);
      setCustomNeighbourhood("");
      return;
    }
    // No match — set as custom neighbourhood
    setNeighbourhood(apiNeighbourhood);
    setIsCustomNeighbourhood(true);
    setCustomNeighbourhood(apiNeighbourhood);
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    setSearchQuery(prediction.description);
    setShowPredictions(false);
    setPredictions([]);

    if (placesServiceRef.current) {
      placesServiceRef.current.getDetails(
        { placeId: prediction.place_id, fields: ["geometry", "address_components", "formatted_address"] },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            if (place.geometry?.location) {
              setLat(place.geometry.location.lat());
              setLng(place.geometry.location.lng());
            }
            // Parse address components
            const components = place.address_components || [];
            let foundNeighbourhood = "";
            for (const comp of components) {
              if (comp.types.includes("route")) setStreetName(comp.long_name);
              if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
                foundNeighbourhood = comp.long_name;
              }
              if (comp.types.includes("postal_code")) setPostalCode(comp.long_name);
            }
            // Auto-match neighbourhood/area from API result
            if (foundNeighbourhood) {
              autoMatchNeighbourhood(foundNeighbourhood);
            } else {
              // Try secondary text from prediction as fallback for area
              const secondary = prediction.structured_formatting.secondary_text || "";
              const areaPart = secondary.split(",")[0]?.trim();
              if (areaPart) autoMatchNeighbourhood(areaPart);
            }
            // If no route was found in address components, use formatted address
            const hasRoute = components.some((c) => c.types.includes("route"));
            if (!hasRoute && place.formatted_address) {
              setStreetName(place.formatted_address.split(",")[0] || "");
            }
          }
        }
      );
    } else {
      // No Places API — just use the text
      setStreetName(prediction.structured_formatting.main_text);
      const secondary = prediction.structured_formatting.secondary_text || "";
      if (secondary) {
        const areaPart = secondary.split(",")[0]?.trim() || "";
        autoMatchNeighbourhood(areaPart);
      }
    }
  };

  const handleSelectNominatim = (result: { place_id: string; display_name: string; lat: string; lon: string }) => {
    setSearchQuery(result.display_name);
    setShowPredictions(false);
    setNominatimResults([]);
    setLat(parseFloat(result.lat));
    setLng(parseFloat(result.lon));
    const parts = result.display_name.split(",").map((s: string) => s.trim());
    if (parts.length > 0) setStreetName(parts[0]);
    if (parts.length > 1) autoMatchNeighbourhood(parts[1]);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        // Reverse geocode if Maps available
        if (mapsLoaded && window.google?.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                const components = results[0].address_components || [];
                for (const comp of components) {
                  if (comp.types.includes("route")) setStreetName(comp.long_name);
                  if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) {
                    autoMatchNeighbourhood(comp.long_name);
                  }
                  if (comp.types.includes("postal_code")) setPostalCode(comp.long_name);
                }
                setSearchQuery(results[0].formatted_address || "");
              }
            }
          );
        }
      },
      () => {
        // Permission denied or error — silently ignore
      }
    );
  };

  const handleSaveChange = (checked: boolean) => {
    setSaveForFuture(checked);
    onSaveToggle?.(checked);
  };

  const isValid = streetName.trim() || neighbourhood.trim();

  const handleSubmit = () => {
    if (!isValid) return;

    const loc: SavedLocation = {
      id: initial?.id || `loc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      // SavedLocation.label is required and is the heading in the saved-address
      // list, so it is derived now that the picker is gone: keep an existing
      // label when editing, otherwise name the address after its area.
      label:
        initial?.label?.trim() ||
        neighbourhood.trim() ||
        streetName.trim() ||
        LOCATION_TYPES.find((lt) => lt.value === locationType)?.label ||
        "Address",
      address: buildDisplayAddress({
        streetName: streetName.trim(),
        buildingName: buildingName.trim(),
        unitNumber: unitNumber.trim(),
        floor: floor.trim(),
        neighbourhood: neighbourhood.trim(),
        postalCode: postalCode.trim(),
      }),
      type: locationType === "office" ? "office" : "home",
      streetName: streetName.trim(),
      buildingName: buildingName.trim(),
      unitNumber: unitNumber.trim(),
      floor: floor.trim(),
      locationType,
      postalCode: postalCode.trim(),
      additionalDirections: additionalDirections.trim(),
      neighbourhood: neighbourhood.trim(),
      lat,
      lng,
    };

    onSubmit(loc);
  };

  return (
    <div className="bg-surface shadow-card rounded-2xl p-5 space-y-0">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-base text-text-primary">
          {initial?.id ? "Edit Address" : "New Delivery Address"}
        </h3>
        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Hidden div for PlacesService */}
      <div ref={mapDivRef} className="hidden" />

      {/* Location Search */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
        Search Location
      </label>
      <div className="relative mb-3">
        <div className="flex items-center bg-background rounded-xl h-11 px-3 gap-2 border border-[#E0E0E0] focus-within:border-primary">
          <Search size={18} className="text-text-secondary flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={mapsLoaded ? "Search for area, street, or building..." : "Type area or street name..."}
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          />
          <button
            onClick={handleGetCurrentLocation}
            className="p-1"
            title="Use current location"
          >
            <Crosshair size={18} className="text-primary" />
          </button>
        </div>

        {/* Autocomplete dropdown - Google Maps */}
        {showPredictions && predictions.length > 0 && (
          <div className="absolute z-20 top-12 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                onClick={() => handleSelectPrediction(p)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary-light text-left transition-colors border-b border-gray-50 last:border-0"
              >
                <MapPin size={16} className="text-text-secondary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-text-primary font-medium truncate">{p.structured_formatting.main_text}</p>
                  <p className="text-xs text-text-secondary truncate">{p.structured_formatting.secondary_text}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Autocomplete dropdown - Nominatim fallback */}
        {showPredictions && predictions.length === 0 && nominatimResults.length > 0 && (
          <div className="absolute z-20 top-12 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
            {nominatimResults.map((r) => {
              const parts = r.display_name.split(",").map((s: string) => s.trim());
              return (
                <button
                  key={r.place_id}
                  onClick={() => handleSelectNominatim(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary-light text-left transition-colors border-b border-gray-50 last:border-0"
                >
                  <MapPin size={16} className="text-text-secondary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">{parts[0]}</p>
                    <p className="text-xs text-text-secondary truncate">{parts.slice(1, 3).join(", ")}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!mapsLoaded && !nominatimResults.length && searchQuery.length < 3 && (
        <p className="text-xs text-text-secondary mb-4 bg-primary-light rounded-lg px-3 py-2.5">
          Start typing an address above to search, or fill in the details below.
        </p>
      )}

      {/* Divider between search and address details */}
      <div className="border-t border-gray-100 my-5" />

      {/* Location Type */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Property Type
      </label>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {LOCATION_TYPES.map((lt) => {
          const Icon = lt.icon;
          return (
            <button
              key={lt.value}
              onClick={() => setLocationType(lt.value)}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                locationType === lt.value
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-text-secondary border border-gray-200"
              }`}
            >
              <Icon size={18} />
              {lt.label}
            </button>
          );
        })}
      </div>

      {/* Neighbourhood / Area */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
        Neighbourhood / Area *
      </label>
      {/* Popular areas as quick-select buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {POPULAR_AREAS.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => { setNeighbourhood(area); setIsCustomNeighbourhood(false); setCustomNeighbourhood(""); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              neighbourhood === area && !isCustomNeighbourhood
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {area}
          </button>
        ))}
      </div>
      {/* Full dropdown with all Nairobi areas */}
      <select
        value={isCustomNeighbourhood ? "__other__" : neighbourhood}
        onChange={(e) => {
          if (e.target.value === "__other__") {
            setIsCustomNeighbourhood(true);
            setNeighbourhood(customNeighbourhood);
          } else {
            setIsCustomNeighbourhood(false);
            setCustomNeighbourhood("");
            setNeighbourhood(e.target.value);
          }
        }}
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary outline-none focus:border-primary text-sm mb-2 bg-white"
      >
        <option value="" disabled>All Nairobi areas...</option>
        {NAIROBI_NEIGHBOURHOODS.map((area) => (
          <option key={area} value={area}>{area}</option>
        ))}
        <option value="__other__">Other (type manually)</option>
      </select>
      {isCustomNeighbourhood && (
        <input
          type="text"
          value={customNeighbourhood}
          onChange={(e) => { setCustomNeighbourhood(e.target.value); setNeighbourhood(e.target.value); }}
          placeholder="Type your neighbourhood..."
          className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
          autoFocus
        />
      )}
      {!isCustomNeighbourhood && <div className="mb-2" />}

      {/* Street Name */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2 block">
        Street Name
      </label>
      <input
        type="text"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        placeholder="e.g. Ngong Road, Argwings Kodhek Road"
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-4"
      />

      {/* Building Name — show for apartment/office */}
      {(locationType === "apartment" || locationType === "office") && (
        <>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            Building / Estate Name
          </label>
          <input
            type="text"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="Building / estate name"
            className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
          />
        </>
      )}

      {/* Floor & Unit — show for apartment/office */}
      {(locationType === "apartment" || locationType === "office") && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
              Floor
            </label>
            <input
              type="text"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="Floor"
              className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
              Unit / Door No.
            </label>
            <input
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="Unit / door no."
              className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm"
            />
          </div>
        </div>
      )}

      {/* House-specific — gate color / landmark */}
      {locationType === "house" && (
        <>
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
            House Number / Name
          </label>
          <input
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="House number / name"
            className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
          />
        </>
      )}

      {/* Postal Code (optional) */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Postal Code <span className="text-text-secondary/60 normal-case">(optional)</span>
      </label>
      <input
        type="text"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        placeholder="Postal code"
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
      />

      {/* Additional Directions */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Delivery Directions <span className="text-text-secondary/60 normal-case">(optional)</span>
      </label>
      <textarea
        value={additionalDirections}
        onChange={(e) => setAdditionalDirections(e.target.value)}
        placeholder="e.g. Behind Naivas Kilimani, use the side gate, ring bell twice"
        rows={2}
        className="rounded-xl border border-gray-200 px-4 py-3 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3 resize-none"
      />

      {/* Save for future checkbox */}
      {showSaveCheckbox && (
        <label className="flex items-center gap-2 mb-5 cursor-pointer bg-primary-light rounded-xl px-4 py-3">
          <input
            type="checkbox"
            checked={saveForFuture}
            onChange={(e) => handleSaveChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-primary font-medium">Save this location for future orders</span>
        </label>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-text-secondary hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            isValid ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <MapPin size={16} />
            {submitLabel}
          </div>
        </button>
      </div>
    </div>
  );
}

/** Compact display of a saved location with detailed fields */
export function AddressDisplay({ location }: { location: SavedLocation }) {
  const typeLabel = LOCATION_TYPES.find((t) => t.value === location.locationType)?.label;
  const parts: string[] = [];
  if (location.buildingName) parts.push(location.buildingName);
  if (location.floor || location.unitNumber) {
    const sub = [location.floor ? `Fl ${location.floor}` : "", location.unitNumber ? `#${location.unitNumber}` : ""]
      .filter(Boolean)
      .join(", ");
    if (sub) parts.push(sub);
  }
  if (location.streetName) parts.push(location.streetName);

  return (
    <div className="min-w-0">
      <p className="font-bold text-sm text-text-primary">{location.label}</p>
      <p className="text-text-secondary text-xs truncate">{location.address}</p>
      {parts.length > 0 && (
        <p className="text-text-secondary text-[11px] truncate mt-0.5">
          {typeLabel && <span className="text-primary font-medium">{typeLabel}</span>}
          {typeLabel && parts.length > 0 && " · "}
          {parts.join(", ")}
        </p>
      )}
      {location.additionalDirections && (
        <p className="text-text-secondary text-[11px] italic truncate mt-0.5">
          &quot;{location.additionalDirections}&quot;
        </p>
      )}
    </div>
  );
}
