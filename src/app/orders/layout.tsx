import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your MiMaji water delivery orders.",
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
