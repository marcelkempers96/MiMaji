import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Impact | Water Is Life — MiMaji Nairobi",
  description:
    "For every 100 litres ordered in Nairobi, 10 go to rural communities through the MiMaji Foundation — a fixed share of volume, not a year-end donation.",
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
      "For every 100 litres ordered in Nairobi, 10 go to rural communities through the MiMaji Foundation — a fixed share of volume, not a year-end donation.",
    url: "/impact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Impact | Water Is Life — MiMaji",
    description:
      "For every 100 litres ordered in Nairobi, 10 go to rural communities through the MiMaji Foundation — a fixed share of volume, not a year-end donation.",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
