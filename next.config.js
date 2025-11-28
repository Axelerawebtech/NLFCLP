/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Temporarily disable ESLint during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable Next.js's built-in image optimization warnings
  images: {
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: ['formidable']
  }
}

module.exports = nextConfig
