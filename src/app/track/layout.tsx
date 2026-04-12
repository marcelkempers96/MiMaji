import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your MiMaji water delivery in real time.",
  robots: { index: false, follow: false },
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
