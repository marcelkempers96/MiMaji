"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, RefreshCw, PackagePlus, ShoppingCart, Lock } from "lucide-react";

import Link from "next/link";
import { logo1 } from "@/assets/images";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { products, Product, waterBrands } from "@/data/products";
import { useCart } from "@/context/CartContext";
import DesktopFooter from "@/components/layout/DesktopFooter";

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

// Per-product, per-bottleType selection state
interface ProductSelection {
  quantity: number;
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
  const [activeCategory, setActiveCategory] = useState<"hard" | "soft">("soft");
  const [activeSize, setActiveSize] = useState<"20L" | "10L" | "5L">("20L");

  // Selections keyed by cartItemId (e.g. "h20-refill", "s10-new")
  const [selections, setSelections] = useState<Record<string, ProductSelection>>(() => {
    const initial: Record<string, ProductSelection> = {};
    items.forEach((item) => {
      const match = item.id.match(/^(.+)-(new|refill)$/);
      if (match) {
        initial[item.id] = { quantity: item.quantity };
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

    const cartId = getCartItemId(productId, bottleType);

    if (qty <= 0) {
      setSelections((prev) => {
        const next = { ...prev };
        delete next[cartId];
        return next;
      });
      removeItem(cartId);
      return;
    }

    setSelections((prev) => ({ ...prev, [cartId]: { quantity: qty } }));

    const basePrice = getPrice(product, bottleType);
    const discountedPrice = getDiscountedPrice(basePrice, qty);
    const itemName = `${product.name} ${product.size} — ${bottleType === "new" ? "New" : "Refill"}`;

    const existingItem = items.find((i) => i.id === cartId);
    if (existingItem) {
      updateQuantity(cartId, qty);
    } else {
      addItem({ id: cartId, name: itemName, price: discountedPrice, quantity: qty });
    }
  };

  const selectedCount = Object.values(selections).reduce((sum, s) => sum + s.quantity, 0);

  const handleContinue = () => {
    // Sync discounted prices before going to cart
    Object.entries(selections).forEach(([cartId, sel]) => {
      const match = cartId.match(/^(.+)-(new|refill)$/);
      if (!match) return;
      const product = products.find((p) => p.id === match[1]);
      const bottleType = match[2] as BottleType;
      if (product) {
        const basePrice = getPrice(product, bottleType);
        const discountedPrice = getDiscountedPrice(basePrice, sel.quantity);
        const existingItem = items.find((i) => i.id === cartId);
        if (!existingItem) {
          const itemName = `${product.name} ${product.size} — ${bottleType === "new" ? "New" : "Refill"}`;
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
          <p className="text-text-secondary mb-6">Select your preferred water type, size, and quantity. You can mix refills and new bottles in the same order.</p>

          <BuyContent
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
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  return (
    <>
      {/* Water Type Selection — prominent cards */}
      <div className="px-4 mt-2 mb-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Water Type</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveCategory("soft")}
            className={`rounded-xl p-3 text-left transition-all border-2 ${
              activeCategory === "soft"
                ? "border-primary bg-primary-light"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className={`text-base font-bold block ${activeCategory === "soft" ? "text-primary" : "text-text-primary"}`}>
              Soft Bottle
            </span>
            <span className="text-[11px] text-text-secondary">Lightweight, flexible plastic</span>
          </button>
          <button
            onClick={() => setActiveCategory("hard")}
            className={`rounded-xl p-3 text-left transition-all border-2 ${
              activeCategory === "hard"
                ? "border-primary bg-primary-light"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className={`text-base font-bold block ${activeCategory === "hard" ? "text-primary" : "text-text-primary"}`}>
              Hard Jug
            </span>
            <span className="text-[11px] text-text-secondary">Sturdy, durable reusable jug</span>
          </button>
        </div>
      </div>

      {/* Size Selection — prominent pills with volume */}
      <div className="px-4 mb-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Size</p>
        <div className="flex gap-2">
          {sizes.map((size) => {
            const litres = parseInt(size);
            return (
              <button
                key={size}
                onClick={() => setActiveSize(size)}
                className={`flex-1 rounded-xl py-3 text-center transition-all border-2 ${
                  activeSize === size
                    ? "border-[#1a5a9a] bg-[#1a5a9a] text-white"
                    : "border-gray-200 bg-white text-text-primary"
                }`}
              >
                <span className="text-lg font-extrabold block">{litres}L</span>
                <span className={`text-[10px] ${activeSize === size ? "text-white/80" : "text-text-secondary"}`}>
                  {litres === 20 ? "Family" : litres === 10 ? "Medium" : "Personal"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Preference */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setShowBrandPicker(!showBrandPicker)}
          className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-200 text-sm"
        >
          <span className="text-text-secondary">Brand Preference</span>
          <span className="text-primary font-semibold text-xs">MiMaji (Default)</span>
        </button>
        {showBrandPicker && (
          <div className="bg-white rounded-xl border border-gray-200 mt-2 p-3 space-y-2">
            {waterBrands.map((brand) => (
              <div key={brand.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${brand.available ? "bg-primary-light" : "bg-gray-50"}`}>
                <span className={`text-sm font-medium ${brand.available ? "text-primary" : "text-text-secondary"}`}>{brand.name}</span>
                {brand.available ? (
                  <span className="text-[10px] font-semibold text-white bg-primary rounded-full px-2 py-0.5">Selected</span>
                ) : (
                  <span className="text-[10px] font-semibold text-text-secondary bg-gray-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Lock size={8} /> Coming Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product List */}
      <div className={desktop ? "grid grid-cols-2 gap-4 px-4" : "flex flex-col gap-3 px-4"}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selections={selections}
            setProductSelection={setProductSelection}
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-text-secondary text-sm">
            No products available for this combination. Try a different size or type.
          </div>
        )}
      </div>

      {/* Pricing info */}
      <div className="px-4 mt-4">
        <p className="text-text-secondary text-xs">
          Delivery fee is separate (KES 100). <span className="font-semibold">New</span> = brand new bottle/jug. <span className="font-semibold">Refill</span> = exchange your existing bottle for a fresh one at a lower price. You can order both in the same cart.
        </p>
      </div>
    </>
  );
}

function ProductCard({
  product,
  selections,
  setProductSelection,
}: {
  product: Product;
  selections: Record<string, ProductSelection>;
  setProductSelection: (id: string, qty: number, bottleType: BottleType) => void;
}) {
  const refillCartId = getCartItemId(product.id, "refill");
  const newCartId = getCartItemId(product.id, "new");
  const refillQty = selections[refillCartId]?.quantity || 0;
  const newQty = selections[newCartId]?.quantity || 0;
  const hasAny = refillQty > 0 || newQty > 0;

  return (
    <div
      className={`bg-surface shadow-card rounded-xl p-4 transition-all ${
        hasAny ? "border-2 border-primary" : "border-2 border-transparent"
      }`}
    >
      {/* Product Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-20 h-24 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
          <img src={product.image.src} alt={`${product.name} ${product.size}`} className="object-contain w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-text-primary">{product.name} — {product.size}</p>
          <p className="text-text-secondary text-[11px] mt-0.5">
            {product.description}
          </p>
        </div>
      </div>

      {/* Refill Row */}
      <BottleTypeRow
        label="Refill"
        icon={<RefreshCw size={14} />}
        accentColor="text-[#2ECC71]"
        accentBg="bg-[#E8F5E9]"
        basePrice={product.priceRefill}
        qty={refillQty}
        onChangeQty={(q) => setProductSelection(product.id, q, "refill")}
      />

      {/* New Bottle Row */}
      <BottleTypeRow
        label="New Bottle"
        icon={<PackagePlus size={14} />}
        accentColor="text-primary"
        accentBg="bg-primary-light"
        basePrice={product.priceNew}
        qty={newQty}
        onChangeQty={(q) => setProductSelection(product.id, q, "new")}
      />
    </div>
  );
}

function BottleTypeRow({
  label,
  icon,
  accentColor,
  accentBg,
  basePrice,
  qty,
  onChangeQty,
}: {
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  basePrice: number;
  qty: number;
  onChangeQty: (q: number) => void;
}) {
  const discount = getDiscount(qty);
  const discountedPrice = getDiscountedPrice(basePrice, qty || 1);
  const hasDiscount = qty >= 3;

  return (
    <div className={`rounded-lg p-3 mb-2 last:mb-0 ${qty > 0 ? accentBg : "bg-gray-50"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className={qty > 0 ? accentColor : "text-text-secondary"}>{icon}</span>
          <p className={`text-xs font-bold ${qty > 0 ? "text-text-primary" : "text-text-secondary"}`}>{label}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Price */}
          <div className="text-right mr-2">
            {hasDiscount ? (
              <>
                <span className="text-text-secondary text-[10px] line-through mr-1">KES {basePrice}</span>
                <span className={`font-bold text-xs ${accentColor}`}>KES {discountedPrice}</span>
              </>
            ) : (
              <span className="font-bold text-xs text-text-primary">KES {basePrice}</span>
            )}
          </div>

          {/* Quantity Controls */}
          <button
            onClick={() => onChangeQty(qty - 1)}
            disabled={qty === 0}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
              qty === 0 ? "bg-gray-100 text-gray-300" : `${accentBg} ${accentColor}`
            }`}
          >
            <Minus size={14} />
          </button>
          <span className="w-7 text-center font-bold text-xs text-text-primary">{qty}</span>
          <button
            onClick={() => onChangeQty(qty + 1)}
            className="w-7 h-7 rounded-md bg-primary text-white flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      {qty > 0 && (
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-black/5">
          <span className="text-[10px] text-text-secondary">
            {qty} x KES {discountedPrice}
            {hasDiscount && (
              <span className={`${accentColor} font-semibold ml-1`}>({discount.label})</span>
            )}
          </span>
          <span className="font-bold text-xs text-text-primary">
            KES {(discountedPrice * qty).toLocaleString()}
          </span>
        </div>
      )}
    </div>
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

