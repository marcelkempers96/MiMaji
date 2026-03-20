"use client";

import { useState, useRef, useCallback } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";

interface AddressResult {
  displayName: string;
  lat: number;
  lng: number;
  area: string;
}

interface AddressSearchProps {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  initialValue?: string;
}

/**
 * Address search input with suggestions powered by OpenStreetMap Nominatim.
 * Focused on Nairobi, Kenya results.
 */
export default function AddressSearch({ onSelect, placeholder = "Search address...", initialValue = "" }: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Use Nominatim with Kenya bias
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Nairobi, Kenya")}&limit=5&addressdetails=1&countrycodes=ke`;
      const res = await fetch(url, {
        headers: { "User-Agent": "MiMaji/1.0" },
      });
      const data = await res.json();

      const mapped: AddressResult[] = data.map((item: Record<string, unknown>) => {
        const addr = item.address as Record<string, string> | undefined;
        const area = addr?.suburb || addr?.neighbourhood || addr?.city_district || addr?.county || "";
        return {
          displayName: (item.display_name as string) || "",
          lat: parseFloat(item.lat as string) || -1.2864,
          lng: parseFloat(item.lon as string) || 36.8172,
          area,
        };
      });
      setResults(mapped);
      setShowResults(true);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSelect = (result: AddressResult) => {
    setQuery(result.displayName);
    setShowResults(false);
    onSelect(result);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-colors"
        />
        {loading && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary animate-spin" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-primary-light transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <MapPin size={14} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-text-primary leading-snug line-clamp-2">{result.displayName}</p>
                {result.area && (
                  <p className="text-[10px] text-text-secondary mt-0.5">{result.area}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 3 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center">
          <p className="text-xs text-text-secondary">No results found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
