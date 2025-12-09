import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  
  // Force Webpack 5
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Disable parallel processing
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;