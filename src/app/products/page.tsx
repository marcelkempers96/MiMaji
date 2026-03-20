"use client";

import { logo1, soft5L, soft10L, soft20L, hard10L, hard20L, watertruck, watertank, watercleaning, warehouse, clean1 } from "@/assets/images";
import { Droplets, ShoppingCart, Truck, Shield, CheckCircle2, Award, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

const waterProducts = [
  {
    name: "5L Soft Bottle",
    image: soft5L,
    price: 80,
    description: "Perfect for personal use, office desks, or on the go. Light, easy to carry, and sealed for freshness.",
    tags: ["Portable", "BPA Free"],
  },
  {
    name: "10L Soft Bottle",
    image: soft10L,
    price: 150,
    description: "Our most popular home size. Ideal for small families, kitchens, and daily cooking needs.",
    tags: ["Family Size", "Best Seller"],
  },
  {
    name: "20L Soft Bottle",
    image: soft20L,
    price: 250,
    description: "The go to choice for households and small offices. Lasts the whole week with pure, clean water.",
    tags: ["Best Value", "Home & Office"],
  },
  {
    name: "10L Hard Bottle",
    image: hard10L,
    price: 180,
    description: "Durable, reusable hard bottle that fits standard dispensers. Built to last and easy to refill.",
    tags: ["Reusable", "Dispenser Ready"],
  },
  {
    name: "20L Hard Bottle",
    image: hard20L,
    price: 290,
    description: "Our flagship dispenser bottle. The standard for homes and offices across Nairobi. Refillable and eco friendly.",
    tags: ["Most Popular", "Eco Friendly"],
  },
];

const additionalServices = [
  {
    title: "Water Tank Delivery",
    image: watertank,
    description: "Need bulk water? We deliver water tanks in various sizes from 1,000L to 10,000L directly to your property. Perfect for construction sites, events, new homes, or backup supply. Our tanks are food grade, UV resistant, and built to keep your water safe for months.",
    features: ["1,000L to 10,000L capacity", "Food grade materials", "Delivery and installation included", "Ideal for homes, businesses, and construction"],
    cta: "Enquire About Tanks",
  },
  {
    title: "Water Truck Delivery & Scheduling",
    image: watertruck,
    description: "For large scale water needs, our trusted network of water truck operators delivers clean, tested water straight to your tanks. Schedule recurring deliveries or book on demand. We verify every truck and every source so you never have to worry about quality.",
    features: ["2,000L to 20,000L per delivery", "Scheduled recurring deliveries", "Quality tested at source", "Residential, commercial, and industrial"],
    cta: "Schedule a Truck",
  },
  {
    title: "Water Tank Cleaning Services",
    image: watercleaning,
    description: "Clean water starts with a clean tank. Through our dedicated network of professional cleaners, we offer thorough tank cleaning, sanitisation, and inspection. Recommended every 6 months to prevent bacterial buildup and keep your water tasting fresh.",
    features: ["Professional deep cleaning", "Sanitisation and disinfection", "Inspection report included", "All tank sizes covered"],
    cta: "Book Tank Cleaning",
  },
];

function ProductsContent({ desktop }: { desktop?: boolean }) {
  return (
    <>
      {/* Water Products */}
      <div className={desktop ? "mb-12" : "mb-6"}>
        <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl mb-6" : "text-lg mb-4"}`}>
          Our Water Products
        </h2>
        <div className={desktop ? "grid grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {waterProducts.map((product) => (
            <div key={product.name} className="bg-surface shadow-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="bg-primary-light p-6 flex items-center justify-center">
                <img src={product.image.src} alt={product.name} className="h-40 w-auto object-contain" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-text-primary">{product.name}</h3>
                  <span className="text-primary font-extrabold text-lg">KES {product.price}</span>
                </div>
                <p className="text-text-secondary text-sm mb-3">{product.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.tags.map((tag) => (
                    <span key={tag} className="bg-primary-light text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">{tag}</span>
                  ))}
                </div>
                <Link
                  href="/buy"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
                >
                  <ShoppingCart size={16} />
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Services Banners */}
      <div className={desktop ? "mb-12" : "mb-6"}>
        <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl mb-6" : "text-lg mb-4"}`}>
          More Water Solutions
        </h2>
        <div className="flex flex-col gap-5">
          {additionalServices.map((service, idx) => (
            <div key={service.title} className="bg-surface shadow-card rounded-2xl overflow-hidden">
              <div className={`${desktop ? "flex" : ""} ${desktop && idx % 2 === 1 ? "flex-row-reverse" : ""}`}>
                <div className={`${desktop ? "w-2/5" : "w-full h-48"} overflow-hidden`}>
                  <img src={service.image.src} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className={`${desktop ? "w-3/5" : ""} p-5`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={18} className="text-primary" />
                    <h3 className={`font-bold text-text-primary ${desktop ? "text-xl" : "text-base"}`}>{service.title}</h3>
                  </div>
                  <p className="text-text-secondary text-sm mb-4 leading-relaxed">{service.description}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {service.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                        <span className="text-text-primary text-xs font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://wa.me/254758434076"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
                  >
                    {service.cta}
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Quality Banner */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={24} />
            <h2 className={`font-extrabold ${desktop ? "text-2xl" : "text-lg"}`}>Our Commitment to Quality</h2>
          </div>
          <p className={`text-white/90 ${desktop ? "text-base max-w-2xl" : "text-sm"} leading-relaxed mb-4`}>
            At MiMaji, every drop of water we deliver has been through a rigorous journey of testing, filtration, and verification before it ever reaches your glass. We work exclusively with vendors who meet our strict quality standards, and we regularly inspect their facilities to ensure nothing falls below the mark.
          </p>
          <div className={`${desktop ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"} mb-5`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Multi Stage Purification</p>
                <p className="text-white/80 text-xs">Every bottle goes through sediment filtration, carbon treatment, UV sterilisation, and reverse osmosis. We leave nothing to chance.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Award size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">KEBS Certified Partners</p>
                <p className="text-white/80 text-xs">Our vendors hold Kenya Bureau of Standards certification. We verify every certificate and conduct surprise quality audits throughout the year.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Star size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Taste You Can Trust</p>
                <p className="text-white/80 text-xs">Clean water should taste like nothing at all. Our purification process removes impurities while keeping the natural minerals that make water refreshing and healthy.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Sealed and Delivered Fresh</p>
                <p className="text-white/80 text-xs">Every bottle is tamper sealed at the source and delivered in sanitised vehicles. From our facility to your doorstep, the chain of freshness is never broken.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/water-guide"
              className="inline-flex items-center gap-2 bg-white text-primary rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <Droplets size={16} />
              Read Our Water Guide
            </Link>
            <Link
              href="/buy"
              className="inline-flex items-center gap-2 bg-white/20 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              <ShoppingCart size={16} />
              Order Water Now
            </Link>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className={`${desktop ? "grid grid-cols-4 gap-4" : "grid grid-cols-2 gap-3"} mb-6`}>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Shield size={24} className="text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-text-primary">KEBS Verified</p>
          <p className="text-text-secondary text-xs">All partners certified</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Truck size={24} className="text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-text-primary">Fast Delivery</p>
          <p className="text-text-secondary text-xs">Under 45 minutes</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Droplets size={24} className="text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-text-primary">Pure Water</p>
          <p className="text-text-secondary text-xs">Multi stage filtration</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Award size={24} className="text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-text-primary">Tested Monthly</p>
          <p className="text-text-secondary text-xs">Lab verified quality</p>
        </div>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Our Products" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <ProductsContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-text-primary mb-3">Our Water Products</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Premium purified water in every size, delivered fresh to your doorstep in Nairobi. Plus water tanks, truck delivery, and professional cleaning services.
            </p>
          </div>
          <ProductsContent desktop />
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
          <Link href="/products" className="text-primary font-medium text-sm">Products</Link>
          <Link href="/vendors" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Vendors</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
