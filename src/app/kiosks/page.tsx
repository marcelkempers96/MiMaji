"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/shared/Button";

interface Kiosk {
  id: string;
  name: string;
  address: string;
  zone: string;
  phone: string;
  hours: string;
  jugPrice: number;
  rating: number;
  reviews: number;
  verified: boolean;
  distance: string;
  lat: number;
  lng: number;
}

const demoKiosks: Kiosk[] = [
  {
    id: "1",
    name: "AquaPure Westlands",
    address: "Waiyaki Way, Westlands",
    zone: "Westlands",
    phone: "+254 722 XXX XXX",
    hours: "6:00 AM – 8:00 PM",
    jugPrice: 200,
    rating: 4.8,
    reviews: 124,
    verified: true,
    distance: "0.8 km",
    lat: -1.2673,
    lng: 36.8112,
  },
  {
    id: "2",
    name: "Clean Water Hub",
    address: "Argwings Kodhek Rd, Kilimani",
    zone: "Kilimani",
    phone: "+254 733 XXX XXX",
    hours: "7:00 AM – 9:00 PM",
    jugPrice: 200,
    rating: 4.6,
    reviews: 89,
    verified: true,
    distance: "1.2 km",
    lat: -1.2921,
    lng: 36.7856,
  },
  {
    id: "3",
    name: "Maji Fresh Depot",
    address: "Ngong Road, Karen",
    zone: "Karen",
    phone: "+254 711 XXX XXX",
    hours: "6:30 AM – 7:00 PM",
    jugPrice: 180,
    rating: 4.5,
    reviews: 67,
    verified: true,
    distance: "2.5 km",
    lat: -1.3187,
    lng: 36.7112,
  },
  {
    id: "4",
    name: "Blue Drop Water",
    address: "Moi Avenue, CBD",
    zone: "CBD",
    phone: "+254 720 XXX XXX",
    hours: "6:00 AM – 10:00 PM",
    jugPrice: 150,
    rating: 4.3,
    reviews: 203,
    verified: false,
    distance: "3.1 km",
    lat: -1.2834,
    lng: 36.8235,
  },
  {
    id: "5",
    name: "SafiWater Kileleshwa",
    address: "Gatundu Rd, Kileleshwa",
    zone: "Kileleshwa",
    phone: "+254 712 XXX XXX",
    hours: "7:00 AM – 8:00 PM",
    jugPrice: 200,
    rating: 4.7,
    reviews: 56,
    verified: true,
    distance: "1.8 km",
    lat: -1.2756,
    lng: 36.7789,
  },
  {
    id: "6",
    name: "Parklands Water Point",
    address: "3rd Parklands Ave",
    zone: "Parklands",
    phone: "+254 723 XXX XXX",
    hours: "6:00 AM – 9:00 PM",
    jugPrice: 190,
    rating: 4.4,
    reviews: 41,
    verified: true,
    distance: "2.0 km",
    lat: -1.2589,
    lng: 36.8178,
  },
];

type ViewMode = "list" | "map";
type SortBy = "distance" | "price" | "rating";

