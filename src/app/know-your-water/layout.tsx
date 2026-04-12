import type { Metadata } from "next";
import { qrCodeBeforeAfterImpact } from "@/assets/images";

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
    images: [
      {
        url: qrCodeBeforeAfterImpact.src,
        alt: "Before and after impact of using the MiMaji QR code water verification tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Know Your Water — Every Drop Verified | MiMaji",
    description:
      "The only Nairobi water delivery with a Water Passport. Scan QR code for vendor, source, lab tests & KEBS status.",
    images: [qrCodeBeforeAfterImpact.src],
  },
};

export default function KnowYourWaterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
