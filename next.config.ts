import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    contentDispositionType: "inline",
    unoptimized: true,
  },
};

export default nextConfig;
