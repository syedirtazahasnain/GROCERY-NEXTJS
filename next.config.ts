import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  reactStrictMode: true,
  /* config options here */



  eslint: {
    ignoreDuringBuilds: true, // Add this
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;