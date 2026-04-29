import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['businessconnect.bd', '*.businessconnect.bd'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
