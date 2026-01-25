const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    mdxRs: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporário: ignorar erros de TS no build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporário: ignorar ESLint no build
  },
}

export default nextConfig
