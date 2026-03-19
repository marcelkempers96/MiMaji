"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Minus, Plus, Tag } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

// Discount tiers: the more bottles, the cheaper per unit
const DISCOUNT_TIERS = [
  { minQty: 1, maxQty: 2, discount: 0, label: "Standard price" },
  { minQty: 3, maxQty: 5, discount: 5, label: "5% off" },
  { minQty: 6, maxQty: 9, discount: 10, label: "10% off" },
  { minQty: 10, maxQty: Infinity, discount: 15, label: "15% off" },
];

function getDiscount(qty: number) {
  const tier = DISCOUNT_TIERS.find((t) => qty >= t.minQty && qty <= t.maxQty);
  return tier || DISCOUNT_TIERS[0];
}

function getDiscountedPrice(basePrice: number, qty: number) {
  const tier = getDiscount(qty);
  return Math.round(basePrice * (1 - tier.discount / 100));
}

export default function BuyWaterPage() {
  const router = useRouter();
  const { addItem, removeItem, items, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState<"hard" | "soft">("hard");
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((item) => { initial[item.id] = item.quantity; });
    return initial;
  });

  const filteredProducts = products.filter((p) => p.category === activeCategory);

  const setProductQuantity = (productId: string, qty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (qty <= 0) {
      setQuantities((prev) => { const next = { ...prev }; delete next[productId]; return next; });
      removeItem(productId);
    } else {
      setQuantities((prev) => ({ ...prev, [productId]: qty }));
      const existingItem = items.find((i) => i.id === productId);
      const discountedPrice = getDiscountedPrice(product.price, qty);
      if (existingItem) {
        updateQuantity(productId, qty);
      } else {
        addItem({ id: product.id, name: `${product.name} ${product.size}`, price: discountedPrice, quantity: qty });
      }
    }
  };

  const selectedCount = Object.values(quantities).reduce((sum, q) => sum + q, 0);

  const handleContinue = () => {
    // Sync discounted prices before going to cart
    Object.entries(quantities).forEach(([productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const discountedPrice = getDiscountedPrice(product.price, qty);
        const existingItem = items.find((i) => i.id === productId);
        if (!existingItem) {
          addItem({ id: product.id, name: `${product.name} ${product.size}`, price: discountedPrice, quantity: qty });
        }
      }
    });
    router.push("/cart");
  };

  return (
    <div className="bg-background min-h-screen pb-36">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Buy Water" />
        <div className="max-w-md mx-auto">
          <BuyContent
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            quantities={quantities}
            setProductQuantity={setProductQuantity}
          />
          {/* Sticky Bottom */}
          <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
            <Button variant="primary" fullWidth disabled={selectedCount === 0} onClick={handleContinue}>
              Continue
              {selectedCount > 0 && (
                <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {selectedCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-5xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">Order Water</h1>
          <p className="text-text-secondary mb-6">Select your preferred water type, size, and quantity</p>

          <BuyContent
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            quantities={quantities}
            setProductQuantity={setProductQuantity}
            desktop
          />

          <div className="max-w-md mx-auto mt-8">
            <Button variant="primary" fullWidth disabled={selectedCount === 0} onClick={handleContinue}>
              Continue to Cart
              {selectedCount > 0 && (
                <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {selectedCount}
                </span>
              )}
            </Button>
          </div>
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function BuyContent({ activeCategory, setActiveCategory, filteredProducts, quantities, setProductQuantity, desktop }: {
  activeCategory: "hard" | "soft";
  setActiveCategory: (c: "hard" | "soft") => void;
  filteredProducts: typeof products;
  quantities: Record<string, number>;
  setProductQuantity: (id: string, qty: number) => void;
  desktop?: boolean;
}) {
  return (
    <>
      {/* Discount Banner */}
      <div className="mx-4 mt-2 mb-4 bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-3 flex items-center gap-3">
        <Tag size={20} className="text-[#2ECC71] flex-shrink-0" />
        <div>
          <p className="font-bold text-sm text-text-primary">Bulk Discount</p>
          <p className="text-text-secondary text-xs">Order more, pay less! Up to 15% off on 10+ bottles</p>
        </div>
      </div>

      {/* Discount Tiers */}
      <div className="mx-4 mb-4 flex gap-2 overflow-x-auto">
        {DISCOUNT_TIERS.map((tier, i) => (
          <div key={i} className="bg-surface shadow-card rounded-lg px-3 py-2 flex-shrink-0 text-center min-w-[80px]">
            <p className="text-xs font-bold text-primary">{tier.discount === 0 ? "—" : `${tier.discount}% off`}</p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {tier.maxQty === Infinity ? `${tier.minQty}+` : `${tier.minQty}-${tier.maxQty}`} bottles
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 mt-2 mb-5">
        <button
          onClick={() => setActiveCategory("hard")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "hard" ? "bg-primary text-white" : "bg-white text-text-secondary"
          }`}
        >
          Hard Bottle
        </button>
        <button
          onClick={() => setActiveCategory("soft")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "soft" ? "bg-primary text-white" : "bg-white text-text-secondary"
          }`}
        >
          Soft Bottle
        </button>
      </div>

      {/* Product List */}
      <div className={desktop ? "grid grid-cols-2 gap-4 px-4" : "flex flex-col gap-3 px-4"}>
        {filteredProducts.map((product) => {
          const qty = quantities[product.id] || 0;
          const discount = getDiscount(qty);
          const discountedPrice = getDiscountedPrice(product.price, qty || 1);
          const hasDiscount = qty >= 3;

          return (
            <div
              key={product.id}
              className={`bg-surface shadow-card rounded-xl p-4 transition-all ${
                qty > 0 ? "border-2 border-primary" : "border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Droplets size={28} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary">{product.name}</p>
                  <p className="text-text-secondary text-xs">{product.size} — {product.category === "hard" ? "Hard Bottle" : "Soft Bottle"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="text-text-secondary text-xs line-through">KES {product.price}</span>
                        <span className="font-bold text-sm text-[#2ECC71]">KES {discountedPrice}</span>
                        <span className="bg-[#E8F5E9] text-[#2ECC71] text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                          {discount.label}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-sm text-text-primary">KES {product.price}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-text-secondary">Quantity</span>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setProductQuantity(product.id, qty - 1)}
                    disabled={qty === 0}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      qty === 0 ? "bg-gray-50 text-gray-300" : "bg-primary-light text-primary"
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-text-primary">{qty}</span>
                  <button
                    onClick={() => setProductQuantity(product.id, qty + 1)}
                    className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total for this product */}
              {qty > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-text-secondary">Subtotal ({qty} x KES {discountedPrice})</span>
                  <span className="font-bold text-sm text-text-primary">KES {(discountedPrice * qty).toLocaleString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Droplets size={28} className="text-primary" />
          <span className="text-2xl font-bold text-primary">MiMaji</span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-primary font-medium text-sm">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
          <Link href="/contact" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Contact</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
