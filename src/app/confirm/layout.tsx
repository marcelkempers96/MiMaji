import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Order",
  description: "Confirm your MiMaji water delivery order.",
  robots: { index: false, follow: false },
};

export default function ConfirmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
