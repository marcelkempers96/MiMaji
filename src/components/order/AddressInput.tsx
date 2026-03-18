"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AddressInputProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

export default function AddressInput({ value, onChange }: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.maps?.places) {
        setIsGoogleLoaded(true);
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
        const div = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(div);
        return true;
      }
      return false;
    };

    if (initGoogle()) return;

    // Poll for Google Maps to load (script loads afterInteractive)
    const interval = setInterval(() => {
      if (initGoogle()) clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const fetchSuggestions = useCallback(
    (input: string) => {
      if (!autocompleteService.current || input.length < 3) {
        setSuggestions([]);
        return;
      }

      autocompleteService.current.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: "ke" },
          types: ["geocode", "establishment"],
        },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(
              predictions.map((p) => ({
                description: p.description,
                place_id: p.place_id,
              }))
            );
            setShowSuggestions(true);
          }
        }
      );
    },
    []
  );

  const handleSelect = (placeId: string, description: string) => {
    setInputValue(description);
    setShowSuggestions(false);

    if (placesService.current) {
      placesService.current.getDetails(
        { placeId, fields: ["geometry"] },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.geometry?.location
          ) {
            onChange(
              description,
              place.geometry.location.lat(),
              place.geometry.location.lng()
            );
          }
        }
      );
    } else {
      onChange(description, -1.2921, 36.8219);
    }
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (isGoogleLoaded) {
      fetchSuggestions(val);
    }
    if (!val) {
      onChange("", 0, 0);
    }
  };

  if (!isGoogleLoaded) {
    return (
      <div>
        <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
          Delivery Address
        </label>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value, -1.2921, 36.8219);
          }}
          placeholder="e.g. Kilimani, Nairobi"
          className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 placeholder:text-text-light"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-[11px] font-semibold text-text-mid uppercase tracking-wider mb-2">
        Delivery Address
      </label>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="e.g. Kilimani, Nairobi"
        className="w-full px-4 py-3 rounded-2xl text-sm text-blue-900 bg-blue-50 placeholder:text-text-light"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl z-20 overflow-hidden" style={{ boxShadow: "0 8px 30px rgba(26, 58, 92, 0.12)" }}>
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => handleSelect(s.place_id, s.description)}
              className="w-full px-4 py-3 text-left text-sm text-text-mid hover:bg-blue-50 border-b border-blue-50 last:border-b-0 transition-colors"
            >
              {s.description}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
