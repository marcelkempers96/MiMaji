import { StaticImageData } from "next/image";
import { hard20L, hard10L, soft20L, soft10L, soft5L } from "@/assets/images";

export interface Product {
  id: string;
  name: string;
  size: string;
  priceNew: number;
  priceRefill: number;
  image: StaticImageData;
  category: "hard" | "soft";
}

export const products: Product[] = [
  // 20L
  { id: "h20", name: "Hard Jug",  size: "20L", priceNew: 1500, priceRefill: 300, image: hard20L, category: "hard" },
  { id: "s20", name: "Soft Jug",  size: "20L", priceNew: 500,  priceRefill: 280, image: soft20L, category: "soft" },
  // 10L
  { id: "h10", name: "Hard Jug",  size: "10L", priceNew: 300,  priceRefill: 150, image: hard10L, category: "hard" },
  { id: "s10", name: "Soft Jug",  size: "10L", priceNew: 200,  priceRefill: 140, image: soft10L, category: "soft" },
  // 5L
  { id: "h5",  name: "Hard Bottle", size: "5L", priceNew: 150,  priceRefill: 100, image: soft5L,  category: "hard" },
  { id: "s5",  name: "Soft Bottle", size: "5L", priceNew: 120,  priceRefill: 80,  image: soft5L,  category: "soft" },
];

/** Get product image from a cart item ID (e.g. "h20-new") or item name (e.g. "Hard Jug 20L — New") */
export function getProductImage(cartIdOrName: string): StaticImageData | null {
  // Try matching by cart ID prefix (e.g. "h20-new" → "h20")
  const idMatch = cartIdOrName.match(/^([hs]\d+)/);
  if (idMatch) {
    const product = products.find((p) => p.id === idMatch[1]);
    if (product) return product.image;
  }
  // Try matching by name keywords
  const lower = cartIdOrName.toLowerCase();
  for (const p of products) {
    if (lower.includes(p.size.toLowerCase()) && lower.includes(p.category)) {
      return p.image;
    }
  }
  // Match by size alone as last resort
  for (const p of products) {
    if (lower.includes(p.size.toLowerCase())) {
      return p.image;
    }
  }
  return null;
}
