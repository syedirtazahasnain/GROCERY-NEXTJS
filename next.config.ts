import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
