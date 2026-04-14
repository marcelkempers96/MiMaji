import type { Metadata } from "next";
import { getBlogPost } from "@/data/blogPosts";
import { images } from "@/assets/images";

const SITE_URL = "https://www.mimaji.co.ke";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post does not exist.",
    };
  }

  const description =
    post.excerpt.length > 160 ? post.excerpt.slice(0, 157) + "..." : post.excerpt;

  const resolvedHero = post.heroImage
    ? images[post.heroImage]?.src ?? post.heroImage
    : undefined;
  const ogImages = resolvedHero
    ? [
        {
          url: resolvedHero,
          alt: post.heroImageAlt || post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description,
    keywords: [
      "order water online",
      "water delivery Nairobi",
      "clean water Nairobi",
      "cheap water delivery",
      "verified water",
      post.category,
      "MiMaji blog",
    ],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedDate,
      authors: [post.author],
      tags: [post.category],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: resolvedHero ? [resolvedHero] : undefined,
    },
  };
}

export default async function BlogPostLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return children;

  const description =
    post.excerpt.length > 160 ? post.excerpt.slice(0, 157) + "..." : post.excerpt;
  const resolvedHero = post.heroImage
    ? images[post.heroImage]?.src ?? post.heroImage
    : undefined;
  const imageUrl = resolvedHero
    ? resolvedHero.startsWith("http")
      ? resolvedHero
      : `${SITE_URL}${resolvedHero}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "MiMaji",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo1.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.category,
    keywords: [
      "order water online",
      "water delivery Nairobi",
      "clean water Nairobi",
      "cheap water delivery",
      "verified water",
      post.category,
    ].join(", "),
    inLanguage: "en-KE",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
