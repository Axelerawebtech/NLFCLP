/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  experimental: {
    // Increase body size limit for video uploads
    serverComponentsExternalPackages: ['formidable']
  }
}

module.exports = nextConfig
