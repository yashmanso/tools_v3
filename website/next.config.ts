import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Removed 'output: export' to allow API routes to work
  // If you need static export, API routes won't work and you'll need
  // to use a separate backend service or serverless functions
  images: {
    unoptimized: true,
  },
  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
