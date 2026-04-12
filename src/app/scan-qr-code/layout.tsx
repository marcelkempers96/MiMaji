import type { Metadata } from "next";
import { qrCodeBeforeAfterImpact } from "@/assets/images";

export const metadata: Metadata = {
  title: "Scan QR Code — Verify Your Water | MiMaji",
  description:
    "Scan the QR code on any MiMaji bottle to see where your water comes from, lab test results, and KEBS certification. No bottle yet? Order your first 20L jug today.",
  alternates: { canonical: "/scan-qr-code" },
  openGraph: {
    title: "Scan QR Code — Verify Your Water | MiMaji",
    description:
      "Scan a MiMaji bottle's QR code to see its source, lab results, and KEBS status. Order your first 20L jug today.",
    url: "/scan-qr-code",
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
    title: "Scan QR Code — Verify Your Water | MiMaji",
    description:
      "Scan a MiMaji bottle's QR code to see its source, lab results, and KEBS status.",
    images: [qrCodeBeforeAfterImpact.src],
  },
};

export default function ScanQRCodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
