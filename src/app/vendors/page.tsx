"use client";

import { MapPin } from "lucide-react";
import TopBar from "@/components/layout/TopBar";

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      <TopBar title="Vendor Map" />
      <div className="flex flex-col items-center justify-center px-6 pt-20">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-4">
          <MapPin size={36} className="text-primary" />
        </div>
        <p className="text-lg font-bold text-text-primary">Vendor Map</p>
        <p className="text-text-secondary text-sm mt-2 text-center">
          Find water vendors near you in Nairobi. Map integration coming soon.
        </p>
        <div className="mt-8 w-full bg-surface shadow-card rounded-xl p-4">
          <h3 className="font-bold text-sm text-text-primary mb-3">Nearby Vendors</h3>
          {[
            { name: "AquaPure Kilimani", area: "Kilimani, Nairobi", distance: "0.8 km" },
            { name: "WaterPoint Westlands", area: "Westlands, Nairobi", distance: "1.2 km" },
            { name: "CleanWater Hub", area: "Lavington, Nairobi", distance: "2.1 km" },
          ].map((vendor) => (
            <div key={vendor.name} className="flex items-center gap-3 py-3 border-b border-[#F0F0F0] last:border-0">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-text-primary">{vendor.name}</p>
                <p className="text-text-secondary text-xs">{vendor.area}</p>
              </div>
              <span className="text-text-secondary text-xs font-medium">{vendor.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
