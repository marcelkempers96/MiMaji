"use client";

import { logo1, soft5L, soft10L, soft20L, hard10L, hard20L, watertruck, watertank, watercleaning } from "@/assets/images";
import { Droplets, ShoppingCart, Truck, Shield, CheckCircle2, Award, Star, ArrowRight, Sparkles, RefreshCw, PackagePlus, Zap } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

// ── Product data matching src/data/products.ts prices exactly ──

const refillProducts = [
  { name: "18.9L Soft Bottle", image: soft20L, price: 240, badge: "Best Value", perLitre: "KES 12.7/L", desc: "Best value per litre. Swap your empty soft bottle for a freshly filled one." },
  { name: "20L Soft Bottle", image: soft20L, price: 280, perLitre: "KES 14.0/L", desc: "The classic household refill. Lightweight and easy to store." },
  { name: "18.9L Hard Jug", image: hard20L, price: 250, badge: "Best Value", perLitre: "KES 13.2/L", desc: "Best value for dispenser jugs. Fits all standard water dispensers." },
  { name: "20L Hard Jug", image: hard20L, price: 290, badge: "Most Popular", perLitre: "KES 14.5/L", desc: "Our flagship refill. The standard for homes and offices across Nairobi." },
];

const newBottleProducts = [
  { name: "5L Soft Bottle", image: soft5L, price: 80, perLitre: "KES 16.0/L", desc: "Perfect for personal use, the fridge, or on the go." },
  { name: "10L Soft Bottle", image: soft10L, price: 150, perLitre: "KES 15.0/L", desc: "Ideal for small families, kitchens, and daily cooking." },
  { name: "18.9L Soft Bottle", image: soft20L, price: 450, badge: "Best Value", perLitre: "KES 23.8/L", desc: "Best value soft bottle. Smart choice for heavy water usage." },
  { name: "20L Soft Bottle", image: soft20L, price: 500, perLitre: "KES 25.0/L", desc: "Brand new sealed 20L soft bottle for your home." },
  { name: "10L Hard Jug", image: hard10L, price: 180, perLitre: "KES 18.0/L", desc: "Compact dispenser-ready jug. Durable and reusable." },
  { name: "18.9L Hard Jug", image: hard20L, price: 470, badge: "Best Value", perLitre: "KES 24.9/L", desc: "Dispenser-ready hard jug. Built to last for years." },
  { name: "20L Hard Jug", image: hard20L, price: 500, perLitre: "KES 25.0/L", desc: "Our flagship new dispenser jug. The Nairobi standard." },
];

const tankServices = [
  { capacity: "1,000L", price: "KES 3,000", perLitre: "KES 3.0/L", desc: "Perfect for small homes and backup supply" },
  { capacity: "2,000L", price: "KES 3,500", perLitre: "KES 1.75/L", desc: "Ideal for medium households" },
  { capacity: "5,000L", price: "KES 7,500", perLitre: "KES 1.50/L", desc: "Great for large homes and small businesses" },
  { capacity: "10,000L", price: "KES 12,000", perLitre: "KES 1.20/L", desc: "Best rate for estates and commercial use" },
];

