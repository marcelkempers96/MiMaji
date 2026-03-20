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
  description: string;
}

export interface WaterBrand {
  id: string;
  name: string;
  available: boolean;
}

export const waterBrands: WaterBrand[] = [
  { id: "keringet", name: "Keringet", available: true },
  { id: "aquamist", name: "AquaMist", available: true },
  { id: "mayers", name: "Mayers", available: true },
];

// Common Nairobi areas for vendor coverage selection
export const NAIROBI_AREAS = [
  "CBD", "Westlands", "Kilimani", "Lavington", "Kileleshwa", "Hurlingham",
  "Karen", "Langata", "South C", "South B", "Nairobi West", "Upper Hill",
  "Parklands", "Ngara", "Pangani", "Eastleigh", "Kasarani", "Roysambu",
  "Ruaraka", "Kahawa", "Githurai", "Ruiru", "Thika Road", "Embakasi",
  "Donholm", "Umoja", "Buruburu", "Kayole", "Utawala", "Syokimau",
  "Athi River", "Kitengela", "Rongai", "Ngong", "Dagoretti", "Waithaka",
  "Kawangware", "Satellite", "Runda", "Muthaiga", "Gigiri", "Spring Valley",
  "Loresho", "Mountain View", "Zimmerman", "Mwiki", "Pipeline", "Imara Daima",
];

export const products: Product[] = [
  // 20L
  { id: "h20", name: "Hard Jug",  size: "20L", priceNew: 1500, priceRefill: 300, image: hard20L, category: "hard", description: "Durable reusable 20L hard jug — perfect for homes and offices. Built to last." },
  { id: "s20", name: "Soft Jug",  size: "20L", priceNew: 500,  priceRefill: 280, image: soft20L, category: "soft", description: "Lightweight 20L soft jug — easy to carry and store. Great value for daily hydration." },
  // 10L
  { id: "h10", name: "Hard Jug",  size: "10L", priceNew: 300,  priceRefill: 150, image: hard10L, category: "hard", description: "Compact 10L hard jug — ideal for smaller households. Tough and reusable." },
  { id: "s10", name: "Soft Jug",  size: "10L", priceNew: 200,  priceRefill: 140, image: soft10L, category: "soft", description: "Handy 10L soft jug — light, affordable, and easy to handle." },
  // 5L
  { id: "h5",  name: "Hard Bottle", size: "5L", priceNew: 150,  priceRefill: 100, image: soft5L,  category: "hard", description: "Sturdy 5L hard bottle — fits in your fridge. Perfect for on-the-go." },
  { id: "s5",  name: "Soft Bottle", size: "5L", priceNew: 120,  priceRefill: 80,  image: soft5L,  category: "soft", description: "Portable 5L soft bottle — the most affordable way to stay hydrated." },
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
