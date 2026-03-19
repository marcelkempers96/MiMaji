"use client";

import { logo1 } from "@/assets/images";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, Tag, Droplets } from "lucide-react";

import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { products } from "@/data/products";

const DISCOUNT_TIERS = [
  { minQty: 1, maxQty: 2, discount: 0, label: "Standard" },
  { minQty: 3, maxQty: 5, discount: 5, label: "5% off" },
  { minQty: 6, maxQty: 9, discount: 10, label: "10% off" },
  { minQty: 10, maxQty: Infinity, discount: 15, label: "15% off" },
];

function getDiscount(qty: number) {
  const tier = DISCOUNT_TIERS.find((t) => qty >= t.minQty && qty <= t.maxQty);
  return tier || DISCOUNT_TIERS[0];
}

function getBasePrice(itemId: string): number {
  const product = products.find((p) => p.id === itemId);
  return product?.price || 0;
}

function getDiscountedPrice(basePrice: number, qty: number) {
  const tier = getDiscount(qty);
  return Math.round(basePrice * (1 - tier.discount / 100));
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, deliveryFee } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (user) {
      router.push("/delivery");
    } else {
      router.push("/login?redirect=/delivery");
    }
  };

  // Calculate totals with discounts
  const cartWithDiscounts = items.map((item) => {
    const basePrice = getBasePrice(item.id) || item.price;
    const discount = getDiscount(item.quantity);
    const discountedPrice = getDiscountedPrice(basePrice, item.quantity);
    return { ...item, basePrice, discountedPrice, discount };
  });

  const discountedSubtotal = cartWithDiscounts.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const originalSubtotal = cartWithDiscounts.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);
  const totalSavings = originalSubtotal - discountedSubtotal;
  const total = discountedSubtotal + (items.length > 0 ? deliveryFee : 0);

  const cartContent = items.length === 0 ? (
    <div className="flex flex-col items-center justify-center px-4 pt-24 gap-4">
      <Droplets size={48} className="text-text-secondary" />
      <p className="text-text-secondary text-base">Your cart is empty</p>
      <Link href="/buy" className="text-primary font-semibold text-sm underline">
        Browse products
      </Link>
    </div>
  ) : (
    <div className="px-4 mt-2">
      {cartWithDiscounts.map((item) => {
        const hasDiscount = item.discount.discount > 0;
        return (
          <div key={item.id} className="bg-white shadow-card rounded-xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-16 bg-primary-light rounded-lg flex items-center justify-center shrink-0 overflow-hidden p-1">
                {(() => { const product = products.find(p => p.id === item.id); return product ? <img src={product.image.src} alt={item.name} className="object-contain w-full h-full" /> : <Droplets size={24} className="text-primary" />; })()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-primary truncate">{item.name}</p>
                <div className="flex items-center gap-2">
                  {hasDiscount ? (
                    <>
                      <span className="text-[13px] text-text-secondary line-through">KES {item.basePrice.toLocaleString()}</span>
                      <span className="text-[13px] font-semibold text-[#2ECC71]">KES {item.discountedPrice.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-[13px] text-text-secondary">KES {item.basePrice.toLocaleString()}</span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#2ECC71] text-[10px] px-1.5 py-0.5 rounded-full font-semibold mt-1">
                    <Tag size={10} /> {item.discount.label}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-text-primary">KES {(item.discountedPrice * item.quantity).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-text-secondary">Quantity</span>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => {
                    if (item.quantity <= 1) removeItem(item.id);
                    else updateQuantity(item.id, item.quantity - 1);
                  }}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center"
                >
                  {item.quantity <= 1 ? <Trash2 size={16} className="text-cta-alt" /> : <Minus size={16} className="text-text-secondary" />}
                </button>
                <span className="w-8 text-center font-bold text-sm text-text-primary">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center"
                >
                  <Plus size={16} className="text-primary" />
                </button>
              </div>
            </div>

            {/* Next discount tier hint */}
            {item.discount.discount < 15 && (
              <div className="mt-2 text-[10px] text-text-secondary">
                {item.quantity < 3
                  ? `Add ${3 - item.quantity} more for 5% off!`
                  : item.quantity < 6
                  ? `Add ${6 - item.quantity} more for 10% off!`
                  : `Add ${10 - item.quantity} more for 15% off!`}
              </div>
            )}
          </div>
        );
      })}

      {/* Order Summary */}
      <div className="bg-surface shadow-card rounded-xl p-4 mt-2">
        <div className="flex justify-between items-center text-sm text-text-secondary mb-2">
          <span>Subtotal</span>
          <span>KES {discountedSubtotal.toLocaleString()}</span>
        </div>
        {totalSavings > 0 && (
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-[#2ECC71] font-medium flex items-center gap-1"><Tag size={12} /> You save</span>
            <span className="text-[#2ECC71] font-semibold">- KES {totalSavings.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm text-text-secondary mb-2">
          <span>Delivery Fee</span>
          <span>KES {deliveryFee.toLocaleString()}</span>
        </div>
        <div className="h-px bg-gray-100 my-2" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-text-primary">Total</span>
          <span className="font-bold text-xl text-text-primary">KES {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pb-36">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Your Cart" />
        <div className="max-w-md mx-auto">
          {cartContent}
          {items.length > 0 && (
            <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
              <Button variant="primary" fullWidth onClick={handleCheckout}>Checkout</Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Your Cart</h1>
          {cartContent}
          {items.length > 0 && (
            <div className="max-w-md mx-auto mt-8">
              <Button variant="primary" fullWidth onClick={handleCheckout}>Proceed to Checkout</Button>
            </div>
          )}
        </div>
        <DesktopFooter />
      </div>
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
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/cart" className="text-primary font-medium text-sm">Cart</Link>
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
