import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  reactStrictMode: true,

  // Disable Turbopack (Fixes build crash on shared hosting)
  turbo: false,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
