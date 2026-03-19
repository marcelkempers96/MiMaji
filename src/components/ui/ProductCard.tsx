"use client";

import Image from "next/image";

export interface ProductCardProduct {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  category: "hard" | "soft";
}

interface ProductCardProps {
  product: ProductCardProduct;
  selected?: boolean;
  onSelect?: () => void;
}

export default function ProductCard({
  product,
  selected = false,
  onSelect,
}: ProductCardProps) {
  return (
    <div
      className={`flex items-center gap-4 bg-white rounded-[12px] p-4 shadow-card transition-all ${
        selected ? "border-2 border-primary" : "border-2 border-transparent"
      }`}
    >
      {/* Product image */}
      <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary-light shrink-0 overflow-hidden">
        <Image src={product.image} alt={`${product.name} ${product.size}`} width={64} height={64} className="object-contain" />
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-text-primary truncate">
          {product.name}
        </p>
        <p className="text-[13px] text-text-secondary">
          {product.size} — {product.category === "hard" ? "Hard Jug" : "Soft Bottle"}
        </p>
        <p className="text-[16px] font-bold text-text-primary mt-1">
          KES {product.price.toLocaleString()}
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
