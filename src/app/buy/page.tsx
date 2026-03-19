"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, RefreshCw, PackagePlus } from "lucide-react";

import Link from "next/link";
import { logo1 } from "@/assets/images";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { products, Product } from "@/data/products";
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

type BottleType = "new" | "refill";

// Per-product selection state
interface ProductSelection {
  quantity: number;
  bottleType: BottleType;
}

function getPrice(product: Product, bottleType: BottleType): number {
  return bottleType === "new" ? product.priceNew : product.priceRefill;
}

function getCartItemId(productId: string, bottleType: BottleType): string {
  return `${productId}-${bottleType}`;
}

export default function BuyWaterPage() {
  const router = useRouter();
  const { addItem, removeItem, items, updateQuantity } = useCart();
  const [activeBottleType, setActiveBottleType] = useState<BottleType>("refill");
  const [activeCategory, setActiveCategory] = useState<"hard" | "soft">("soft");
  const [activeSize, setActiveSize] = useState<"20L" | "10L" | "5L">("20L");

  // Initialize selections from existing cart items
  const [selections, setSelections] = useState<Record<string, ProductSelection>>(() => {
    const initial: Record<string, ProductSelection> = {};
    items.forEach((item) => {
      // Parse cart item IDs like "h20-new" or "s10-refill"
      const match = item.id.match(/^(.+)-(new|refill)$/);
      if (match) {
        initial[match[1]] = { quantity: item.quantity, bottleType: match[2] as BottleType };
      }
    });
    return initial;
  });

  const filteredProducts = products.filter(
    (p) => p.category === activeCategory && p.size === activeSize
  );

  const setProductSelection = (productId: string, qty: number, bottleType: BottleType) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const oldSelection = selections[productId];
    const oldCartId = oldSelection ? getCartItemId(productId, oldSelection.bottleType) : null;
    const newCartId = getCartItemId(productId, bottleType);

    if (qty <= 0) {
      // Remove
      setSelections((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      if (oldCartId) removeItem(oldCartId);
      return;
    }

    // If bottle type changed, remove the old cart item
    if (oldCartId && oldCartId !== newCartId) {
      removeItem(oldCartId);
    }

    setSelections((prev) => ({ ...prev, [productId]: { quantity: qty, bottleType } }));

    const basePrice = getPrice(product, bottleType);
    const discountedPrice = getDiscountedPrice(basePrice, qty);
    const itemName = `${product.name} ${product.size} — ${bottleType === "new" ? "New" : "Refill"}`;

    const existingItem = items.find((i) => i.id === newCartId);
    if (existingItem) {
      updateQuantity(newCartId, qty);
    } else {
      addItem({ id: newCartId, name: itemName, price: discountedPrice, quantity: qty });
    }
  };

  const selectedCount = Object.values(selections).reduce((sum, s) => sum + s.quantity, 0);

  const handleContinue = () => {
    // Sync discounted prices before going to cart
    Object.entries(selections).forEach(([productId, sel]) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const basePrice = getPrice(product, sel.bottleType);
        const discountedPrice = getDiscountedPrice(basePrice, sel.quantity);
        const cartId = getCartItemId(productId, sel.bottleType);
        const existingItem = items.find((i) => i.id === cartId);
        if (!existingItem) {
          const itemName = `${product.name} ${product.size} — ${sel.bottleType === "new" ? "New" : "Refill"}`;
          addItem({ id: cartId, name: itemName, price: discountedPrice, quantity: sel.quantity });
        }
      }
    });
    router.push("/cart");
  };

  const sizes = ["20L", "10L", "5L"] as const;

  return (
    <div className="bg-background min-h-screen pb-36">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Buy Water" />
        <div className="max-w-md mx-auto">
          <BuyContent
            activeBottleType={activeBottleType}
            setActiveBottleType={setActiveBottleType}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeSize={activeSize}
            setActiveSize={setActiveSize}
            sizes={sizes}
            filteredProducts={filteredProducts}
            selections={selections}
            setProductSelection={setProductSelection}
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
          <p className="text-text-secondary mb-6">Select your preferred water type, size, and quantity. Choose new bottle or refill.</p>

          <BuyContent
            activeBottleType={activeBottleType}
            setActiveBottleType={setActiveBottleType}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            activeSize={activeSize}
            setActiveSize={setActiveSize}
            sizes={sizes}
            filteredProducts={filteredProducts}
            selections={selections}
            setProductSelection={setProductSelection}
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

function BuyContent({
  activeBottleType,
  setActiveBottleType,
  activeCategory,
  setActiveCategory,
  activeSize,
  setActiveSize,
  sizes,
  filteredProducts,
  selections,
  setProductSelection,
  desktop,
}: {
  activeBottleType: BottleType;
  setActiveBottleType: (bt: BottleType) => void;
  activeCategory: "hard" | "soft";
  setActiveCategory: (c: "hard" | "soft") => void;
  activeSize: "20L" | "10L" | "5L";
  setActiveSize: (s: "20L" | "10L" | "5L") => void;
  sizes: readonly ("20L" | "10L" | "5L")[];
  filteredProducts: Product[];
  selections: Record<string, ProductSelection>;
  setProductSelection: (id: string, qty: number, bottleType: BottleType) => void;
  desktop?: boolean;
}) {
  return (
    <>
      {/* Refill / New Bottle Tab */}
      <div className="flex gap-2 px-4 mt-2 mb-3">
        <button
          onClick={() => setActiveBottleType("refill")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
            activeBottleType === "refill"
              ? "bg-[#E8F5E9] text-[#2ECC71] border-2 border-[#2ECC71]"
              : "bg-white text-text-secondary border-2 border-transparent shadow-card"
          }`}
        >
          <RefreshCw size={16} />
          Refill
        </button>
        <button
          onClick={() => setActiveBottleType("new")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
            activeBottleType === "new"
              ? "bg-primary-light text-primary border-2 border-primary"
              : "bg-white text-text-secondary border-2 border-transparent shadow-card"
          }`}
        >
          <PackagePlus size={16} />
          New Bottle / Jug
        </button>
      </div>

      {/* Hard / Soft Tabs */}
      <div className="flex gap-2 px-4 mb-3">
        <button
          onClick={() => setActiveCategory("soft")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "soft" ? "bg-primary text-white" : "bg-white text-text-secondary"
          }`}
        >
          Soft Bottle
        </button>
        <button
          onClick={() => setActiveCategory("hard")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "hard" ? "bg-primary text-white" : "bg-white text-text-secondary"
          }`}
        >
          Hard Jug
        </button>
      </div>

      {/* Size Tabs */}
      <div className="flex gap-2 px-4 mb-5">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setActiveSize(size)}
            className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-colors ${
              activeSize === size ? "bg-[#1a5a9a] text-white" : "bg-gray-100 text-text-secondary"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className={desktop ? "grid grid-cols-2 gap-4 px-4" : "flex flex-col gap-3 px-4"}>
        {filteredProducts.map((product) => {
          const sel = selections[product.id];
          const qty = sel?.quantity || 0;
          const bottleType: BottleType = sel?.bottleType || activeBottleType;
          const basePrice = getPrice(product, activeBottleType);
          const discount = getDiscount(qty);
          const discountedPrice = getDiscountedPrice(basePrice, qty || 1);
          const hasDiscount = qty >= 3;

          return (
            <div
              key={product.id}
              className={`bg-surface shadow-card rounded-xl p-4 transition-all ${
                qty > 0 ? "border-2 border-primary" : "border-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-18 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                  <img src={product.image.src} alt={`${product.name} ${product.size}`} className="object-contain w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-text-primary">{product.name}</p>
                  <p className="text-text-secondary text-xs">
                    {product.size} — {product.category === "hard" ? "Hard" : "Soft"} — {activeBottleType === "new" ? "New" : "Refill"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="text-text-secondary text-xs line-through">KES {basePrice}</span>
                        <span className="font-bold text-sm text-[#2ECC71]">KES {discountedPrice}</span>
                        <span className="bg-[#E8F5E9] text-[#2ECC71] text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                          {discount.label}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-sm text-text-primary">KES {basePrice}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-text-secondary">Quantity</span>
                <div className="flex items-center gap-0">
                  <button
                    onClick={() => setProductSelection(product.id, qty - 1, activeBottleType)}
                    disabled={qty === 0}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      qty === 0 ? "bg-gray-50 text-gray-300" : "bg-primary-light text-primary"
                    }`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-text-primary">{qty}</span>
                  <button
                    onClick={() => setProductSelection(product.id, qty + 1, activeBottleType)}
                    className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Total for this product */}
              {qty > 0 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-text-secondary">
                    Subtotal ({qty} x KES {discountedPrice})
                  </span>
                  <span className="font-bold text-sm text-text-primary">
                    KES {(discountedPrice * qty).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-text-secondary text-sm">
            No products available for this combination. Try a different size or type.
          </div>
        )}
      </div>

      {/* Pricing info */}
      <div className="px-4 mt-4">
        <p className="text-text-secondary text-xs">
          All prices include delivery. <span className="font-semibold">New</span> = brand new bottle/jug. <span className="font-semibold">Refill</span> = bring your existing bottle for refilling at a lower price.
        </p>
      </div>
    </>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
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
