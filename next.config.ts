import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    turbo: {
      enabled: false, // must be an object
    },
  },

  output: "standalone",
};

export default nextConfig;
