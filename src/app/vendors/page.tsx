"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useRef } from "react";
import { MapPin, Star, Clock, Droplets, Search } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

const vendors = [
  { id: "v1", name: "AquaPure Kilimani", area: "Kilimani, Nairobi", distance: "0.8 km", rating: 4.8, reviews: 156, hours: "6AM - 9PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"], lat: -1.2921, lng: 36.7877 },
  { id: "v2", name: "WaterPoint Westlands", area: "Westlands, Nairobi", distance: "1.2 km", rating: 4.6, reviews: 89, hours: "7AM - 8PM", products: ["20L Hard", "20L Soft", "10L Soft"], lat: -1.2673, lng: 36.8110 },
  { id: "v3", name: "CleanWater Hub", area: "Lavington, Nairobi", distance: "2.1 km", rating: 4.9, reviews: 234, hours: "6AM - 10PM", products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"], lat: -1.2786, lng: 36.7718 },
  { id: "v4", name: "Maji Fresh Karen", area: "Karen, Nairobi", distance: "5.3 km", rating: 4.7, reviews: 67, hours: "7AM - 9PM", products: ["20L Hard", "20L Soft"], lat: -1.3226, lng: 36.7126 },
  { id: "v5", name: "PureDrops CBD", area: "CBD, Nairobi", distance: "3.8 km", rating: 4.5, reviews: 112, hours: "6AM - 8PM", products: ["20L Soft", "10L Soft", "5L Soft"], lat: -1.2864, lng: 36.8172 },
];

function VendorMap({ mapHeight }: { mapHeight: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    const tryInitMap = () => {
      if (window.google?.maps && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: -1.2864, lng: 36.8000 },
          zoom: 12,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
        });

        vendors.forEach((v) => {
          const marker = new window.google.maps.Marker({
            position: { lat: v.lat, lng: v.lng },
            map,
            title: v.name,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="padding:4px"><strong>${v.name}</strong><br/><span style="font-size:12px;color:#666">${v.area}</span></div>`,
          });

          marker.addListener("click", () => { infoWindow.open(map, marker); });
        });

        setMapLoaded(true);
        return;
      }

      attempts++;
      if (attempts < maxAttempts) { setTimeout(tryInitMap, 500); }
    };

    tryInitMap();
  }, []);

  return (
    <div className={`rounded-2xl overflow-hidden ${mapHeight}`} ref={mapRef}>
      {!mapLoaded && (
        <div className={`bg-primary-light ${mapHeight} flex items-center justify-center`}>
          <div className="text-center">
            <MapPin size={36} className="text-primary/40 mx-auto mb-1" />
            <p className="text-primary/60 text-xs font-medium">Loading Map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = vendors.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Water Vendors" showBack={true} />

      <div className="max-w-md mx-auto px-4 pt-4 md:hidden">
        <VendorContent vendors={filteredVendors} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Water Vendors Near You</h1>
          <p className="text-text-secondary mb-8">Find trusted water vendors in Nairobi</p>
          <div className="mb-8"><VendorMap mapHeight="h-[500px]" /></div>
          <div className="max-w-4xl mx-auto">
            <VendorContent vendors={filteredVendors} searchQuery={searchQuery} setSearchQuery={setSearchQuery} desktop />
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
      {!desktop && <div className="mb-4"><VendorMap mapHeight="h-64" /></div>}

      <div className="flex items-center bg-white rounded-full shadow-card h-11 px-4 gap-3 mb-4">
        <Search size={18} className="text-text-secondary shrink-0" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search vendors or areas..." className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary" />
      </div>

      <p className="text-text-secondary text-xs mb-3">{filteredVendors.length} vendors found</p>

      <div className="flex flex-col gap-3">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-surface shadow-card rounded-xl p-4 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text-primary">{vendor.name}</p>
                <p className="text-text-secondary text-xs flex items-center gap-1"><MapPin size={12} /> {vendor.area} \u2014 {vendor.distance}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5"><Star size={12} className="text-rating fill-rating" /><span className="text-xs font-semibold text-text-primary">{vendor.rating}</span></div>
                  <span className="text-text-secondary text-xs">({vendor.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
              {vendor.products.map((p) => (
                <span key={p} className="bg-primary-light text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">{p}</span>
              ))}
            </div>

            <div className="flex items-center text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Clock size={12} /> {vendor.hours}</span>
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
        <Link href="/" className="flex items-center"><img src={logo1.src} alt="MiMaji" className="h-8 w-auto" /></Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/vendors" className="text-primary font-medium text-sm">Vendors</Link>
          <Link href="/impact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Impact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

