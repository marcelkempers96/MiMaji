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

  return (
    <div className="bg-background min-h-screen max-w-md mx-auto pb-36">
      <TopBar title="Your Cart" />

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center px-4 pt-24 gap-4">
          <Droplets size={48} className="text-text-secondary" />
          <p className="text-text-secondary text-base">Your cart is empty</p>
          <Link
            href="/"
            className="text-primary font-semibold text-sm underline"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-2">
          {/* Cart Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white shadow-card rounded-xl p-4 mb-3"
            >
              {/* Product Image Placeholder */}
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <Droplets size={24} className="text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-primary truncate">
                  {item.name}
                </p>
                <p className="text-[13px] text-text-secondary">
                  KES {item.price.toLocaleString()}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-0">
                <button
                  onClick={() => {
                    if (item.quantity <= 1) {
                      removeItem(item.id);
                    } else {
                      updateQuantity(item.id, item.quantity - 1);
                    }
                  }}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center"
                >
                  {item.quantity <= 1 ? (
                    <Trash2 size={16} className="text-cta-alt" />
                  ) : (
                    <Minus size={16} className="text-text-secondary" />
                  )}
                </button>
                <span className="w-8 text-center font-bold text-sm text-text-primary">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center"
                >
                  <Plus size={16} className="text-primary" />
                </button>
              </div>
            </div>
          ))}

          {/* Delivery Fee */}
          <div className="flex justify-between items-center mt-4 text-sm text-text-secondary">
            <span>Delivery Fee:</span>
            <span>KES {deliveryFee.toLocaleString()}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold text-lg text-text-primary">Total:</span>
            <span className="font-bold text-xl text-text-primary">
              KES {total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Bottom: Checkout */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
          <Button variant="primary" fullWidth onClick={handleCheckout}>
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
}
