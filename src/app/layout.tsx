import type { Metadata } from "next";
import ClientProviders from "@/components/shared/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiMaji — Fresh Water Delivered Today",
  description:
    "Order 20-litre water jugs delivered to your door in Nairobi. Pay with M-Pesa. Fast, reliable, local.",
  keywords: ["water delivery", "Nairobi", "M-Pesa", "20L jugs", "MiMaji"],
  openGraph: {
    title: "MiMaji — Fresh Water Delivered Today",
    description: "Order 20L water jugs in Nairobi. Pay via M-Pesa.",
    url: "https://mimaji.co.ke",
    siteName: "MiMaji",
    type: "website",
  },
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
      <body className="antialiased font-body">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
