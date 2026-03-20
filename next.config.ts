import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    contentDispositionType: "inline",
    unoptimized: true,
  },
  trailingSlash: true,
  turbopack: {
    root: "/home/user/MiMaji",
  },
};

export default nextConfig;
