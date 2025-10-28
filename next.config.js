/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Moved from experimental.serverComponentsExternalPackages to serverExternalPackages
  serverExternalPackages: ['formidable']
}

module.exports = nextConfig
