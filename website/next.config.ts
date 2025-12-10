import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
