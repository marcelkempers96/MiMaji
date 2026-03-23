import { StaticImageData } from "next/image";
import { hard20L, hard10L, soft20L, soft10L, soft5L } from "@/assets/images";

export interface Product {
  id: string;
  name: string;
  size: string;
  /** Size in litres (numeric) for sorting/display */
  litres: number;
  priceNew: number;
  /** 0 means refill not available (new only) */
  priceRefill: number;
  image: StaticImageData;
  category: "hard" | "soft";
  description: string;
  /** Price per litre for comparison display */
  pricePerLitre: number;
  /** "Best value" / "Most popular" etc */
  badge?: string;
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
  { id: "mt-kenya", name: "Mt Kenya", available: true },
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

// ── LOCAL PURIFIED WATER ──

export const products: Product[] = [
  // ── Soft Bottles ──
  { id: "s5",   name: "Soft Bottle",  size: "5L",    litres: 5,    priceNew: 80,   priceRefill: 0,   image: soft5L,  category: "soft", description: "Perfect for personal use, the fridge, or on the go. Light and easy to carry.", pricePerLitre: 16.0 },
  { id: "s10",  name: "Soft Bottle",  size: "10L",   litres: 10,   priceNew: 150,  priceRefill: 0,   image: soft10L, category: "soft", description: "Ideal for small families, kitchens, and daily cooking needs.", pricePerLitre: 15.0 },
  { id: "s189", name: "Soft Bottle",  size: "18.9L", litres: 18.9, priceNew: 450,  priceRefill: 240, image: soft20L, category: "soft", description: "Best value per litre. The smart choice for homes that go through water fast.", pricePerLitre: 12.7, badge: "Best Value" },
  { id: "s20",  name: "Soft Bottle",  size: "20L",   litres: 20,   priceNew: 500,  priceRefill: 280, image: soft20L, category: "soft", description: "The classic household size. Lasts the whole week with pure, clean water.", pricePerLitre: 14.0 },

  // ── Hard Bottles (dispenser-ready) ──
  { id: "h10",  name: "Hard Jug",     size: "10L",   litres: 10,   priceNew: 180,  priceRefill: 0,   image: hard10L, category: "hard", description: "Compact dispenser-ready jug. Durable, reusable, and easy to handle.", pricePerLitre: 18.0 },
  { id: "h189", name: "Hard Jug",     size: "18.9L", litres: 18.9, priceNew: 470,  priceRefill: 250, image: hard20L, category: "hard", description: "Best value for hard jugs. Fits all standard dispensers. Built to last.", pricePerLitre: 13.2, badge: "Best Value" },
  { id: "h20",  name: "Hard Jug",     size: "20L",   litres: 20,   priceNew: 500,  priceRefill: 290, image: hard20L, category: "hard", description: "Our flagship dispenser jug. The standard for homes and offices across Nairobi.", pricePerLitre: 14.5, badge: "Most Popular" },
];

/** Get product image from a cart item ID (e.g. "h20-new") or item name (e.g. "Hard Jug 20L — New") */
export function getProductImage(cartIdOrName: string): StaticImageData | null {
  // Try matching by cart ID prefix (e.g. "h20-new" → "h20")
  const idMatch = cartIdOrName.match(/^([sh]\d+)/);
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
