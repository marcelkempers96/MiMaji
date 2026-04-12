"use client";

import { use } from "react";
import { logo1 } from "@/assets/images";
import { Clock, ArrowLeft, Tag, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { getBlogPost, type BlogSection } from "@/data/blogPosts";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = getBlogPost(slug);
  const router = useRouter();

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Post Not Found</h1>
          <p className="text-text-secondary mb-4">This blog post does not exist.</p>
          <Link href="/blog" className="text-primary font-semibold hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Blog" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">
          <ArticleHeader post={post} />
          <ArticleBody sections={post.content} />
          <ArticleFooter />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <article className="max-w-3xl mx-auto px-8 py-12">
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center gap-1.5 text-text-secondary hover:text-primary text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            All Posts
          </button>
          <ArticleHeader post={post} desktop />
          <ArticleBody sections={post.content} desktop />
          <ArticleFooter desktop />
        </article>
        <DesktopFooter />
      </div>
    </div>
  );
}

function ArticleHeader({
  post,
  desktop,
}: {
  post: {
    title: string;
    category: string;
    publishedDate: string;
    readingTime: string;
    author: string;
    heroImage?: string;
    heroImageAlt?: string;
  };
  desktop?: boolean;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
          <Tag size={12} />
          {post.category}
        </span>
      </div>
      <h1 className={`font-extrabold text-text-primary leading-tight mb-4 ${desktop ? "text-4xl" : "text-2xl"}`}>
        {post.title}
      </h1>
      <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm">
        <span className="flex items-center gap-1.5">
          <User size={14} />
          {post.author}
        </span>
        <span>{post.publishedDate}</span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {post.readingTime}
        </span>
      </div>
      {post.heroImage && (
        <img
          src={post.heroImage}
          alt={post.heroImageAlt || post.title}
          className={`w-full object-cover rounded-2xl shadow-card mt-6 ${desktop ? "max-h-[420px]" : "max-h-64"}`}
        />
      )}
    </div>
  );
}

function ArticleBody({ sections, desktop }: { sections: BlogSection[]; desktop?: boolean }) {
  return (
    <div className="space-y-5">
      {sections.map((section, i) => {
        switch (section.type) {
          case "heading":
            return (
              <h2
                key={i}
                className={`font-bold text-text-primary mt-10 mb-3 ${desktop ? "text-2xl" : "text-xl"}`}
              >
                {section.text}
              </h2>
            );
          case "subheading":
            return (
              <h3
                key={i}
                className={`font-semibold text-text-primary mt-6 mb-2 ${desktop ? "text-lg" : "text-base"}`}
              >
                {section.text}
              </h3>
            );
          case "paragraph":
            return (
              <p key={i} className="text-text-secondary leading-relaxed text-[15px]">
                {section.text}
              </p>
            );
          case "table":
            return (
              <div key={i} className="overflow-x-auto my-6 -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full text-sm border-collapse rounded-xl overflow-hidden shadow-card">
                  <thead>
                    <tr className="bg-primary text-white">
                      {section.headers.map((h, j) => (
                        <th key={j} className="text-left px-3 py-2.5 font-semibold text-xs whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, j) => (
                      <tr key={j} className={j % 2 === 0 ? "bg-surface" : "bg-background"}>
                        {row.map((cell, k) => (
                          <td key={k} className="px-3 py-2 text-text-secondary text-xs border-t border-[#E0E0E0]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "image":
            return (
              <figure key={i} className="my-6">
                <img
                  src={section.src}
                  alt={section.alt}
                  loading="lazy"
                  className="w-full rounded-2xl shadow-card object-cover"
                />
                {section.caption && (
                  <figcaption className="text-text-secondary text-xs italic text-center mt-2">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function ArticleFooter({ desktop }: { desktop?: boolean }) {
  return (
    <div className="mt-12 pt-8 border-t border-[#E0E0E0]">
      <div className={`bg-primary-light rounded-2xl p-6 text-center ${desktop ? "p-8" : ""}`}>
        <h3 className={`font-bold text-text-primary mb-2 ${desktop ? "text-xl" : "text-lg"}`}>
          Order Clean Water Today
        </h3>
        <p className="text-text-secondary text-sm mb-4 max-w-md mx-auto">
          KEBS-certified, lab-tested water delivered to your door. Pay via M-Pesa.
        </p>
        <Link
          href="/buy"
          className="inline-flex items-center gap-2 bg-primary text-white rounded-xl px-6 py-3 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors"
        >
          Order Water Now
        </Link>
      </div>
      <div className="mt-6 text-center">
        <Link href="/blog" className="text-primary text-sm font-semibold hover:underline">
          &larr; Back to all posts
        </Link>
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
          <Link href="/products" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
          <Link href="/blog" className="text-primary font-medium text-sm">Blog</Link>
          <Link href="/login" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Log In</Link>
        </nav>
      </div>
    </header>
  );
}
