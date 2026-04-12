import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Know Your Water — Every Drop Verified | MiMaji",
  description:
    "MiMaji is the only water delivery in Nairobi with a Water Passport. Scan the QR code to see vendor, source, lab tests & KEBS status. Order verified water today.",
  alternates: { canonical: "/know-your-water" },
  openGraph: {
    title: "Know Your Water — Every Drop Verified | MiMaji",
    description:
      "The only Nairobi water delivery with a Water Passport. Scan QR code for vendor, source, lab tests & KEBS status. Order verified water.",
    url: "/know-your-water",
    type: "website",
  },
};

export default function KnowYourWaterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
