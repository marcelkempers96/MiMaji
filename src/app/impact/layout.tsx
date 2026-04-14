import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Impact | Water Is Life — MiMaji Nairobi",
  description:
    "Order Water Online with MiMaji and give back. For every 100L delivered, we donate 10L to rural Kenyan communities. Clean, affordable and verifiable water on demand, delivered fast across Nairobi and all of Africa.",
  keywords: [
    "order water online",
    "water donation Kenya",
    "clean water Africa",
    "MiMaji impact",
    "water is life",
    "affordable water Nairobi",
    "verified water Nairobi",
    "MajiMap",
  ],
  alternates: { canonical: "/impact" },
  openGraph: {
    title: "Our Impact | Water Is Life — MiMaji",
    description:
      "Order Water Online in Nairobi. For every 100L delivered, MiMaji donates 10L to rural communities across Kenya. Clean, affordable and verifiable water on demand.",
    url: "/impact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Impact | Water Is Life — MiMaji",
    description:
      "Order Water Online in Nairobi. For every 100L delivered, MiMaji donates 10L to rural communities across Kenya.",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
