"use client";

import { StaticImageData } from "next/image";

export interface ProductCardProduct {
  id: string;
  name: string;
  size: string;
  priceNew: number;
  priceRefill: number;
  image: StaticImageData;
  category: "hard" | "soft";
}

interface ProductCardProps {
  product: ProductCardProduct;
  selected?: boolean;
  onSelect?: () => void;
  bottleType?: "new" | "refill";
}

export default function ProductCard({
  product,
  selected = false,
  onSelect,
  bottleType = "refill",
}: ProductCardProps) {
  const price = bottleType === "new" ? product.priceNew : product.priceRefill;

  return (
    <div
      className={`flex items-center gap-4 bg-white rounded-[12px] p-4 shadow-card transition-all ${
        selected ? "border-2 border-primary" : "border-2 border-transparent"
      }`}
    >
      {/* Product image */}
      <div className="flex items-center justify-center w-16 h-20 rounded-lg bg-primary-light shrink-0 overflow-hidden p-1">
        <img src={product.image.src} alt={`${product.name} ${product.size}`} className="object-contain w-full h-full" />
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-text-primary truncate">
          {product.name}
        </p>
        <p className="text-[13px] text-text-secondary">
          {product.size} — {product.category === "hard" ? "Hard Jug" : "Soft Bottle"} — {bottleType === "new" ? "New" : "Refill"}
        </p>
        <p className="text-[16px] font-bold text-text-primary mt-1">
          KES {price.toLocaleString()}
        </p>
      </div>

      {/* Select button */}
      <button
        onClick={onSelect}
        className={`rounded-full px-4 py-1 text-[13px] font-semibold transition-colors shrink-0 ${
          selected
            ? "bg-primary text-white"
            : "border border-primary text-primary bg-transparent"
        }`}
      >
        {selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}
