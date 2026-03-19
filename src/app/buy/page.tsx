"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import Link from "next/link";
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
    <div className="bg-background min-h-screen pb-36">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Buy Water" />
        <div className="max-w-md mx-auto">
          <BuyContent
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            toggleProduct={toggleProduct}
          />
          {/* Sticky Bottom */}
          <div className="fixed bottom-16 left-0 right-0 bg-background px-4 py-3 max-w-md mx-auto">
            <Button variant="primary" fullWidth disabled={selectedProducts.length === 0} onClick={handleContinue}>
              Continue
              {selectedProducts.length > 0 && (
                <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {selectedProducts.length}
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
          <p className="text-text-secondary mb-6">Select your preferred water type and size</p>

          <BuyContent
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredProducts={filteredProducts}
            selectedProducts={selectedProducts}
            toggleProduct={toggleProduct}
            desktop
          />

          <div className="max-w-md mx-auto mt-8">
            <Button variant="primary" fullWidth disabled={selectedProducts.length === 0} onClick={handleContinue}>
              Continue to Cart
              {selectedProducts.length > 0 && (
                <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                  {selectedProducts.length}
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

function BuyContent({ activeCategory, setActiveCategory, filteredProducts, selectedProducts, toggleProduct, desktop }: {
  activeCategory: "hard" | "soft";
  setActiveCategory: (c: "hard" | "soft") => void;
  filteredProducts: typeof products;
  selectedProducts: string[];
  toggleProduct: (id: string) => void;
  desktop?: boolean;
}) {
  return (
    <>
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

      {filteredProducts.length === 0 && activeCategory === "hard" && (
        <div className="px-4">
          <div className="bg-surface shadow-card rounded-xl p-6 text-center">
            <Droplets size={36} className="text-primary/30 mx-auto mb-2" />
            <p className="font-bold text-sm text-text-primary">Hard Bottle — 20L Only</p>
            <p className="text-text-secondary text-xs mt-1">We offer one premium hard jug: 20L Purified Water at KES 500</p>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className={desktop ? "grid grid-cols-2 gap-4 px-4" : "flex flex-col gap-3 px-4"}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            selected={selectedProducts.includes(product.id)}
            onSelect={() => toggleProduct(product.id)}
          />
        ))}
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
