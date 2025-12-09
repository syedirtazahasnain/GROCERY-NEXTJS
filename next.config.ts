import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  // FORCE WEBPACK LOADER (disables Turbopack completely)
  experimental: {
    forceSwcTransforms: true,
  },

  webpack: (config) => {
    return config; // enabling this forces Webpack
  },
};

export default nextConfig;
