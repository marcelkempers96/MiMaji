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

const NAIROBI_NEIGHBOURHOODS = [
  "Kilimani", "Lavington", "Westlands", "Karen", "Kileleshwa",
  "South B", "South C", "Langata", "Hurlingham", "Upper Hill",
  "Parklands", "Riverside", "Runda", "Muthaiga", "Spring Valley",
  "Ngong Road", "Dagoretti", "Embakasi", "Kasarani", "Roysambu",
  "Ruaka", "Kitisuru", "Gigiri", "Loresho", "Mountain View",
  "Nairobi CBD", "Ngara", "Eastleigh", "Buruburu", "Donholm",
  "Umoja", "Kahawa", "Thika Road", "Rongai", "Syokimau",
  "Athi River", "Kitengela", "Kiambu", "Ruiru",
];

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
  const [label, setLabel] = useState(initial?.label || "");
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
  const [addressType, setAddressType] = useState<"home" | "office">(initial?.type || "home");
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
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    } else {
      // Fallback to Nominatim (debounced to respect rate limits)
      if (nominatimTimerRef.current) clearTimeout(nominatimTimerRef.current);
      nominatimTimerRef.current = setTimeout(() => searchNominatim(value), 500);
    }
  }, [searchNominatim]);

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
            for (const comp of components) {
              if (comp.types.includes("route")) setStreetName(comp.long_name);
              if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) setNeighbourhood(comp.long_name);
              if (comp.types.includes("postal_code")) setPostalCode(comp.long_name);
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
      if (secondary) setNeighbourhood(secondary.split(",")[0] || "");
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
    if (parts.length > 1) setNeighbourhood(parts[1]);
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
                  if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) setNeighbourhood(comp.long_name);
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
      id: initial?.id || `loc-${Date.now()}`,
      label: label.trim() || (addressType === "home" ? "Home" : "Office"),
      address: buildDisplayAddress({
        streetName: streetName.trim(),
        buildingName: buildingName.trim(),
        unitNumber: unitNumber.trim(),
        floor: floor.trim(),
        neighbourhood: neighbourhood.trim(),
        postalCode: postalCode.trim(),
      }),
      type: addressType,
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
    <div className="bg-surface shadow-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-text-primary">
          {initial?.id ? "Edit Address" : "New Delivery Address"}
        </h3>
        <button onClick={onCancel} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Hidden div for PlacesService */}
      <div ref={mapDivRef} className="hidden" />

      {/* Google Maps Search */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
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

      {!mapsLoaded && !nominatimResults.length && (
        <p className="text-xs text-text-secondary mb-3 bg-primary-light rounded-lg px-3 py-2">
          Enter your delivery address manually below or search for your location.
        </p>
      )}

      {/* Divider between search and address details */}
      <div className="border-t border-gray-100 my-4" />

      {/* Address Label */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Address Label
      </label>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setAddressType("home"); setLabel("Home"); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            label === "Home" ? "bg-primary text-white" : "bg-gray-50 text-text-secondary border border-gray-200"
          }`}
        >
          <Home size={14} /> Home
        </button>
        <button
          onClick={() => { setAddressType("office"); setLabel("Office"); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            label === "Office" ? "bg-primary text-white" : "bg-gray-50 text-text-secondary border border-gray-200"
          }`}
        >
          <Briefcase size={14} /> Office
        </button>
        <input
          type="text"
          value={label !== "Home" && label !== "Office" ? label : ""}
          onChange={(e) => { setLabel(e.target.value); setAddressType("home"); }}
          onFocus={() => { if (label === "Home" || label === "Office") setLabel(""); }}
          placeholder="Custom label..."
          className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold outline-none transition-colors ${
            label !== "Home" && label !== "Office" && label
              ? "border-primary text-primary bg-primary-light"
              : "border-gray-200 text-text-secondary bg-gray-50"
          }`}
        />
      </div>

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
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Neighbourhood / Area *
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {NAIROBI_NEIGHBOURHOODS.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => { setNeighbourhood(area); setIsCustomNeighbourhood(false); setCustomNeighbourhood(""); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              neighbourhood === area && !isCustomNeighbourhood
                ? "bg-primary text-white"
                : "bg-gray-50 text-text-secondary border border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {area}
          </button>
        ))}
        <button
          type="button"
          onClick={() => { setIsCustomNeighbourhood(true); setNeighbourhood(customNeighbourhood); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            isCustomNeighbourhood
              ? "bg-primary text-white"
              : "bg-gray-50 text-text-secondary border border-gray-200 hover:border-primary hover:text-primary"
          }`}
        >
          Other
        </button>
      </div>
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
      {!isCustomNeighbourhood && <div className="mb-3" />}

      {/* Street Name */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Street Name
      </label>
      <input
        type="text"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        placeholder="Street name"
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
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
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={saveForFuture}
            onChange={(e) => handleSaveChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">Save this location for future orders</span>
        </label>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-text-secondary"
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
