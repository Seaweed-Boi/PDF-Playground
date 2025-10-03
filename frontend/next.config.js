const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['localhost', 'seaweed-boi--pdf-extraction-api-fastapi-app.modal.run'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.modal.run',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },
  experimental: {
    serverComponentsExternalPackages: ['pdfjs-dist'],
  },
  webpack: (config, { isServer }) => {
    // Handle TypeScript path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    
    // Handle PDF.js worker
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        canvas: false,
      }
    }
    
    // Handle PDF.js
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource',
    })
    
    return config
  },
}

module.exports = nextConfig
