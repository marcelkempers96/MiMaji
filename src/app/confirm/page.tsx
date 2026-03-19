"use client";

import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";

export default function ConfirmOrderPage() {
  const router = useRouter();
  const { items, totalItems, total } = useCart();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();

  const handleConfirm = () => {
    router.push("/track");
  };

  const amountSummary = () => {
    if (items.length === 1) {
      const item = items[0];
      return `${item.quantity} ${item.name}`;
    }
    return `${totalItems} items`;
  };

  return (
    <div className="bg-background min-h-screen max-w-md mx-auto pb-28">
      <TopBar title="Confirm Order" />

      {/* Product Image Placeholder */}
      <div className="flex justify-center mt-6">
        <div className="w-[120px] h-[120px] bg-primary-light rounded-2xl flex items-center justify-center">
          <Droplets size={48} className="text-primary" />
        </div>
      </div>

      {/* Order Details */}
      <div className="px-4 mt-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Account</span>
            <span className="text-text-primary font-medium">
              {user?.phone || "Not set"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Deliver To</span>
            <span className="text-text-primary font-medium">
              {selectedLocation?.address || "Not set"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">Amount</span>
            <span className="text-text-primary font-medium">
              {amountSummary()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-4" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-text-primary">Total</span>
          <span className="text-xl font-bold text-text-primary">
            KES {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bottom: Confirm Order */}
      <div className="fixed bottom-0 left-0 right-0 bg-background px-4 py-4 max-w-md mx-auto">
        <Button variant="primary" fullWidth onClick={handleConfirm}>
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