function ProductsContent({ desktop }: { desktop?: boolean }) {
  return (
    <>
      {/* Platform intro */}
      <div className="bg-gradient-to-r from-primary-light to-[#D4E8FA] rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm mb-1">MiMaji is a water ordering platform</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              We are not a water brand — we connect you with verified local vendors who deliver premium purified water at standardised prices. Same quality, same price, every time.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Bottle Refills ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
            <RefreshCw size={16} className="text-[#2ECC71]" />
          </div>
          <div>
            <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>Bottle Refills</h2>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4 ml-[42px]">Swap your empty bottle for a freshly filled one. Cheaper and eco-friendly.</p>

        <div className={desktop ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-3"}>
          {refillProducts.map((product) => (
            <div key={product.name} className="bg-surface shadow-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="bg-[#E8F5E9] p-4 flex items-center justify-center relative">
                <img src={product.image.src} alt={product.name} className={`${desktop ? "h-32" : "h-24"} w-auto object-contain`} />
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-[#2ECC71] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">{product.badge}</span>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-text-primary text-sm">{product.name}</h3>
                <p className="text-text-secondary text-[11px] mt-0.5 leading-snug">{product.desc}</p>
                <div className="flex items-end justify-between mt-2.5">
                  <div>
                    <span className="text-primary font-extrabold text-lg">KES {product.price}</span>
                    <p className="text-text-secondary text-[10px]">{product.perLitre}</p>
                  </div>
                </div>
                <Link
                  href="/buy"
                  className="flex items-center justify-center gap-1.5 w-full bg-[#2ECC71] text-white rounded-xl py-2 text-xs font-semibold hover:bg-[#27ae60] transition-colors mt-3"
                >
                  <ShoppingCart size={14} />
                  Order Refill
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: New Bottles ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
            <PackagePlus size={16} className="text-primary" />
          </div>
          <div>
            <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>New Bottles</h2>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4 ml-[42px]">Brand new sealed bottles and jugs. No exchange needed.</p>

        <div className={desktop ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-3"}>
          {newBottleProducts.map((product) => (
            <div key={product.name} className="bg-surface shadow-card rounded-2xl overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="bg-primary-light p-4 flex items-center justify-center relative">
                <img src={product.image.src} alt={product.name} className={`${desktop ? "h-32" : "h-24"} w-auto object-contain`} />
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-bold">{product.badge}</span>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-bold text-text-primary text-sm">{product.name}</h3>
                <p className="text-text-secondary text-[11px] mt-0.5 leading-snug">{product.desc}</p>
                <div className="flex items-end justify-between mt-2.5">
                  <div>
                    <span className="text-primary font-extrabold text-lg">KES {product.price}</span>
                    <p className="text-text-secondary text-[10px]">{product.perLitre}</p>
                  </div>
                </div>
                <Link
                  href="/buy"
                  className="flex items-center justify-center gap-1.5 w-full bg-primary text-white rounded-xl py-2 text-xs font-semibold hover:bg-[#1a5a9a] transition-colors mt-3"
                >
                  <ShoppingCart size={14} />
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fees & Discounts info bar ── */}
      <div className={`bg-surface shadow-card rounded-2xl p-5 mb-10 ${desktop ? "grid grid-cols-3 gap-6" : "space-y-4"}`}>
        <div className="flex items-start gap-3">
          <Truck size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-text-primary">Delivery</p>
            <p className="text-text-secondary text-xs">KES 100 per order.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-[#F5A623] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-text-primary">Bulk Discounts</p>
            <p className="text-text-secondary text-xs">Up to 20% off when you order 3+ jugs.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RefreshCw size={20} className="text-[#2ECC71] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-text-primary">Refill vs New</p>
            <p className="text-text-secondary text-xs">Refill = swap empty for fresh fill (cheaper). New = brand new sealed bottle.</p>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Water Tanks ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#FFF5EC] flex items-center justify-center">
            <Droplets size={16} className="text-[#F5A623]" />
          </div>
          <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>Water Tank Delivery</h2>
        </div>
        <p className="text-text-secondary text-sm mb-4 ml-[42px]">Bulk water delivered to your property. Includes delivery and installation.</p>

        <div className="bg-surface shadow-card rounded-2xl overflow-hidden mb-4">
          <div className={`${desktop ? "flex" : ""}`}>
            <div className={`${desktop ? "w-2/5" : "w-full h-48"} overflow-hidden`}>
              <img src={watertank.src} alt="Water Tank Delivery" className="w-full h-full object-cover" />
            </div>
            <div className={`${desktop ? "w-3/5" : ""} p-5`}>
              <div className={`${desktop ? "grid grid-cols-2" : "grid grid-cols-1"} gap-3 mb-4`}>
                {tankServices.map((tank) => (
                  <div key={tank.capacity} className="bg-gray-50 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-text-primary text-base">{tank.capacity}</span>
                      <span className="font-bold text-primary text-sm">{tank.price}</span>
                    </div>
                    <p className="text-text-secondary text-[11px]">{tank.desc}</p>
                    <p className="text-[#2ECC71] text-[10px] font-semibold mt-1">{tank.perLitre}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["Food-grade materials", "Delivery & installation included", "1,000L to 10,000L capacity", "Homes, businesses & construction"].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                    <span className="text-text-primary text-xs font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/254704476338"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#F5A623] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#e09520] transition-colors"
              >
                Enquire About Tanks
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Water Truck Delivery ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
            <Truck size={16} className="text-primary" />
          </div>
          <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>Water Truck Delivery</h2>
        </div>
        <p className="text-text-secondary text-sm mb-4 ml-[42px]">Large-scale water delivery. Recurring or on-demand, 2,000L to 20,000L.</p>

        <div className="bg-surface shadow-card rounded-2xl overflow-hidden mb-4">
          <div className={`${desktop ? "flex flex-row-reverse" : ""}`}>
            <div className={`${desktop ? "w-2/5" : "w-full h-48"} overflow-hidden`}>
              <img src={watertruck.src} alt="Water Truck Delivery" className="w-full h-full object-cover" />
            </div>
            <div className={`${desktop ? "w-3/5" : ""} p-5`}>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                For large-scale water needs, our trusted network of water truck operators delivers clean, tested water straight to your tanks. Schedule recurring deliveries or book on demand.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["2,000L to 20,000L per delivery", "Scheduled recurring deliveries", "Quality tested at source", "Residential & commercial"].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                    <span className="text-text-primary text-xs font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/254704476338"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
              >
                Schedule a Truck
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Tank Cleaning ── */}
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] flex items-center justify-center">
            <Sparkles size={16} className="text-[#2ECC71]" />
          </div>
          <h2 className={`font-extrabold text-text-primary ${desktop ? "text-2xl" : "text-lg"}`}>Tank Cleaning Services</h2>
        </div>
        <p className="text-text-secondary text-sm mb-4 ml-[42px]">Professional deep cleaning, sanitisation, and inspection for all tank sizes.</p>

        <div className="bg-surface shadow-card rounded-2xl overflow-hidden mb-4">
          <div className={`${desktop ? "flex" : ""}`}>
            <div className={`${desktop ? "w-2/5" : "w-full h-48"} overflow-hidden`}>
              <img src={watercleaning.src} alt="Tank Cleaning" className="w-full h-full object-cover" />
            </div>
            <div className={`${desktop ? "w-3/5" : ""} p-5`}>
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                Clean water starts with a clean tank. Our professional cleaning network offers thorough tank cleaning, sanitisation, and inspection. Recommended every 6 months.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {["Professional deep cleaning", "Sanitisation & disinfection", "Inspection report included", "All tank sizes covered"].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#2ECC71] mt-0.5 flex-shrink-0" />
                    <span className="text-text-primary text-xs font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://wa.me/254704476338"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#2ECC71] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#27ae60] transition-colors"
              >
                Book Tank Cleaning
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Water Quality Banner ── */}
      <div className="bg-gradient-to-br from-primary to-[#1a5a9a] rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={24} />
            <h2 className={`font-extrabold ${desktop ? "text-2xl" : "text-lg"}`}>Our Commitment to Quality</h2>
          </div>
          <p className={`text-white/90 ${desktop ? "text-base max-w-2xl" : "text-sm"} leading-relaxed mb-4`}>
            Every drop of water we deliver has been through rigorous testing, filtration, and verification. We work exclusively with vendors who meet our strict quality standards.
          </p>
          <div className={`${desktop ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"} mb-5`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Multi-Stage Purification</p>
                <p className="text-white/80 text-xs">Sediment filtration, carbon treatment, UV sterilisation, and reverse osmosis.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Award size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">KEBS Certified Partners</p>
                <p className="text-white/80 text-xs">All vendors hold Kenya Bureau of Standards certification with regular audits.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Star size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Taste You Can Trust</p>
                <p className="text-white/80 text-xs">Pure, refreshing water with natural minerals preserved.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="font-bold text-sm">Sealed & Delivered Fresh</p>
                <p className="text-white/80 text-xs">Tamper-sealed at source and delivered in sanitised vehicles.</p>
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
          <p className="text-text-secondary text-xs">Multi-stage filtration</p>
        </div>
        <div className="bg-surface shadow-card rounded-xl p-4 text-center">
          <Award size={24} className="text-primary mx-auto mb-2" />
          <p className="font-bold text-sm text-text-primary">Tested Monthly</p>
          <p className="text-text-secondary text-xs">Lab-verified quality</p>
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
        <TopBar title="Products & Pricing" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <ProductsContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-text-primary mb-3">Products & Pricing</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Premium purified water at standardised prices. Bottle refills, new bottles, water tanks, truck delivery, and tank cleaning — all through verified local vendors.
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
          <Link href="/subscriptions" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Subscriptions</Link>
          <Link href="/vendors" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Vendors</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
