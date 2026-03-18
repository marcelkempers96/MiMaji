"use client";

import { useState, useEffect } from "react";
import { MapPin, User, Star, Phone, Share2 } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";

export default function TrackPage() {
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Track Order" />

      <div className="px-4 pt-4">
        {/* Status */}
        <p className="text-text-secondary text-sm">
          Tracking your water delivery in <span className="font-bold">real-time</span>
        </p>

        {/* ETA */}
        <p className="text-xl font-bold text-text-primary mt-2">
          Arriving in {minutes} min
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 mt-1">
          <MapPin size={16} className="text-primary" />
          <span className="text-text-secondary text-sm">Kilimani, Nairobi</span>
        </div>

        {/* Map Placeholder */}
        <div className="h-48 bg-primary-light rounded-2xl mt-4 flex flex-col items-center justify-center">
          <MapPin size={32} className="text-primary" />
          <div className="border-t-2 border-dashed border-primary w-1/2 mx-auto mt-2" />
        </div>

        {/* Driver Card */}
        <div className="bg-surface shadow-card rounded-xl p-4 mt-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-primary" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-bold text-text-primary">Driver: Moses</p>
              <p className="text-text-secondary text-sm">KCX 246F - Toyota</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-rating"
                    fill="currentColor"
                  />
                ))}
                <span className="text-text-secondary text-xs ml-1">12:15pm</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" className="flex-1">
              <Phone size={16} />
              Contact
            </Button>
            <button className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <Share2 size={16} className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