export default function KiosksPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortBy>("distance");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);

  const zones = ["all", "Westlands", "Kilimani", "Karen", "CBD", "Kileleshwa", "Parklands"];

  const filtered = demoKiosks
    .filter((k) => selectedZone === "all" || k.zone === selectedZone)
    .sort((a, b) => {
      if (sortBy === "price") return a.jugPrice - b.jugPrice;
      if (sortBy === "rating") return b.rating - a.rating;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    return (
      <span className="text-amber-400 text-xs">
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
        <span className="text-text-mid ml-1">{rating}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 font-body">
      <Navbar />

      {/* Header */}
      <div
        className="px-5 pt-6 pb-10 relative overflow-hidden bg-blue-900"
      >
        <h1 className="text-2xl font-bold text-white leading-tight mb-1">
          Water Kiosks & Shops
        </h1>
        <p className="text-blue-200 text-sm">
          Find verified water providers near you in Nairobi
        </p>
      </div>

      {/* Controls */}
      <div className="-mt-5 mx-4 bg-white rounded-2xl p-4 shadow-lg relative z-10 mb-4">
        {/* View toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setView("list")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all ${
              view === "list"
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-blue-500 border-blue-200"
            }`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all ${
              view === "map"
                ? "bg-blue-700 text-white border-blue-700"
                : "bg-white text-blue-500 border-blue-200"
            }`}
          >
            🗺 Map View
          </button>
        </div>

        {/* Zone filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all ${
                selectedZone === zone
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-blue-50 text-blue-500 border-blue-200"
              }`}
            >
              {zone === "all" ? "All Zones" : zone}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-xs text-text-mid">
          <span>Sort by:</span>
          {(["distance", "price", "rating"] as SortBy[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                sortBy === s
                  ? "text-blue-700 bg-blue-50"
                  : "text-text-light hover:text-blue-500"
              }`}
            >
              {s === "distance" ? "📍 Nearest" : s === "price" ? "💰 Price" : "⭐ Rating"}
            </button>
          ))}
        </div>
      </div>

      {/* Map View */}
      {view === "map" && (
        <div className="mx-4 mb-4 bg-white rounded-2xl overflow-hidden border border-blue-200 shadow-sm">
          <div className="h-64 bg-blue-100 flex items-center justify-center relative">
            <div className="text-center text-text-mid">
              <div className="text-4xl mb-2">🗺</div>
              <p className="text-sm font-semibold text-blue-900">Interactive Map</p>
              <p className="text-xs">Connect Google Maps API key to enable</p>
            </div>
            {/* Map pin indicators */}
            {filtered.map((k, i) => (
              <button
                key={k.id}
                onClick={() => setSelectedKiosk(k)}
                className="absolute animate-fade-in"
                style={{
                  left: `${20 + (i * 12) % 60}%`,
                  top: `${15 + (i * 17) % 55}%`,
                }}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md transition-all ${
                    selectedKiosk?.id === k.id
                      ? "bg-blue-700 text-white scale-125"
                      : "bg-white text-blue-700 border-2 border-blue-500"
                  }`}
                >
                  💧
                </div>
              </button>
            ))}
          </div>
          {selectedKiosk && (
            <div className="p-3 border-t border-blue-200 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                    {selectedKiosk.name}
                    {selectedKiosk.verified && (
                      <span className="text-blue-500 text-[10px]">✓ Verified</span>
                    )}
                  </div>
                  <div className="text-xs text-text-mid">{selectedKiosk.address}</div>
                </div>
                <span className="font-bold text-blue-700 text-sm">
                  KES {selectedKiosk.jugPrice}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      <div className="px-4 pb-6">
        <div className="text-xs text-text-mid mb-3">
          {filtered.length} water provider{filtered.length !== 1 ? "s" : ""} found
        </div>
        <div className="space-y-3">
          {filtered.map((kiosk) => (
            <div
              key={kiosk.id}
              className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm animate-fade-in"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                    {kiosk.name}
                    {kiosk.verified && (
                      <span className="bg-blue-50 text-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-mid mt-0.5">
                    📍 {kiosk.address}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700 text-base">
                    KES {kiosk.jugPrice}
                  </div>
                  <div className="text-[10px] text-text-light">per 20L jug</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3 text-xs">
                <span className="text-text-mid">📏 {kiosk.distance}</span>
                <span className="text-text-mid">🕐 {kiosk.hours}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                {renderStars(kiosk.rating)}
                <span className="text-text-light text-[11px]">
                  {kiosk.reviews} reviews
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => (window.location.href = `/?kiosk=${kiosk.id}`)}
                >
                  Order from here
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${kiosk.phone}`)}
                >
                  📞 Call
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for providers */}
      <div className="mx-4 mb-6 bg-blue-900 rounded-2xl p-5 text-center">
        <div className="text-2xl mb-2">🏪</div>
        <h3 className="font-bold text-white text-lg mb-1">
          Own a water kiosk?
        </h3>
        <p className="text-blue-200 text-sm mb-4">
          Join MiMaji and reach thousands of customers in Nairobi
        </p>
        <Button
          variant="outline"
          className="!border-white !text-white hover:!bg-white/10"
          onClick={() => (window.location.href = "/join/provider")}
        >
          Register your kiosk →
        </Button>
      </div>

      <Footer />
    </div>
  );
}
