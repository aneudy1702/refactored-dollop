import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['puppeteer'],
  experimental: {}
};

export default nextConfig;
