import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Portal",
  description: "MiMaji vendor portal for managing your water supply business.",
  robots: { index: false, follow: false },
};

export default function VendorPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
