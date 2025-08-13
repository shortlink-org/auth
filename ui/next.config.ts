import type { NextConfig } from "next"

// ENVIRONMENT VARIABLE ================================================================================================
const isProd = process.env.NODE_ENV === "production"
const AUTH_URI = process.env.AUTH_URI || "http://127.0.0.1:4433"

const nextConfig: NextConfig = {
  basePath: '/auth',
  reactStrictMode: true,
  generateEtags: false,
  output: 'export',
  compress: isProd,
  productionBrowserSourceMaps: isProd,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@shortlink-org/ui-kit'],
  compiler: {
    // ssr and displayName are configured by default
    emotion: true,
  },
  trailingSlash: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  bundlePagesRouterDependencies: true,
  experimental: {
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
    clientTraceMetadata: ['sentry-trace', 'baggage'],
    // reactCompiler: true,
    // typedRoutes: true,
  },
  // If you truly need a CDN path for static assets only, set assetPrefix as well,
  // but usually basePath is sufficient for an app mounted at /auth.
  // async rewrites() {
  //   if (isProd) return []
  //   // Proxy ORY Kratos locally; basePath is stripped for matching due to basePath: false.
  //   return {
  //     beforeFiles: [
  //       {
  //         source: '/api/auth/:uri*',
  //         destination: `${AUTH_URI}/api/auth/:uri*`,
  //       },
  //     ],
  //   }
  // },
}

export default nextConfig
