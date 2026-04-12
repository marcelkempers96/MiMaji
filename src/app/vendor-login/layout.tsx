import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Log In — MiMaji",
  description: "Log in to your MiMaji vendor account to manage orders and water supplies.",
  robots: { index: false, follow: true },
};

export default function VendorLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
