import type { NextConfig } from 'next'

// Content Security Policy permissiva (compatível com Next 15 dev/prod, Vercel Analytics, Material Symbols).
// Endurecimento (com nonces) fica para PR de hardening posterior.
const buildContentSecurityPolicy = (): string =>
  [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://vercel.live wss://ws-us3.pusher.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
  },
]

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
  experimental: {
    mdxRs: true,
  },
  // Expõe metadados de build (commit/branch) para o easter egg do Konami code.
  // Apenas dados não sensíveis, todos já públicos no GitHub do repo.
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? '',
    NEXT_PUBLIC_VERCEL_DEPLOYMENT_CREATED_AT:
      process.env.VERCEL_DEPLOYMENT_ID ? new Date().toISOString() : '',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
