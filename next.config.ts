import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  assetPrefix: './',
  transpilePackages: [
    'change-case',
    'map-obj',
    'media-captions',
    'media-icons',
    'quick-lru',
    '@radix-ui',
    '@vidstack/react'
  ],
};

export default nextConfig;
