"use client";

import { useState } from "react";
import { MapPin, Star, Phone, Clock, Droplets, Search, Filter } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const vendors = [
  { id: "v1", name: "AquaPure Kilimani", area: "Kilimani, Nairobi", distance: "0.8 km", rating: 4.8, reviews: 156, phone: "+254700111222", hours: "6AM - 9PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"], priceRange: "KES 150 - 500" },
  { id: "v2", name: "WaterPoint Westlands", area: "Westlands, Nairobi", distance: "1.2 km", rating: 4.6, reviews: 89, phone: "+254700222333", hours: "7AM - 8PM", products: ["20L Hard", "20L Soft", "10L Soft"], priceRange: "KES 280 - 500" },
  { id: "v3", name: "CleanWater Hub", area: "Lavington, Nairobi", distance: "2.1 km", rating: 4.9, reviews: 234, phone: "+254700333444", hours: "6AM - 10PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"], priceRange: "KES 150 - 450" },
  { id: "v4", name: "Maji Fresh Karen", area: "Karen, Nairobi", distance: "5.3 km", rating: 4.7, reviews: 67, phone: "+254700444555", hours: "7AM - 9PM", products: ["20L Hard", "20L Soft"], priceRange: "KES 400 - 500" },
  { id: "v5", name: "PureDrops CBD", area: "CBD, Nairobi", distance: "3.8 km", rating: 4.5, reviews: 112, phone: "+254700555666", hours: "6AM - 8PM", products: ["20L Soft", "10L Soft", "5L Soft"], priceRange: "KES 150 - 450" },
];

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = vendors.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Water Vendors" showBack={true} />

      {/* Mobile */}
      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <VendorContent vendors={filteredVendors} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Water Vendors Near You</h1>
          <p className="text-text-secondary mb-8">Find trusted water vendors in Nairobi</p>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <VendorContent vendors={filteredVendors} searchQuery={searchQuery} setSearchQuery={setSearchQuery} desktop />
            </div>
            <div>
              {/* Map Placeholder */}
              <div className="bg-primary-light rounded-2xl h-80 flex items-center justify-center sticky top-8">
                <div className="text-center">
                  <MapPin size={48} className="text-primary/40 mx-auto mb-2" />
                  <p className="text-primary/60 text-sm font-medium">Vendor Map</p>
                  <p className="text-primary/40 text-xs">Google Maps integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function VendorContent({ vendors: filteredVendors, searchQuery, setSearchQuery, desktop }: { vendors: typeof vendors; searchQuery: string; setSearchQuery: (q: string) => void; desktop?: boolean }) {
  return (
    <>
      {/* Map Placeholder - Mobile */}
      {!desktop && (
        <div className="h-40 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
          <div className="text-center">
            <MapPin size={36} className="text-primary/40 mx-auto mb-1" />
            <p className="text-primary/60 text-xs font-medium">Vendor Map</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center bg-white rounded-full shadow-card h-11 px-4 gap-3 mb-4">
        <Search size={18} className="text-text-secondary shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors or areas..."
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
        />
      </div>

      <p className="text-text-secondary text-xs mb-3">{filteredVendors.length} vendors found</p>

      {/* Vendor List */}
      <div className="flex flex-col gap-3">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-surface shadow-card rounded-xl p-4 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text-primary">{vendor.name}</p>
                <p className="text-text-secondary text-xs flex items-center gap-1">
                  <MapPin size={12} /> {vendor.area} — {vendor.distance}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-rating fill-rating" />
                    <span className="text-xs font-semibold text-text-primary">{vendor.rating}</span>
                  </div>
                  <span className="text-text-secondary text-xs">({vendor.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {vendor.products.map((p) => (
                <span key={p} className="bg-primary-light text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                  {p}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Clock size={12} /> {vendor.hours}</span>
              <span className="font-semibold text-text-primary">{vendor.priceRange}</span>
            </div>

            <div className="flex gap-2 mt-3">
              <a
                href={`tel:${vendor.phone}`}
                className="flex-1 bg-primary-light text-primary text-center py-2 rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
              >
                Call
              </a>
              <Link
                href="/buy"
                className="flex-1 bg-primary text-white text-center py-2 rounded-lg text-xs font-semibold hover:bg-[#1a5a9a] transition-colors"
              >
                Order
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Droplets size={28} className="text-primary" />
          <span className="text-2xl font-bold text-primary">MiMaji</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/vendors" className="text-primary font-medium text-sm">Vendors</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Impact</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
