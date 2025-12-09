import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  
  // Add this to force single-threaded/webpack mode
  experimental: {
    cpus: 1, // Limit to 1 CPU core
  },
};

export default nextConfig;