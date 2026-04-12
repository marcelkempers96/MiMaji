"use client";

import { logo1 } from "@/assets/images";
import { Clock, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { blogPosts } from "@/data/blogPosts";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Blog" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <BlogList />
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
          <BlogList desktop />
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function BlogList({ desktop }: { desktop?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {blogPosts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}`}
          className="block bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
        >
          {post.heroImage && (
            <img
              src={post.heroImage}
              alt={post.heroImageAlt || post.title}
              loading="lazy"
              className={`w-full object-cover ${desktop ? "h-56" : "h-44"}`}
            />
          )}
          <div className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                <Tag size={12} />
                {post.category}
              </span>
            </div>
            <h2 className={`font-bold text-text-primary mb-2 leading-snug ${desktop ? "text-xl" : "text-lg"}`}>
              {post.title}
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-text-secondary text-xs">
                <span>{post.publishedDate}</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.readingTime}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-semibold">
                Read <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      ))}
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
