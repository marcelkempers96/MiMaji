import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    contentDispositionType: "inline",
    unoptimized: true,
  },
};

export default nextConfig;
