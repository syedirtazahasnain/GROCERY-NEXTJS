import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  // Force Webpack, disables Turbopack completely
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
