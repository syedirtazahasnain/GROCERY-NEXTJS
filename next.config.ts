import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  // THIS LINE FIXES EVERYTHING:
  experimental: { turbopack: false },
};

export default nextConfig;