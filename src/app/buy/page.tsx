"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function BuyWaterPage() {
  const router = useRouter();
  const { addItem, removeItem, items } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    () => items.map((i) => i.id)
  );
  const [activeCategory, setActiveCategory] = useState<"hard" | "soft">("hard");

  const filteredProducts = products.filter((p) => p.category === activeCategory);

  const toggleProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (selectedProducts.includes(productId)) {
      setSelectedProducts((prev) => prev.filter((id) => id !== productId));
      removeItem(productId);
    } else {
      setSelectedProducts((prev) => [...prev, productId]);
      addItem({ id: product.id, name: `${product.name} ${product.size}`, price: product.price, quantity: 1 });
    }
  };

  const handleContinue = () => {
    router.push("/cart");
  };

  return (
    <div className="bg-background min-h-screen max-w-md mx-auto pb-36">
      <TopBar title="Buy Water" />

      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 mt-2 mb-5">
        <button
          onClick={() => setActiveCategory("hard")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "hard"
              ? "bg-primary text-white"
              : "bg-white text-text-secondary"
          }`}
        >
          Hard Bottle
        </button>
        <button
          onClick={() => setActiveCategory("soft")}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            activeCategory === "soft"
              ? "bg-primary text-white"
              : "bg-white text-text-secondary"
          }`}
        >
          Soft Bottle
        </button>
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3 px-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedProducts.includes(product.id)}
            onSelect={() => toggleProduct(product.id)}
          />
        ))}
      </div>

      {/* Sticky Bottom - above nav bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
        <Button
          variant="primary"
          fullWidth
          disabled={selectedProducts.length === 0}
          onClick={handleContinue}
        >
          Continue
          {selectedProducts.length > 0 && (
            <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
              {selectedProducts.length}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
