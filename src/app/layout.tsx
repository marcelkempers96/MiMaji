import type { Metadata } from "next";
import Providers from "@/context/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiMaji — Water Delivery",
  description:
    "Order water delivered to your door in Nairobi. Pay with M-Pesa. Fast, reliable, local.",
  keywords: ["water delivery", "Nairobi", "M-Pesa", "20L jugs", "MiMaji"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
