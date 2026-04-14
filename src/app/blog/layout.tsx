import type { Metadata } from "next";
import { blog1NairobiWater, images } from "@/assets/images";
import { blogPosts } from "@/data/blogPosts";

const SITE_URL = "https://www.mimaji.co.ke";

export const metadata: Metadata = {
  title: "MiMaji Blog | Order Water Online, Water Safety & Delivery in Nairobi",
  description:
    "Order Water Online in Nairobi and read the MiMaji Blog: water safety, affordable (cheap) delivery, verification, pricing, and sustainability across Kenya and Africa. Clean water on demand, delivered fast.",
  keywords: [
    "order water online blog",
    "water safety Nairobi",
    "cheap water delivery Nairobi",
    "water delivery tips Kenya",
    "water quality Africa",
    "KEBS water",
    "verified water Nairobi",
    "MiMaji blog",
  ],
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "MiMaji Blog | Order Water Online in Nairobi",
    description:
      "Order Water Online in Nairobi. The MiMaji Blog covers water safety, cheap delivery, verification, and sustainability across Kenya and Africa.",
    url: "/blog",
    type: "website",
    images: [
      {
        url: blog1NairobiWater.src,
        alt: "MiMaji Blog: Order Water Online in Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiMaji Blog | Order Water Online in Nairobi",
    description:
      "Water safety, cheap delivery, verification and sustainability across Kenya and Africa.",
    images: [blog1NairobiWater.src],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MiMaji Blog: Order Water Online in Nairobi",
    description:
      "Articles on Order Water Online, water safety, cheap delivery, verification, and sustainability across Kenya and Africa.",
    itemListElement: blogPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
      image: post.heroImage
        ? (images[post.heroImage]?.src ?? post.heroImage).startsWith("http")
          ? images[post.heroImage]?.src ?? post.heroImage
          : `${SITE_URL}${images[post.heroImage]?.src ?? post.heroImage}`
        : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      {children}
    </>
  );
}
