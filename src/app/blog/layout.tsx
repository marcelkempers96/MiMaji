import type { Metadata } from "next";
import { blog1NairobiWater } from "@/assets/images";

export const metadata: Metadata = {
  title: "MiMaji Blog — Water, Safety & Delivery in Nairobi",
  description:
    "Articles on water safety, delivery, pricing, and sustainability in Nairobi. Stay informed with MiMaji's research on tap water, shortages, and clean water options.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "MiMaji Blog — Water, Safety & Delivery in Nairobi",
    description:
      "Articles on water safety, pricing, and sustainability in Nairobi. MiMaji's research on tap water, shortages, and clean water options.",
    url: "/blog",
    type: "website",
    images: [
      {
        url: blog1NairobiWater.src,
        alt: "MiMaji Blog — water safety, delivery, and pricing in Nairobi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiMaji Blog — Water, Safety & Delivery in Nairobi",
    description:
      "Articles on water safety, pricing, and sustainability in Nairobi.",
    images: [blog1NairobiWater.src],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
