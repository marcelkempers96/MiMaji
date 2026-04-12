import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your MiMaji account.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
