import type { Metadata } from "next";

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
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
