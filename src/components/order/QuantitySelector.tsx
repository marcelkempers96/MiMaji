"use client";

import { useState, useEffect } from "react";
import { getPricePerJug } from "@/lib/pricing";

interface QuantitySelectorProps {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 10,
}: QuantitySelectorProps) {
  const [animating, setAnimating] = useState(false);
  const pricePerJug = getPricePerJug(value);

  useEffect(() => {
    if (animating) {
      const t = setTimeout(() => setAnimating(false), 200);
      return () => clearTimeout(t);
    }
  }, [animating]);

  const handleChange = (delta: number) => {
    const newVal = Math.min(max, Math.max(min, value + delta));
    if (newVal !== value) {
      onChange(newVal);
      setAnimating(true);
    }
  };

  return (
    <div>
      <label className="block text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-2.5">
        How many jugs?
      </label>
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleChange(-1)}
          disabled={value <= min}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white transition-all btn-press ${
            value <= min
              ? "bg-blue-200 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-900"
          }`}
        >
          −
        </button>
        <span
          className={`text-[32px] font-bold text-blue-900 min-w-[40px] text-center ${
            animating ? "animate-bounce-number" : ""
          }`}
        >
          {value}
        </span>
        <button
          onClick={() => handleChange(1)}
          disabled={value >= max}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold text-white transition-all btn-press ${
            value >= max
              ? "bg-blue-200 cursor-not-allowed"
              : "bg-blue-700 hover:bg-blue-900"
          }`}
        >
          +
        </button>
        <div className="text-right">
          <div className="text-sm font-bold text-blue-700">KES {pricePerJug}</div>
          <div className="text-text-light text-[10px]">per jug · 20L</div>
        </div>
      </div>
    </div>
  );
}
