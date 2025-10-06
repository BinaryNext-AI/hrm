import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint errors from failing production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
