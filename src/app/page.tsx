"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function HomePage() {
  const router = useRouter();
  const { addItem, removeItem } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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
    router.push("/location");
  };

  return (
    <div className="bg-background min-h-screen max-w-md mx-auto px-4 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Droplets size={24} className="text-primary" />
          <span className="text-[20px] font-bold text-primary">MiMaji</span>
        </div>
        <Link href="/login" className="text-primary text-sm font-semibold">
          Log In
        </Link>
      </div>

      {/* Tagline */}
      <p className="text-text-secondary text-[14px] mb-5">
        Water delivered to your door in minutes
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
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
      <div className="flex flex-col gap-3">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedProducts.includes(product.id)}
            onSelect={() => toggleProduct(product.id)}
          />
        ))}
      </div>

      {/* Version */}
      <p className="text-center text-text-secondary/50 text-xs mt-8 mb-2">v2.0.0</p>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background px-4 py-4 max-w-md mx-auto">
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
