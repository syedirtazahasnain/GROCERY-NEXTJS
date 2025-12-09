import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  output: "standalone",

  // remove turbopack completely
  // experimental: {},
};

export default nextConfig;
