/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/habitflow-ai-web' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/habitflow-ai-web' : '',
}

module.exports = nextConfig


