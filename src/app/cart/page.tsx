"use client";

import { useRouter } from "next/navigation";
import { Droplets, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (user) {
      router.push("/confirm");
    } else {
      router.push("/login?redirect=/confirm");
    }
  };

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
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 bg-white shadow-card rounded-xl p-4 mb-3">
          <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            <Droplets size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-text-primary truncate">{item.name}</p>
            <p className="text-[13px] text-text-secondary">KES {item.price.toLocaleString()}</p>
          </div>
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
      ))}

      <div className="flex justify-between items-center mt-4 text-sm text-text-secondary">
        <span>Delivery Fee:</span>
        <span>KES {deliveryFee.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="font-bold text-lg text-text-primary">Total:</span>
        <span className="font-bold text-xl text-text-primary">KES {total.toLocaleString()}</span>
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
        <Link href="/" className="flex items-center gap-2">
          <Droplets size={28} className="text-primary" />
          <span className="text-2xl font-bold text-primary">MiMaji</span>
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
