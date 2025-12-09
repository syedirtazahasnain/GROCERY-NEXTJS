import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  output: "standalone",
  
  // REMOVE the experimental.turbopack line completely
  // experimental: { turbopack: false }, // ← DELETE THIS ENTIRE LINE
};

export default nextConfig;