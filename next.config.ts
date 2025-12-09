import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  // ❗ FULLY DISABLE TURBOPACK
  experimental: {
    turbo: false,
  },

  // ensure Webpack compiler is used
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
