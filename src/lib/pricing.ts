// Volume-based pricing tiers
const PRICE_TIERS: { minQty: number; pricePerJug: number }[] = [
  { minQty: 9, pricePerJug: 360 },
  { minQty: 8, pricePerJug: 365 },
  { minQty: 7, pricePerJug: 370 },
  { minQty: 6, pricePerJug: 375 },
  { minQty: 5, pricePerJug: 380 },
  { minQty: 4, pricePerJug: 390 },
  { minQty: 3, pricePerJug: 400 },
  { minQty: 2, pricePerJug: 410 },
  { minQty: 1, pricePerJug: 420 },
];

export function getPricePerJug(quantity: number): number {
  for (const tier of PRICE_TIERS) {
    if (quantity >= tier.minQty) return tier.pricePerJug;
  }
  return 420;
}

export function calculateTotal(quantity: number): {
  pricePerJug: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  savings: number;
} {
  const pricePerJug = getPricePerJug(quantity);
  const subtotal = quantity * pricePerJug;
  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;
  const savings = quantity * 420 - subtotal;
  return { pricePerJug, subtotal, deliveryFee, total, savings };
}

export function getPricingTable(): { qty: string; price: number }[] {
  return [
    { qty: "1", price: 420 },
    { qty: "2", price: 410 },
    { qty: "3", price: 400 },
    { qty: "4", price: 390 },
    { qty: "5", price: 380 },
    { qty: "6", price: 375 },
    { qty: "7", price: 370 },
    { qty: "8", price: 365 },
    { qty: "9+", price: 360 },
  ];
}
