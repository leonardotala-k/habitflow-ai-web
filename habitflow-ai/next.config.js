/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: '/habitflow-ai-web',
  basePath: '/habitflow-ai-web',
}

module.exports = nextConfig




