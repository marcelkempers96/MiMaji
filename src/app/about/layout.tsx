import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MiMaji — Nairobi's Verified Water Delivery Platform",
  description:
    "MiMaji connects Nairobi homes and offices with KEBS-certified water suppliers. Learn about our mission to make clean water accessible, transparent, and affordable.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MiMaji — Nairobi's Verified Water Delivery Platform",
    description:
      "MiMaji connects Nairobi homes and offices with KEBS-certified water suppliers. Clean, verified, transparent water delivery.",
    url: "/about",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
