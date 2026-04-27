import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['businessconnect.bd', '*.businessconnect.bd'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
