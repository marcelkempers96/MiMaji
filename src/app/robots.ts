import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/confirm",
          "/orders",
          "/profile",
          "/dashboard",
          "/account-settings",
          "/notifications",
          "/saved-addresses",
          "/payment-methods",
          "/invoices",
          "/track",
          "/delivery",
          "/location",
          "/login",
          "/vendor-login",
          "/vendor-portal",
          "/hidden-admin",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
