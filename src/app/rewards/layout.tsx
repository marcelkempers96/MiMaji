import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Warriors Rewards — Earn Free Water with MiMaji",
  description:
    "Earn free water with every MiMaji order. Water Warriors rewards give you free litres, referral bonuses, and exclusive offers on clean water delivery in Nairobi.",
  alternates: { canonical: "/rewards" },
  openGraph: {
    title: "Water Warriors Rewards — Earn Free Water with MiMaji",
    description:
      "Earn free litres, referral bonuses & exclusive offers on clean water delivery in Nairobi.",
    url: "/rewards",
    type: "website",
  },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
