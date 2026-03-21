import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "*.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "*.appwrite.global",
      },
    ],
  },
};

export default nextConfig;
