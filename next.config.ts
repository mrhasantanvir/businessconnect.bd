import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['businessconnect.bd', '*.businessconnect.bd'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {}
};

export default nextConfig;
