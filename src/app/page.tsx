"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, MapPin, Info, FileText, Mail, Phone } from "lucide-react";
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
    <div className="bg-background min-h-screen max-w-md mx-auto px-4 pb-36">
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

      {/* Footer */}
      <footer className="mt-10 border-t border-[#E0E0E0] pt-6 pb-4">
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
          <Link href="/buy" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Droplets size={16} />
            Order Water
          </Link>
          <Link href="/orders" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <FileText size={16} />
            My Orders
          </Link>
          <Link href="/subscriptions" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <FileText size={16} />
            Subscriptions
          </Link>
          <Link href="/schedule" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <FileText size={16} />
            Schedule
          </Link>
          <Link href="/profile" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Info size={16} />
            My Account
          </Link>
          <Link href="/support" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Mail size={16} />
            Support
          </Link>
        </div>

        {/* Vendor & Info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
          <Link href="/track" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <MapPin size={16} />
            Vendor Map
          </Link>
          <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Info size={16} />
            About MiMaji
          </Link>
          <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <FileText size={16} />
            Docs
          </Link>
          <Link href="#" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <FileText size={16} />
            Terms & Privacy
          </Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Contact Us</p>
          <a href="tel:+254700000000" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Phone size={14} />
            +254 700 000 000
          </a>
          <a href="mailto:hello@mimaji.co.ke" className="flex items-center gap-2 text-text-secondary text-sm hover:text-primary transition-colors">
            <Mail size={14} />
            hello@mimaji.co.ke
          </a>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-[#E0E0E0] pt-4 flex items-center justify-between">
          <p className="text-text-secondary/50 text-xs">&copy; 2026 MiMaji</p>
          <p className="text-text-secondary/50 text-xs">v2.1.0</p>
        </div>
      </footer>

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
