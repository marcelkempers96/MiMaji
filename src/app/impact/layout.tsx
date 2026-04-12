import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Impact — Water Is Life | MiMaji Nairobi",
  description:
    "For every 100L delivered, MiMaji donates 10L to rural Kenyan communities. Learn how your water order funds clean water access. Order now and make an impact today.",
  alternates: { canonical: "/impact" },
  openGraph: {
    title: "Our Impact — Water Is Life | MiMaji Nairobi",
    description:
      "For every 100L delivered, MiMaji donates 10L to rural Kenyan communities. Order clean water & give back.",
    url: "/impact",
    type: "website",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
