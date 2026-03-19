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

  // Check if Google Maps is available
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setMapsLoaded(true);
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Initialize PlacesService (needs a map/div element)
  useEffect(() => {
    if (mapsLoaded && mapDivRef.current && !placesServiceRef.current) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapDivRef.current);
    }
  }, [mapsLoaded]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (!autocompleteServiceRef.current || value.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

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
  }, []);

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
            if (!streetName && place.formatted_address) {
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

        {/* Autocomplete dropdown */}
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
      </div>

      {!mapsLoaded && (
        <p className="text-xs text-text-secondary mb-3 bg-[#FFF5EC] rounded-lg px-3 py-2">
          Google Maps not configured. You can still enter your address manually below.
        </p>
      )}

      {/* Address Type (home/office) */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Save As
      </label>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setAddressType("home")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            addressType === "home" ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"
          }`}
        >
          <Home size={16} /> Home
        </button>
        <button
          onClick={() => setAddressType("office")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            addressType === "office" ? "bg-primary text-white" : "bg-gray-100 text-text-secondary"
          }`}
        >
          <Briefcase size={16} /> Office
        </button>
      </div>

      {/* Label */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Label
      </label>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder={'e.g. "My Home", "Work"'}
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
      />

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
      <input
        type="text"
        value={neighbourhood}
        onChange={(e) => setNeighbourhood(e.target.value)}
        placeholder="e.g. Kilimani, Westlands, Karen"
        className="rounded-xl border border-gray-200 h-11 px-4 w-full text-text-primary placeholder:text-text-secondary outline-none focus:border-primary text-sm mb-3"
      />

      {/* Street Name */}
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5 block">
        Street Name
      </label>
      <input
        type="text"
        value={streetName}
        onChange={(e) => setStreetName(e.target.value)}
        placeholder="e.g. Argwings Kodhek Road, Ngong Road"
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
            placeholder="e.g. Valley Arcade, The Mirage"
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
              placeholder="e.g. 3, Ground"
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
              placeholder="e.g. 5B, 204"
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
            placeholder="e.g. House 14, The Blue Gate"
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
        placeholder="e.g. 00100"
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
