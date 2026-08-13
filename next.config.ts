import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.150.73'],
  output: 'export',
  images: {
    unoptimized: true
  }
}

export default nextConfig
