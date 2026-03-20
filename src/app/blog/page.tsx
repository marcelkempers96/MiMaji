"use client";

import { logo1 } from "@/assets/images";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Blog" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <BlogContent />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-4xl mx-auto px-8 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-text-primary mb-3">MiMaji Blog</h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Stories, tips, and insights about water quality, delivery, and sustainable living in Nairobi.
            </p>
          </div>
          <BlogContent desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function BlogContent({ desktop }: { desktop?: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
        <BookOpen size={36} className="text-primary" />
      </div>
      <h2 className={`font-bold text-text-primary mb-2 ${desktop ? "text-2xl" : "text-lg"}`}>
        Coming Soon
      </h2>
      <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
        We are working on articles about water safety, delivery tips, sustainability, and life in Nairobi. Check back soon for our first posts!
      </p>
      <Link
        href="/water-guide"
        className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
      >
        Read Our Water Guide
        <ArrowRight size={16} />
      </Link>
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
          <Link href="/products" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
          <Link href="/blog" className="text-primary font-medium text-sm">Blog</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
