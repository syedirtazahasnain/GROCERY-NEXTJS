import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable Turbopack; force Webpack on cPanel hosts
  experimental: {
    turbo: false,
  },

  // Avoid basePath issues in cPanel
  output: "standalone",
};

export default nextConfig;
